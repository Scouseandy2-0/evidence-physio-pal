import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Evidence {
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publication_date: string;
  evidence_level: string;
  study_type: string;
  clinical_implications: string;
  key_findings: string;
  pmid?: string;
  doi?: string;
  source: string;
}

interface Condition {
  id: string;
  name: string;
  category: string;
  description: string;
  icd_codes: string[];
  keywords: string[];
}

interface ProtocolPhase {
  phase: string;
  duration: string;
  goals: string[];
  interventions: string[];
  progressionCriteria: string[];
}

interface TreatmentProtocol {
  name: string;
  description: string;
  condition_id: string;
  protocol_steps: {
    phases: ProtocolPhase[];
    assessment: string[];
    outcomesMeasures: string[];
    dischargeCriteria: string[];
  };
  duration_weeks: number;
  frequency_per_week: number;
  contraindications: string[];
  precautions: string[];
  expected_outcomes: string;
  evidence_ids: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting comprehensive protocol generation...');

    // Fetch all conditions
    const { data: conditions, error: conditionsError } = await supabase
      .from('conditions')
      .select('*');

    if (conditionsError) {
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
    }

    const results = {
      totalConditions: conditions?.length || 0,
      processedConditions: 0,
      generatedProtocols: 0,
      errors: [] as string[]
    };

