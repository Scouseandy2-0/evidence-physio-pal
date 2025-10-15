import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResults | null>(null);
  const [currentCondition, setCurrentCondition] = useState<string>("");
  const { toast } = useToast();

  const generateAllProtocols = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults(null);
    setCurrentCondition("Initializing...");

    try {
      // Fetch all conditions and process one-by-one to avoid Edge Function timeouts
      const { data: conditions, error: condErr } = await supabase
        .from('conditions')
        .select('id, name')
        .order('name');

      if (condErr) {
        console.error('Failed to fetch conditions:', condErr);
        throw new Error('Could not load conditions from database');
      }

      const total = conditions?.length || 0;
      let processed = 0;
      let generated = 0;
      const errors: string[] = [];

      console.log(`Starting protocol generation for ${total} conditions`);

      // Process in batches (backend processes 3 at once)
      const DISPLAY_BATCH_SIZE = 3;
      for (let i = 0; i < conditions.length; i += DISPLAY_BATCH_SIZE) {
        const batch = conditions.slice(i, Math.min(i + DISPLAY_BATCH_SIZE, conditions.length));
        
        // Process batch
        const batchPromises = batch.map(async (condition) => {
          setCurrentCondition(condition.name);
          console.log(`[${i + batch.indexOf(condition) + 1}/${total}] Processing: ${condition.name}`);
          
          try {
            const { data, error } = await supabase.functions.invoke('generate-condition-protocols', {
              body: { conditionId: condition.id }
            });
            
            if (error) {
              console.error(`Error for ${condition.name}:`, error);
              errors.push(`${condition.name}: ${error.message || 'invoke error'}`);
              return 0;
            } else if (data?.error) {
              console.error(`Data error for ${condition.name}:`, data.error);
              errors.push(`${condition.name}: ${data.error}`);
              return 0;
            } else {
              const genCount = data?.results?.generatedProtocols ?? 0;
              console.log(`✓ ${condition.name}: Generated ${genCount} protocol(s)`);
              return genCount;
            }
          } catch (e: any) {
            console.error(`Exception for ${condition.name}:`, e);
            errors.push(`${condition.name}: ${e?.message || 'request failed'}`);
            return 0;
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        generated += batchResults.reduce((sum, count) => sum + count, 0);
        processed += batch.length;
        
        const newProgress = Math.round((processed / total) * 100);
        setProgress(newProgress);
        console.log(`Batch ${Math.floor(i / DISPLAY_BATCH_SIZE) + 1} complete. Progress: ${processed}/${total} (${newProgress}%)`);
      }

      const finalResults = { 
        totalConditions: total, 
        processedConditions: processed, 
        generatedProtocols: generated, 
        errors 
      };
      
      setResults(finalResults);
      setCurrentCondition("Completed");
      
      console.log('Generation complete:', finalResults);

      if (errors.length === 0) {
        toast({
          title: "Protocol Generation Complete",
          description: `Successfully generated ${generated} evidence-based protocols`,
        });
      } else {
        toast({
          title: "Protocol Generation Finished with Errors",
          description: `Generated ${generated} protocols. ${errors.length} condition(s) had errors.`,
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