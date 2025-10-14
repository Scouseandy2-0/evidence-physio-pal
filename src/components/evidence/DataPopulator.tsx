import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Database, 
  Search, 
  BookOpen, 
  FileText, 
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import JSON5 from "json5";

interface PopulationTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  results?: any;
  error?: string;
}

export const DataPopulator = () => {
  const [tasks, setTasks] = useState<PopulationTask[]>([
    {
      id: 'generate-additional-conditions',
      name: 'Generate Additional Conditions',
      description: 'Use AI to create comprehensive condition database with respiratory conditions',
      status: 'pending',
      progress: 0
    },
    {
      id: 'populate-pubmed',
      name: 'PubMed Research',
      description: 'Fetch latest research from PubMed for all conditions',
      status: 'pending',
      progress: 0
    },
    {
      id: 'populate-cochrane',
      name: 'Cochrane Reviews',
      description: 'Get systematic reviews from Cochrane database',
      status: 'pending',
      progress: 0
    },
    {
      id: 'populate-pedro',
      name: 'PEDro Studies',
      description: 'Fetch high-quality physiotherapy trials from PEDro',
      status: 'pending',
      progress: 0
    },
    {
      id: 'populate-nice',
      name: 'NICE Guidelines',
      description: 'Get clinical practice guidelines from NICE',
      status: 'pending',
      progress: 0
    },
    {
      id: 'generate-assessment-tools',
      name: 'Assessment Tools',
      description: 'Create comprehensive assessment tool library using AI',
      status: 'pending',
      progress: 0
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const updateTaskStatus = (taskId: string, updates: Partial<PopulationTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const generateAdditionalConditions = async () => {
    updateTaskStatus('generate-additional-conditions', { status: 'running', progress: 10 });
    
    try {
      // Generate respiratory conditions using ChatGPT
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Generate 8 comprehensive respiratory physiotherapy conditions in JSON format. Each condition should have:
            - name: string (condition name)
            - category: "respiratory" 
            - description: string (detailed clinical description)
            - icd_codes: string[] (relevant ICD codes)
            - keywords: string[] (clinical keywords)
            - prevalence_data: object (with prevalence statistics)
            
            Focus on conditions like COPD, Asthma, Pneumonia, Pulmonary Fibrosis, etc.
            Return ONLY valid JSON array format.`
          }],
          context: 'Generate respiratory physiotherapy conditions for clinical database',
          specialty: 'respiratory'
        }
      });

      if (error) throw error;

      updateTaskStatus('generate-additional-conditions', { progress: 50 });

      // Parse and insert conditions
      try {
        const conditionsData = JSON.parse(data.response);
        
        for (const condition of conditionsData) {
          const { error: insertError } = await supabase
            .from('conditions')
            .insert(condition);
          
          if (insertError) {
            console.error('Error inserting condition:', insertError);
          }
        }

        updateTaskStatus('generate-additional-conditions', { 
          status: 'completed', 
          progress: 100,
          results: `Generated ${conditionsData.length} respiratory conditions`
        });
      } catch (parseError) {
        throw new Error('Failed to parse AI response');
      }

    } catch (error: any) {
      updateTaskStatus('generate-additional-conditions', { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const populateDatabase = async (database: string, taskId: string) => {
    updateTaskStatus(taskId, { status: 'running', progress: 0 });

    try {
      // Get all conditions
      const { data: conditions, error: conditionsError } = await supabase
        .from('conditions')
        .select('*');

      if (conditionsError) throw conditionsError;

      const totalConditions = conditions.length;
      let processedConditions = 0;

      for (const condition of conditions) {
        try {
          let result;
          
          switch (database) {
            case 'pubmed':
              result = await supabase.functions.invoke('pubmed-integration', {
                body: { 
                  searchTerms: condition.name,
                  maxResults: 5,
                  dateRange: 'recent'
                }
              });
              break;
              
            case 'cochrane':
              result = await supabase.functions.invoke('cochrane-integration', {
                body: { 
                  searchTerms: condition.name,
                  maxResults: 3
                }
              });
              break;
              
            case 'pedro':
              result = await supabase.functions.invoke('pedro-integration', {
                body: { 
                  searchTerms: condition.name,
                  condition: condition.name,
                  maxResults: 3
                }
              });
              break;
              
            case 'nice':
              result = await supabase.functions.invoke('guidelines-integration', {
                body: { 
                  searchTerms: condition.name,
                  organization: 'nice'
                }
              });
              break;
          }

          processedConditions++;
          const progress = Math.round((processedConditions / totalConditions) * 100);
          updateTaskStatus(taskId, { progress });

          // Small delay to prevent overwhelming the APIs
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error processing ${condition.name} for ${database}:`, error);
        }
      }

      updateTaskStatus(taskId, { 
        status: 'completed', 
        progress: 100,
        results: `Processed ${processedConditions} conditions`
      });

    } catch (error: any) {
      updateTaskStatus(taskId, { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const generateAssessmentTools = async () => {
    updateTaskStatus('generate-assessment-tools', { status: 'running', progress: 10 });
    
    try {
      // Get all conditions to create tools for
      const { data: conditions, error: conditionsError } = await supabase
        .from('conditions')
        .select('*');

      if (conditionsError) throw conditionsError;

      updateTaskStatus('generate-assessment-tools', { progress: 30 });

      // Generate assessment tools using AI
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Generate 20 comprehensive physiotherapy assessment tools. Return your response as a valid JSON array ONLY - no explanations, no markdown, just the JSON array.

Each object in the array must have these exact fields:
{
  "name": "Tool Name (e.g., Oswestry Disability Index)",
  "description": "What it measures",
  "tool_type": "questionnaire or performance test",
  "scoring_method": "How it's scored",
  "condition_ids": [],
  "interpretation_guide": {"low": "0-20", "moderate": "21-40", "high": "41-100"},
  "psychometric_properties": {"reliability": "High", "validity": "Established"},
  "reference_values": {"normal": "0-20", "mild": "21-40"},
  "instructions": "How to administer the test"
}

Include well-known tools like DASH, NDI, Oswestry, Berg Balance Scale, 6MWT, Timed Up and Go, etc.

CRITICAL: Return ONLY the JSON array starting with [ and ending with ]. No other text.`
          }],
          context: 'Generate physiotherapy assessment tools for clinical database',
          specialty: 'physiotherapy'
        }
      });

      if (error) throw error;

      updateTaskStatus('generate-assessment-tools', { progress: 70 });

      // Parse and insert assessment tools
      try {
        let responseText = data.response;
        
        // Extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          responseText = jsonMatch[1];
        } else {
          // Try to find JSON array in the response
          const arrayMatch = responseText.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            responseText = arrayMatch[0];
          }
        }
        
        // Clean up the response text
        responseText = responseText
          .trim()
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/\r\n/g, '\n')
          .replace(/^\s+|\s+$/gm, '');
        
        console.log('Parsing assessment tools response:', responseText.substring(0, 300));
        
        let toolsData: any;
        try {
          toolsData = JSON.parse(responseText);
        } catch (e1) {
          console.log('Standard JSON parse failed, trying JSON5:', e1);
          try {
            toolsData = JSON5.parse(responseText);
          } catch (e2: any) {
            console.error('Both JSON and JSON5 parsing failed:', e2);
            console.error('Response text:', responseText);
            throw new Error(`Failed to parse AI response: ${e2.message}`);
          }
        }
        
        if (!Array.isArray(toolsData)) {
          throw new Error('AI response is not a valid array');
        }
        
        let successCount = 0;
        for (const tool of toolsData) {
          const { error: insertError } = await supabase
            .from('assessment_tools')
            .insert(tool);
          
          if (insertError) {
            console.error('Error inserting assessment tool:', insertError);
          } else {
            successCount++;
          }
        }

        updateTaskStatus('generate-assessment-tools', { 
          status: 'completed', 
          progress: 100,
          results: `Generated ${successCount}/${toolsData.length} assessment tools`
        });
      } catch (parseError: any) {
        console.error('Parse error details:', parseError, 'Response:', data.response?.substring(0, 500));
        throw new Error(`Failed to parse AI response: ${parseError.message}. Check console for details.`);
      }

    } catch (error: any) {
      updateTaskStatus('generate-assessment-tools', { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const runAllTasks = async () => {
    setIsRunning(true);
    
    try {
      // Run tasks sequentially to avoid overwhelming the system
      await generateAdditionalConditions();
      await populateDatabase('pubmed', 'populate-pubmed');
      await populateDatabase('cochrane', 'populate-cochrane');
      await populateDatabase('pedro', 'populate-pedro');
      await populateDatabase('nice', 'populate-nice');
      await generateAssessmentTools();
      
      toast({
        title: "Population Complete!",
        description: "Successfully populated all condition modules with comprehensive data",
      });
    } catch (error: any) {
      toast({
        title: "Population Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTask = async (taskId: string) => {
    switch (taskId) {
      case 'generate-additional-conditions':
        await generateAdditionalConditions();
        break;
      case 'populate-pubmed':
        await populateDatabase('pubmed', taskId);
        break;
      case 'populate-cochrane':
        await populateDatabase('cochrane', taskId);
        break;
      case 'populate-pedro':
        await populateDatabase('pedro', taskId);
        break;
      case 'populate-nice':
        await populateDatabase('nice', taskId);
        break;
      case 'generate-assessment-tools':
        await generateAssessmentTools();
        break;
    }
  };

  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'generate-additional-conditions': return <Brain className="h-4 w-4" />;
      case 'populate-pubmed': return <Search className="h-4 w-4" />;
      case 'populate-cochrane': return <BookOpen className="h-4 w-4" />;
      case 'populate-pedro': return <Database className="h-4 w-4" />;
      case 'populate-nice': return <FileText className="h-4 w-4" />;
      case 'generate-assessment-tools': return <Sparkles className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Population Manager
          </CardTitle>
          <CardDescription>
            Populate condition modules with comprehensive evidence from ChatGPT, PubMed, Cochrane, PEDro, and NICE databases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={runAllTasks} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isRunning ? 'Running All Tasks...' : 'Run All Tasks'}
            </Button>
            
            <Badge variant="outline">
              {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTaskIcon(task.id)}
                  <CardTitle className="text-sm">{task.name}</CardTitle>
                </div>
                {getStatusIcon(task.status)}
              </div>
              <CardDescription className="text-xs">
                {task.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={task.progress} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {task.progress}% complete
                </span>
                <Button
                  onClick={() => runSingleTask(task.id)}
                  disabled={task.status === 'running' || isRunning}
                  size="sm"
                  variant="outline"
                >
                  {task.status === 'running' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Run'
                  )}
                </Button>
              </div>

              {task.results && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  ✓ {task.results}
                </div>
              )}

              {task.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  ✗ {task.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};