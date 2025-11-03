import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Database, 
  FileCheck, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from "lucide-react";

interface GenerationResults {
  totalConditions: number;
  processedConditions: number;
  generatedProtocols: number;
  errors: string[];
}

export const ProtocolGenerator = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResults | null>(null);
  const [currentCondition, setCurrentCondition] = useState<string>("");
  const { toast } = useToast();
  const { trackProtocolCreated } = useActivityTracking();


  const generateAllProtocols = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(null);
    setCurrentCondition("Generating via server...");

    try {
      // Call single edge function that handles batching & generation server-side
      const { data, error } = await supabase.functions.invoke('generate-condition-protocols', {});

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      const res = data?.results ?? {
        totalConditions: 0,
        processedConditions: 0,
        generatedProtocols: 0,
        errors: [] as string[],
      };

      setResults(res);
      setProgress(100);
      setCurrentCondition("Completed");

      console.log('Generation complete (server-side):', res);

      // Track protocol creation (only if logged in)
      if (user) {
        for (let i = 0; i < (res.generatedProtocols ?? 0); i++) {
          await trackProtocolCreated();
        }
      }

      if ((res.errors?.length ?? 0) === 0) {
        toast({
          title: "Protocol Generation Complete",
          description: `Successfully generated ${res.generatedProtocols} evidence-based protocols`,
        });
      } else {
        toast({
          title: "Protocol Generation Finished with Errors",
          description: `Generated ${res.generatedProtocols}. ${res.errors.length} condition(s) had errors.`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Protocol generation error:', error);
      setCurrentCondition("Failed");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate protocols",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI-Powered Protocol Generation
          </CardTitle>
          <CardDescription>
            Generate comprehensive, evidence-based treatment protocols for all conditions using the latest research from PubMed, Cochrane, and PEDro databases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-semibold">Multiple Evidence Sources</h4>
                <p className="text-sm text-muted-foreground">PubMed, Cochrane, PEDro</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <h4 className="font-semibold">AI Synthesis</h4>
                <p className="text-sm text-muted-foreground">GPT-4 powered analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <FileCheck className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-semibold">Evidence-Based</h4>
                <p className="text-sm text-muted-foreground">Clinically validated protocols</p>
              </div>
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Processing: {currentCondition}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{results.totalConditions}</p>
                        <p className="text-sm text-muted-foreground">Total Conditions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{results.generatedProtocols}</p>
                        <p className="text-sm text-muted-foreground">Protocols Generated</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">{results.errors.length}</p>
                        <p className="text-sm text-muted-foreground">Errors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {results.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">Generation Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.errors.map((error, index) => (
                        <Badge key={index} variant="outline" className="text-orange-600">
                          {error}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={generateAllProtocols}
              disabled={isGenerating}
              size="lg"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Protocols...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate All Evidence-Based Protocols
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Searches PubMed, Cochrane, and PEDro for latest evidence on each condition</li>
              <li>Uses AI to synthesize research into comprehensive treatment protocols</li>
              <li>Generates phase-based protocols with specific interventions and outcomes</li>
              <li>Includes contraindications, precautions, and discharge criteria</li>
              <li>Links protocols to supporting evidence for validation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};