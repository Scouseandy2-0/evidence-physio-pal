import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  FileText, 
  RefreshCw, 
  ArrowLeft, 
  TrendingUp,
  AlertTriangle,
  Info,
  Download,
  Share
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssessmentTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  scoring_method: string;
  interpretation_guide: any;
  psychometric_properties: any;
  reference_values: any;
  instructions: string;
  condition_ids: string[];
}

interface AssessmentResultProps {
  tool: AssessmentTool;
  data: any;
  onRestart: () => void;
  onBackToLibrary: () => void;
}

export const AssessmentResult = ({ tool, data, onRestart, onBackToLibrary }: AssessmentResultProps) => {
  const { toast } = useToast();

  const handleExportResults = () => {
    const reportData = {
      assessment: tool.name,
      patient: data.patient_info,
      results: data.score,
      interpretation: data.interpretation,
      completed_at: data.completed_at,
      questions_and_answers: data.questions_and_answers
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.name.replace(/\s+/g, '_')}_${data.patient_info.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Results Exported",
      description: "Assessment results have been downloaded as JSON file",
    });
  };

  const handleShareResults = () => {
    const shareText = `Assessment: ${tool.name}\nPatient: ${data.patient_info.name}\nScore: ${data.score.raw_score}/${data.score.max_score} (${data.score.percentage}%)\nInterpretation: ${data.interpretation.level}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${tool.name} Assessment Results`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Results Copied",
        description: "Assessment results copied to clipboard",
      });
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  const getRecommendations = (interpretation: any) => {
    switch (interpretation.level) {
      case 'Severe':
        return [
          'Immediate referral to specialist may be required',
          'Consider comprehensive treatment plan',
          'Monitor closely for changes',
          'Patient education on condition management'
        ];
      case 'Moderate':
        return [
          'Structured physiotherapy intervention recommended',
          'Regular monitoring and reassessment',
          'Home exercise program development',
          'Lifestyle modifications may be beneficial'
        ];
      case 'Mild':
        return [
          'Conservative management approach',
          'Preventive strategies and education',
          'Regular follow-up assessments',
          'Activity modification as needed'
        ];
      default:
        return [
          'Continue current management',
          'Preventive care and wellness strategies',
          'Regular monitoring for early detection',
          'Maintain current activity levels'
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-medical-green">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-medical-green/10">
              <CheckCircle className="h-6 w-6 text-medical-green" />
            </div>
            <div>
              <CardTitle className="text-xl">Assessment Complete</CardTitle>
              <p className="text-muted-foreground">
                {tool.name} for {data.patient_info.name}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className={`text-3xl font-bold ${getScoreColor(data.score.percentage)}`}>
                {data.score.raw_score}
              </div>
              <div className="text-sm text-muted-foreground">Raw Score</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className={`text-3xl font-bold ${getScoreColor(data.score.percentage)}`}>
                {data.score.percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Percentage</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Badge className={`${data.interpretation.color} text-white text-sm px-3 py-1`}>
                {data.interpretation.level}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">Severity Level</div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Clinical Interpretation</h4>
                <p className="text-blue-800 text-sm">{data.interpretation.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.questions_and_answers.map((qa: any, index: number) => (
              <div key={index} className="p-3 rounded-lg border bg-muted/30">
                <div className="font-medium text-sm mb-1">{qa.question}</div>
                <div className="text-sm text-muted-foreground">{qa.answer}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Clinical Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getRecommendations(data.interpretation).map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-blue mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {data.patient_info.name}
            </div>
            <div>
              <span className="font-medium">Age:</span> {data.patient_info.age}
            </div>
            {data.patient_info.gender && (
              <div>
                <span className="font-medium">Gender:</span> {data.patient_info.gender}
              </div>
            )}
            <div>
              <span className="font-medium">Assessment Date:</span> {new Date(data.completed_at).toLocaleDateString()}
            </div>
          </div>
          {data.patient_info.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <span className="font-medium">Notes:</span>
                <p className="text-sm text-muted-foreground mt-1">{data.patient_info.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" onClick={onBackToLibrary}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <Button variant="outline" onClick={onRestart}>
          <RefreshCw className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
        <Button variant="outline" onClick={handleExportResults}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
        <Button variant="outline" onClick={handleShareResults}>
          <Share className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </div>
  );
};