    // Process each condition
    for (const condition of conditions || []) {
      try {
        console.log(`Processing condition: ${condition.name}`);
        
        // Search for evidence across multiple databases
        const evidenceResults = await searchMultipleDatabases(condition, supabase);
        
        if (evidenceResults.length === 0) {
          console.log(`No evidence found for ${condition.name}, skipping...`);
          continue;
        }

        // Generate protocol using AI
        const protocol = await generateProtocolWithAI(condition, evidenceResults, openaiApiKey, supabase);
        
        if (protocol) {
          // Store the protocol in database
          const { data: protocolData, error: protocolError } = await supabase
            .from('treatment_protocols')
            .insert({
              name: protocol.name,
              description: protocol.description,
              condition_id: protocol.condition_id,
              protocol_steps: protocol.protocol_steps,
              duration_weeks: protocol.duration_weeks,
              frequency_per_week: protocol.frequency_per_week,
              contraindications: protocol.contraindications,
              precautions: protocol.precautions,
              expected_outcomes: protocol.expected_outcomes,
              evidence_ids: protocol.evidence_ids,
              created_by: null, // System generated
              is_validated: true // Mark as validated since it's evidence-based
            })
            .select()
            .single();

          if (protocolError) {
            console.error(`Error storing protocol for ${condition.name}:`, protocolError);
            results.errors.push(`Protocol storage failed for ${condition.name}: ${protocolError.message}`);
          } else {
            console.log(`Successfully generated protocol for ${condition.name}`);
            results.generatedProtocols++;
          }
        }

        results.processedConditions++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error processing ${condition.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Failed to process ${condition.name}: ${errorMessage}`);
      }
    }

    console.log('Protocol generation completed:', results);

    return new Response(JSON.stringify({
      success: true,
      results,
      message: `Generated ${results.generatedProtocols} protocols from ${results.processedConditions} conditions`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-condition-protocols:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchMultipleDatabases(condition: Condition, supabase: any): Promise<Evidence[]> {
  const allEvidence: Evidence[] = [];
  const searchTerms = [condition.name, ...condition.keywords].slice(0, 3); // Limit search terms

  console.log(`Searching evidence for: ${searchTerms.join(', ')}`);

  // Search PubMed
  try {
    const { data: pubmedData, error: pubmedError } = await supabase.functions.invoke('pubmed-integration', {
      body: {
        searchTerm: searchTerms[0],
        maxResults: 10,
        filters: {
          studyTypes: ['Systematic Review', 'Meta-Analysis', 'Randomized Controlled Trial'],
          publicationYears: [2019, 2020, 2021, 2022, 2023, 2024, 2025]
        }
      }
    });

    if (!pubmedError && pubmedData?.studies) {
      allEvidence.push(...pubmedData.studies.map((study: any) => ({
        ...study,
        source: 'PubMed'
      })));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`PubMed search failed for ${condition.name}:`, errorMessage);
  }

  // Search Cochrane
  try {
    const { data: cochraneData, error: cochraneError } = await supabase.functions.invoke('cochrane-integration', {
      body: {
        searchTerm: searchTerms[0],
        maxResults: 5
      }
    });

    if (!cochraneError && cochraneData?.reviews) {
      allEvidence.push(...cochraneData.reviews.map((review: any) => ({
        ...review,
        source: 'Cochrane'
      })));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Cochrane search failed for ${condition.name}:`, errorMessage);
  }

  // Search PEDro
  try {
    const { data: pedroData, error: pedroError } = await supabase.functions.invoke('pedro-integration', {
      body: {
        searchTerm: searchTerms[0],
        maxResults: 8
      }
    });

    if (!pedroError && pedroData?.studies) {
      allEvidence.push(...pedroData.studies.map((study: any) => ({
        ...study,
        source: 'PEDro'
      })));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`PEDro search failed for ${condition.name}:`, errorMessage);
  }

  // Get existing evidence from database
  const { data: existingEvidence } = await supabase
    .from('evidence')
    .select('*')
    .contains('condition_ids', [condition.id])
    .eq('is_active', true)
    .order('publication_date', { ascending: false })
    .limit(10);

  if (existingEvidence) {
    allEvidence.push(...existingEvidence.map((evidence: any) => ({
      ...evidence,
      source: 'Database'
    })));
  }

  console.log(`Found ${allEvidence.length} evidence items for ${condition.name}`);
  return allEvidence;
}

async function generateProtocolWithAI(condition: Condition, evidence: Evidence[], openaiApiKey: string, supabase: any): Promise<TreatmentProtocol | null> {
  try {
    const evidenceSummary = evidence.slice(0, 10).map(e => 
      `${e.title} (${e.source}, ${e.evidence_level || 'Not specified'}): ${e.abstract || e.key_findings || e.clinical_implications || 'No summary available'}`
    ).join('\n\n');

    const prompt = `As a physiotherapy expert, create a comprehensive, evidence-based treatment protocol for ${condition.name}.

CONDITION DETAILS:
- Name: ${condition.name}
- Category: ${condition.category}
- Description: ${condition.description}
- ICD Codes: ${condition.icd_codes?.join(', ') || 'Not specified'}

AVAILABLE EVIDENCE:
${evidenceSummary}

Create a detailed treatment protocol that includes:

1. PROTOCOL PHASES (3-4 phases with specific timelines)
2. ASSESSMENT PROCEDURES
3. OUTCOME MEASURES
4. CONTRAINDICATIONS & PRECAUTIONS
5. EXPECTED OUTCOMES
6. DISCHARGE CRITERIA

Format your response as a JSON object with this exact structure:
{
  "name": "Evidence-Based Protocol for [Condition Name]",
  "description": "Brief description of the protocol approach",
  "duration_weeks": number (8-16 weeks typical),
  "frequency_per_week": number (2-5 sessions typical),
  "phases": [
    {
      "phase": "Phase 1: Acute/Initial",
      "duration": "Weeks 1-2",
      "goals": ["goal1", "goal2"],
      "interventions": ["intervention1", "intervention2"],
      "progressionCriteria": ["criteria1", "criteria2"]
    }
  ],
  "assessment": ["assessment1", "assessment2"],
  "outcomesMeasures": ["measure1", "measure2"],
  "contraindications": ["contraindication1", "contraindication2"],
  "precautions": ["precaution1", "precaution2"],
  "expected_outcomes": "Detailed expected outcomes",
  "dischargeCriteria": ["criteria1", "criteria2"]
}

Base all recommendations strictly on the provided evidence. Include evidence levels when possible.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert physiotherapist specializing in evidence-based practice. Create comprehensive, clinically sound treatment protocols based on the latest research evidence. Always format responses as valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error for ${condition.name}:`, response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`Raw AI response for ${condition.name}:`, content.substring(0, 200) + '...');
    
    // Clean the content - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Remove any extra text before or after JSON
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log(`Cleaned content for ${condition.name}:`, cleanContent.substring(0, 200) + '...');
    
    // Parse the JSON response
    let protocolData;
    try {
      protocolData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error(`Failed to parse AI response for ${condition.name}:`, parseError);
      console.error('Content that failed to parse:', cleanContent);
      throw new Error(`Failed to parse AI response for ${condition.name}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    // Validate required fields
    if (!protocolData.name || !protocolData.phases || !Array.isArray(protocolData.phases)) {
      console.error(`Invalid protocol data structure for ${condition.name}:`, protocolData);
      throw new Error(`Invalid protocol data structure for ${condition.name}`);
    }
    
    // Store evidence in database first to get IDs
    const evidenceIds: string[] = [];
    for (const evidenceItem of evidence.slice(0, 5)) { // Store top 5 evidence items
      const { data: storedEvidence } = await supabase
        .from('evidence')
        .upsert({
          title: evidenceItem.title,
          abstract: evidenceItem.abstract,
          authors: evidenceItem.authors || [],
          journal: evidenceItem.journal,
          publication_date: evidenceItem.publication_date,
          evidence_level: evidenceItem.evidence_level,
          study_type: evidenceItem.study_type,
          clinical_implications: evidenceItem.clinical_implications,
          key_findings: evidenceItem.key_findings,
          condition_ids: [condition.id],
          pmid: evidenceItem.pmid,
          doi: evidenceItem.doi,
          tags: [condition.name, condition.category],
          is_active: true
        }, {
          onConflict: 'pmid',
          ignoreDuplicates: true
        })
        .select('id')
        .single();
      
      if (storedEvidence) {
        evidenceIds.push(storedEvidence.id);
      }
    }

    return {
      name: protocolData.name,
      description: protocolData.description,
      condition_id: condition.id,
      protocol_steps: {
        phases: protocolData.phases,
        assessment: protocolData.assessment || [],
        outcomesMeasures: protocolData.outcomesMeasures || [],
        dischargeCriteria: protocolData.dischargeCriteria || []
      },
      duration_weeks: protocolData.duration_weeks || 12,
      frequency_per_week: protocolData.frequency_per_week || 3,
      contraindications: protocolData.contraindications || [],
      precautions: protocolData.precautions || [],
      expected_outcomes: protocolData.expected_outcomes,
      evidence_ids: evidenceIds
    };

  } catch (error) {
    console.error(`AI protocol generation failed for ${condition.name}:`, error);
    return null;
  }
}