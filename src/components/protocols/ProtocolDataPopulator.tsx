import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const ProtocolDataPopulator = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const { user } = useAuth();
  // Basic schema validation for protocol JSON
  const validateProtocol = (data: any) => {
    const required = [
      'name','description','protocol_steps','duration_weeks','frequency_per_week','contraindications','precautions','expected_outcomes'
    ];
    for (const key of required) {
      if (!(key in data)) return { valid: false, reason: `Missing key: ${key}` };
    }
    if (!Array.isArray(data.protocol_steps)) return { valid: false, reason: 'protocol_steps must be an array' };
    if (typeof data.duration_weeks !== 'number') return { valid: false, reason: 'duration_weeks must be a number' };
    if (typeof data.frequency_per_week !== 'number') return { valid: false, reason: 'frequency_per_week must be a number' };
    if (!Array.isArray(data.contraindications)) return { valid: false, reason: 'contraindications must be an array' };
    if (!Array.isArray(data.precautions)) return { valid: false, reason: 'precautions must be an array' };
    return { valid: true };
  };
  const [populatedCount, setPopulatedCount] = useState(0);

  const generateTreatmentProtocol = async (condition: any) => {
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Create a detailed evidence-based treatment protocol for ${condition.name}. Include:
            
            1. Protocol name (max 100 chars)
            2. Detailed description (2-3 paragraphs)
            3. Step-by-step protocol with specific exercises/interventions (return as JSON array)
            4. Duration in weeks (number)
            5. Frequency per week (number)
            6. Contraindications (array of strings)
            7. Precautions (array of strings)
            8. Expected outcomes (detailed paragraph)
            
            Return ONLY a valid JSON object with these exact keys: name, description, protocol_steps, duration_weeks, frequency_per_week, contraindications, precautions, expected_outcomes
            
            Do not include any markdown formatting, code blocks, or explanatory text. Return only the raw JSON object.`
          }],
          specialty: 'physiotherapy'
        }
      });

      if (response.error) throw response.error;

      try {
        // Clean the AI response - remove markdown code blocks if present
        let cleanedResponse = response.data.response.trim();
        
        console.log(`AI Response for ${condition.name}:`, cleanedResponse.substring(0, 200));
        
        // Remove markdown JSON code blocks
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*\n/, '').replace(/\n```$/, '');
        }
        
        let protocolData = JSON.parse(cleanedResponse);
        const validation = validateProtocol(protocolData);
        if (!validation.valid) throw new Error(validation.reason || 'Invalid protocol schema');
        
        const { error: insertError } = await supabase
          .from('treatment_protocols')
          .insert({
            name: protocolData.name,
            description: protocolData.description,
            condition_id: condition.id,
            protocol_steps: protocolData.protocol_steps,
            duration_weeks: protocolData.duration_weeks,
            frequency_per_week: protocolData.frequency_per_week,
            contraindications: protocolData.contraindications,
            precautions: protocolData.precautions,
            expected_outcomes: protocolData.expected_outcomes,
            created_by: user?.id || null,
            is_validated: false
          });

        if (insertError) throw insertError;
        
        return true;
      } catch (parseError) {
        console.error(`Failed to parse AI response for ${condition.name}:`, parseError);
        console.log('Skipping this condition and continuing with others...');
        return false;
      }
    } catch (error) {
      console.error('Error generating protocol for', condition.name, error);
      return false;
    }
  };

  const populateProtocols = async () => {
    setIsPopulating(true);
    setPopulatedCount(0);

    try {
      // Get all conditions
      const { data: conditions, error: conditionsError } = await supabase
        .from('conditions')
        .select('*')
        .order('name');

      if (conditionsError) throw conditionsError;

      let successCount = 0;
      let failedCount = 0;
      
      for (const condition of conditions) {
        // Check if protocol already exists
        const { data: existing } = await supabase
          .from('treatment_protocols')
          .select('id')
          .eq('condition_id', condition.id)
          .single();

        if (!existing) {
          console.log(`Generating protocol for: ${condition.name}`);
          const success = await generateTreatmentProtocol(condition);
          if (success) {
            successCount++;
            setPopulatedCount(successCount);
          } else {
            failedCount++;
          }
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (failedCount > 0) {
        toast.success(`Generated ${successCount} protocols (${failedCount} failed)`);
      } else {
        toast.success(`Successfully generated ${successCount} treatment protocols!`);
      }
    } catch (error) {
      console.error('Error populating protocols:', error);
      toast.error('Failed to populate protocols');
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-medical-blue" />
            <CardTitle>Treatment Protocols Generator</CardTitle>
          </div>
          <Badge variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Generate evidence-based treatment protocols for all conditions using AI.
        </p>
        
        {isPopulating && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating protocols... ({populatedCount} completed)</span>
            </div>
          </div>
        )}

        <Button 
          onClick={populateProtocols}
          disabled={isPopulating}
          className="w-full"
          variant="medical"
        >
          {isPopulating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Protocols...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Treatment Protocols
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};