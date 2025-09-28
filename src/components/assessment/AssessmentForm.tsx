import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssessmentTool {
  id: string;
  name: string;
  description: string | null;
  tool_type: string | null;
  scoring_method: string | null;
  interpretation_guide: any;
  psychometric_properties: any;
  reference_values: any;
  instructions: string | null;
  condition_ids: string[];
}

interface AssessmentFormProps {
  tool: AssessmentTool;
  onComplete: (data: any) => void;
  onBack: () => void;
}

// Common assessment questions based on tool type
const getQuestions = (toolType: string) => {
  const baseQuestions = [
    {
      id: 'pain_level',
      text: 'Rate your current pain level (0-10 scale)',
      type: 'number',
      min: 0,
      max: 10,
      required: true
    },
    {
      id: 'functional_difficulty',
      text: 'How much difficulty do you have with daily activities?',
      type: 'radio',
      options: [
        { value: '0', label: 'No difficulty' },
        { value: '1', label: 'Mild difficulty' },
        { value: '2', label: 'Moderate difficulty' },
        { value: '3', label: 'Severe difficulty' },
        { value: '4', label: 'Unable to perform' }
      ],
      required: true
    }
  ];

  if (toolType?.toLowerCase().includes('self-report') || toolType?.toLowerCase().includes('questionnaire')) {
    return [
      ...baseQuestions,
      {
        id: 'sleep_quality',
        text: 'How would you rate your sleep quality over the past week?',
        type: 'radio',
        options: [
          { value: '4', label: 'Excellent' },
          { value: '3', label: 'Good' },
          { value: '2', label: 'Fair' },
          { value: '1', label: 'Poor' },
          { value: '0', label: 'Very poor' }
        ],
        required: true
      },
      {
        id: 'mood_impact',
        text: 'How much has your condition affected your mood?',
        type: 'radio',
        options: [
          { value: '0', label: 'Not at all' },
          { value: '1', label: 'Slightly' },
          { value: '2', label: 'Moderately' },
          { value: '3', label: 'Quite a bit' },
          { value: '4', label: 'Extremely' }
        ],
        required: true
      },
      {
        id: 'work_impact',
        text: 'How much has your condition interfered with your work or daily activities?',
        type: 'radio',
        options: [
          { value: '0', label: 'Not at all' },
          { value: '1', label: 'A little bit' },
          { value: '2', label: 'Moderately' },
          { value: '3', label: 'Quite a bit' },
          { value: '4', label: 'Extremely' }
        ],
        required: true
      }
    ];
  }

  if (toolType?.toLowerCase().includes('performance') || toolType?.toLowerCase().includes('objective')) {
    return [
      ...baseQuestions,
      {
        id: 'balance_test',
        text: 'Single leg stance time (seconds)',
        type: 'number',
        min: 0,
        max: 120,
        required: true
      },
      {
        id: 'walking_speed',
        text: 'Comfortable walking speed (meters per minute)',
        type: 'number',
        min: 0,
        max: 200,
        required: true
      },
      {
        id: 'range_of_motion',
        text: 'Joint range of motion (degrees)',
        type: 'number',
        min: 0,
        max: 180,
        required: true
      }
    ];
  }

  return baseQuestions;
};

export const AssessmentForm = ({ tool, onComplete, onBack }: AssessmentFormProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    notes: ''
  });
  const [showPatientInfo, setShowPatientInfo] = useState(true);
  const { toast } = useToast();

  const questions = getQuestions(tool.tool_type || '');
  const totalSteps = questions.length + 1; // +1 for patient info
  const currentStep = showPatientInfo ? 1 : currentQuestionIndex + 2;
  const progress = (currentStep / totalSteps) * 100;

  const handlePatientInfoSubmit = () => {
    if (!patientInfo.name || !patientInfo.age) {
      toast({
        title: "Required Information",
        description: "Please provide patient name and age",
        variant: "destructive",
      });
      return;
    }
    setShowPatientInfo(false);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: value
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      toast({
        title: "Answer Required",
        description: "Please answer this question before continuing",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setShowPatientInfo(true);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const score = parseInt(answer) || 0;
        totalScore += score;
        
        if (question.type === 'radio') {
          maxScore += Math.max(...question.options!.map(opt => parseInt(opt.value)));
        } else if (question.type === 'number') {
          maxScore += question.max || 10;
        }
      }
    });

    return {
      raw_score: totalScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      max_score: maxScore
    };
  };

  const getInterpretation = (score: any) => {
    const percentage = score.percentage;
    
    if (percentage >= 80) {
      return {
        level: 'Severe',
        color: 'bg-red-500',
        description: 'Significant impairment requiring immediate attention'
      };
    } else if (percentage >= 60) {
      return {
        level: 'Moderate',
        color: 'bg-yellow-500',
        description: 'Moderate impairment with functional limitations'
      };
    } else if (percentage >= 40) {
      return {
        level: 'Mild',
        color: 'bg-blue-500',
        description: 'Mild impairment with minimal functional impact'
      };
    } else {
      return {
        level: 'Minimal',
        color: 'bg-green-500',
        description: 'Minimal impairment with good functional capacity'
      };
    }
  };

  const handleComplete = () => {
    const score = calculateScore();
    const interpretation = getInterpretation(score);
    
    const completedAssessment = {
      patient_info: patientInfo,
      tool_id: tool.id,
      tool_name: tool.name,
      answers,
      score,
      interpretation,
      completed_at: new Date().toISOString(),
      questions_and_answers: questions.map(q => ({
        question: q.text,
        answer: answers[q.id] || 'Not answered',
        question_id: q.id
      }))
    };
    
    onComplete(completedAssessment);
  };

  if (showPatientInfo) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Patient Name *</Label>
                <Input
                  id="name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <RadioGroup
                  value={patientInfo.gender}
                  onValueChange={(value) => setPatientInfo(prev => ({ ...prev, gender: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={patientInfo.notes}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes or relevant information"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handlePatientInfoSubmit} className="flex-1">
            Continue to Assessment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={handleAnswerChange}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'number' && (
            <div>
              <Input
                type="number"
                min={currentQuestion.min}
                max={currentQuestion.max}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={`Enter value (${currentQuestion.min}-${currentQuestion.max})`}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Range: {currentQuestion.min} - {currentQuestion.max}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={handlePrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {currentQuestionIndex === questions.length - 1 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Assessment
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};