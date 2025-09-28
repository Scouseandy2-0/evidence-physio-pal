import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import {
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  FileText
} from "lucide-react";

interface AssessmentTool {
  id: string;
  name: string;
  description: string | null;
  tool_type: string | null;
  scoring_method: string | null;
  instructions: string | null;
  psychometric_properties: any;
  interpretation_guide: any;
}

interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'radio' | 'number' | 'scale';
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
}

interface AssessmentSession {
  tool: AssessmentTool;
  patientInfo: {
    name: string;
    age: number;
    condition: string;
  };
  responses: Record<string, any>;
  score: number;
  interpretation: string;
  completed: boolean;
}

interface InteractiveAssessmentEngineProps {
  toolId: string;
  onComplete?: (session: AssessmentSession) => void;
  onBack?: () => void;
}

export const InteractiveAssessmentEngine = ({ 
  toolId, 
  onComplete, 
  onBack 
}: InteractiveAssessmentEngineProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackAssessmentCompleted } = useActivityTracking();
  const [tool, setTool] = useState<AssessmentTool | null>(null);
  const [currentStep, setCurrentStep] = useState<'info' | 'assessment' | 'results'>('info');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: 0,
    condition: ''
  });
  
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [session, setSession] = useState<AssessmentSession | null>(null);

  const questions: AssessmentQuestion[] = generateQuestionsForTool(tool);

  useEffect(() => {
    fetchAssessmentTool();
  }, [toolId]);

  const fetchAssessmentTool = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) throw error;

      setTool(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load assessment tool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  function generateQuestionsForTool(tool: AssessmentTool | null): AssessmentQuestion[] {
    if (!tool) return [];

    // Generate questions based on tool type
    const baseQuestions: AssessmentQuestion[] = [];

    if (tool.tool_type === 'pain_assessment') {
      baseQuestions.push(
        {
          id: 'pain_intensity',
          text: 'Rate your current pain intensity (0 = no pain, 10 = worst pain imaginable)',
          type: 'scale',
          min: 0,
          max: 10,
          required: true
        },
        {
          id: 'pain_location',
          text: 'Where is your pain located?',
          type: 'radio',
          options: ['Lower back', 'Upper back', 'Neck', 'Shoulder', 'Hip', 'Knee', 'Ankle', 'Other'],
          required: true
        },
        {
          id: 'pain_frequency',
          text: 'How often do you experience this pain?',
          type: 'radio',
          options: ['Constant', 'Frequent (daily)', 'Occasional (few times per week)', 'Rare (few times per month)'],
          required: true
        }
      );
    } else if (tool.tool_type === 'functional_assessment') {
      baseQuestions.push(
        {
          id: 'daily_activities',
          text: 'Rate your ability to perform daily activities (0 = unable, 10 = no difficulty)',
          type: 'scale',
          min: 0,
          max: 10,
          required: true
        },
        {
          id: 'mobility_level',
          text: 'What best describes your current mobility?',
          type: 'radio',
          options: ['Independent', 'Uses assistive device', 'Requires assistance', 'Wheelchair dependent'],
          required: true
        }
      );
    } else if (tool.tool_type === 'balance_assessment') {
      baseQuestions.push(
        {
          id: 'balance_confidence',
          text: 'Rate your confidence in maintaining balance (0 = no confidence, 10 = completely confident)',
          type: 'scale',
          min: 0,
          max: 10,
          required: true
        },
        {
          id: 'fall_history',
          text: 'Have you fallen in the past 6 months?',
          type: 'radio',
          options: ['No falls', '1-2 falls', '3-5 falls', 'More than 5 falls'],
          required: true
        }
      );
    }

    // Add common questions
    baseQuestions.push(
      {
        id: 'symptom_duration',
        text: 'How long have you been experiencing these symptoms?',
        type: 'radio',
        options: ['Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', 'More than 6 months'],
        required: true
      },
      {
        id: 'previous_treatment',
        text: 'Have you received treatment for this condition before?',
        type: 'radio',
        options: ['No previous treatment', 'Physical therapy', 'Medication', 'Surgery', 'Other treatments'],
        required: true
      }
    );

    return baseQuestions;
  }

  const calculateScore = (): { score: number; interpretation: string } => {
    if (!tool || questions.length === 0) return { score: 0, interpretation: 'Unable to calculate score' };

    let totalScore = 0;
    let maxPossibleScore = 0;

    questions.forEach(question => {
      const response = responses[question.id];
      if (response !== undefined) {
        if (question.type === 'scale') {
          totalScore += parseInt(response);
          maxPossibleScore += question.max || 10;
        } else if (question.type === 'radio' && question.options) {
          // Simple scoring for radio options (index-based)
          const optionIndex = question.options.indexOf(response);
          totalScore += optionIndex >= 0 ? optionIndex : 0;
          maxPossibleScore += question.options.length - 1;
        }
      }
    });

    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    let interpretation = '';
    if (percentage < 25) {
      interpretation = 'Minimal impairment - Continue current activities with monitoring';
    } else if (percentage < 50) {
      interpretation = 'Mild impairment - Consider preventive interventions';
    } else if (percentage < 75) {
      interpretation = 'Moderate impairment - Active intervention recommended';
    } else {
      interpretation = 'Severe impairment - Immediate comprehensive treatment required';
    }

    return { score: totalScore, interpretation };
  };

  const handleStartAssessment = () => {
    if (!patientInfo.name || !patientInfo.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and age",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('assessment');
  };

  const handleQuestionResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.required && !responses[currentQuestion.id]) {
      toast({
        title: "Response Required",
        description: "Please answer this question before continuing",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete assessment
      const { score, interpretation } = calculateScore();
      const completedSession: AssessmentSession = {
        tool: tool!,
        patientInfo,
        responses,
        score,
        interpretation,
        completed: true
      };
      setSession(completedSession);
      setCurrentStep('results');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const saveAssessment = async () => {
    if (!session || !user) return;

    setSaving(true);
    try {
      // Track assessment completion
      await trackAssessmentCompleted();

      toast({
        title: "Assessment Saved",
        description: "Assessment results have been recorded",
      });

      if (onComplete) {
        onComplete(session);
      }
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assessment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!tool) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-muted-foreground">Assessment tool not found</p>
        </CardContent>
      </Card>
    );
  }

  const progress = currentStep === 'info' ? 0 : 
                  currentStep === 'assessment' ? ((currentQuestionIndex + 1) / questions.length) * 100 : 
                  100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {tool.name}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Patient Information */}
      {currentStep === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Please provide basic patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-age">Age</Label>
                <Input
                  id="patient-age"
                  type="number"
                  value={patientInfo.age || ''}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter age"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-condition">Primary Condition</Label>
              <Input
                id="patient-condition"
                value={patientInfo.condition}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="Enter primary condition or diagnosis"
              />
            </div>
            <Button onClick={handleStartAssessment} className="w-full">
              Start Assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Assessment Questions */}
      {currentStep === 'assessment' && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            <CardDescription>
              {questions[currentQuestionIndex].text}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions[currentQuestionIndex].type === 'radio' && (
              <RadioGroup
                value={responses[questions[currentQuestionIndex].id] || ''}
                onValueChange={(value) => handleQuestionResponse(questions[currentQuestionIndex].id, value)}
              >
                {questions[currentQuestionIndex].options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {questions[currentQuestionIndex].type === 'scale' && (
              <div className="space-y-4">
                <Input
                  type="range"
                  min={questions[currentQuestionIndex].min || 0}
                  max={questions[currentQuestionIndex].max || 10}
                  value={responses[questions[currentQuestionIndex].id] || 0}
                  onChange={(e) => handleQuestionResponse(questions[currentQuestionIndex].id, e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{questions[currentQuestionIndex].min || 0}</span>
                  <span className="font-medium">
                    Current: {responses[questions[currentQuestionIndex].id] || 0}
                  </span>
                  <span>{questions[currentQuestionIndex].max || 10}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentStep === 'results' && session && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Assessment Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{session.score}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-medium">{session.patientInfo.name}</div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-medium">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">Date</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Clinical Interpretation</h4>
                <p className="text-sm">{session.interpretation}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveAssessment} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Results
                    </>
                  )}
                </Button>
                {onComplete && (
                  <Button variant="outline" onClick={() => onComplete(session)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};