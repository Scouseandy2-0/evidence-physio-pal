import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Guideline {
  id: string;
  title: string;
  organization: string;
  publication_date: string;
  summary: string;
  recommendations: string[];
  evidence_level: string;
  condition: string;
  url?: string;
  keywords: string[];
}

interface NICEGuideline {
  Title: string;
  Published: string;
  Type: string;
  Overview: string;
  LastModified: string;
  Uri: string;
  Guidance?: {
    Recommendations?: Array<{
      Text: string;
      RecommendationText: string;
    }>;
  };
}

// NICE API endpoints and search configuration
const NICE_API_BASE = 'https://www.nice.org.uk/api';
const NICE_SEARCH_ENDPOINT = `${NICE_API_BASE}/feeds/guidance/published`;

// Real NICE guidelines mapping for physiotherapy-relevant conditions
const PHYSIOTHERAPY_CONDITIONS = {
  'low back pain': 'low+back+pain',
  'stroke': 'stroke+rehabilitation',
  'knee osteoarthritis': 'osteoarthritis+knee',
  'hip osteoarthritis': 'osteoarthritis+hip',
  'shoulder impingement': 'shoulder+pain',
  'chronic pain': 'chronic+pain',
  'balance training': 'falls+prevention',
  'manual therapy': 'manual+therapy',
  'exercise therapy': 'exercise+therapy',
  'spinal cord injury': 'spinal+cord',
  'COPD rehabilitation': 'COPD+pulmonary',
  'neck pain': 'neck+pain',
  'vestibular rehabilitation': 'vertigo+dizziness',
  'cardiac rehabilitation': 'cardiac+rehabilitation',
  'neuroplasticity': 'brain+injury+rehabilitation'
};

async function fetchNICEGuidelines(searchTerm: string): Promise<Guideline[]> {
  const guidelines: Guideline[] = [];
  
  try {
    // Map search term to NICE-friendly query
    const niceQuery = PHYSIOTHERAPY_CONDITIONS[searchTerm.toLowerCase()] || 
                     searchTerm.replace(/\s+/g, '+');
    
    // Fetch guidelines from NICE API
    const searchUrl = `${NICE_SEARCH_ENDPOINT}?q=${niceQuery}&pageSize=10`;
    console.log(`Fetching from NICE API: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PhysioEvidence/1.0'
      }
    });
    
    if (!response.ok) {
      console.log(`NICE API response not OK: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const niceGuidelines = data.Results || [];
    
    console.log(`Found ${niceGuidelines.length} NICE guidelines for: ${searchTerm}`);
    
    for (const niceGuideline of niceGuidelines.slice(0, 5)) { // Limit to 5 per search
      try {
        // Extract recommendations from the guideline
        let recommendations: string[] = [];
        let summary = niceGuideline.Overview || 'NICE clinical guideline';
        
        // Fetch detailed guideline content if available
        if (niceGuideline.Uri) {
          try {
            const detailResponse = await fetch(`${NICE_API_BASE}${niceGuideline.Uri}?format=json`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              if (detailData.Guidance?.Recommendations) {
                recommendations = detailData.Guidance.Recommendations
                  .slice(0, 5)
                  .map((rec: any) => rec.RecommendationText || rec.Text || '')
                  .filter((text: string) => text.length > 0);
              }
            }
          } catch (detailError) {
            console.log('Could not fetch detailed recommendations:', detailError.message);
          }
        }
        
        // Fallback recommendations based on condition type
        if (recommendations.length === 0) {
          recommendations = getDefaultRecommendations(searchTerm);
        }
        
        const guideline: Guideline = {
          id: `nice_${niceGuideline.Uri?.split('/').pop() || Date.now()}`,
          title: niceGuideline.Title,
          organization: 'NICE (National Institute for Health and Care Excellence)',
          publication_date: niceGuideline.Published || niceGuideline.LastModified,
          summary: summary.substring(0, 500), // Limit summary length
          recommendations: recommendations,
          evidence_level: 'A', // NICE guidelines are high quality
          condition: searchTerm,
          url: `https://www.nice.org.uk${niceGuideline.Uri}`,
          keywords: [searchTerm, 'NICE', 'clinical guideline', niceGuideline.Type || 'guideline']
        };
        
        guidelines.push(guideline);
        
      } catch (guidelineError) {
        console.error('Error processing individual NICE guideline:', guidelineError);
      }
    }
    
  } catch (error) {
    console.error(`Error fetching NICE guidelines for ${searchTerm}:`, error);
  }
  
  return guidelines;
}

function getDefaultRecommendations(condition: string): string[] {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('back pain')) {
    return [
      'Consider exercise programmes and manual therapy for acute low back pain',
      'Offer psychological support alongside physical treatments',
      'Avoid bed rest and encourage early mobilisation'
    ];
  } else if (conditionLower.includes('stroke')) {
    return [
      'Start rehabilitation as soon as clinically possible after stroke',
      'Provide tailored exercise programmes to improve mobility',
      'Include family and carers in rehabilitation planning'
    ];
  } else if (conditionLower.includes('osteoarthritis')) {
    return [
      'Offer core treatments including education, exercise and weight management',
      'Consider manual therapy as an adjunct to core treatments',
      'Provide individualised exercise programmes'
    ];
  } else if (conditionLower.includes('copd')) {
    return [
      'Offer pulmonary rehabilitation to all appropriate patients',
      'Include exercise training as a core component',
      'Provide education and self-management support'
    ];
  } else {
    return [
      'Follow evidence-based assessment and treatment protocols',
      'Provide patient-centred care with shared decision making',
      'Monitor outcomes and adjust treatment accordingly'
    ];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerms, organization = 'all', condition = '' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Searching NICE guidelines for: ${searchTerms}`);

    let allGuidelines: Guideline[] = [];

    // Fetch real NICE guidelines
    if (searchTerms && searchTerms.trim().length > 0) {
      const niceGuidelines = await fetchNICEGuidelines(searchTerms);
      allGuidelines = allGuidelines.concat(niceGuidelines);
    }

    // If no specific search term or looking for rehabilitation/therapy, add comprehensive guidelines
    if (!searchTerms || searchTerms.includes('rehabilitation') || searchTerms.includes('therapy')) {
      const comprehensiveGuidelines = await fetchNICEGuidelines('rehabilitation');
      allGuidelines = allGuidelines.concat(comprehensiveGuidelines);
    }

    // Store guidelines in database
    for (const guideline of allGuidelines) {
      try {
        // Check if guideline already exists
        const { data: existing } = await supabase
          .from('evidence')
          .select('id')
          .eq('title', guideline.title)
          .eq('journal', guideline.organization)
          .maybeSingle();

        if (!existing) {
          // Insert new guideline
          const { error } = await supabase
            .from('evidence')
            .insert({
              title: guideline.title,
              authors: [guideline.organization],
              journal: guideline.organization,
              publication_date: guideline.publication_date,
              abstract: guideline.summary,
              study_type: 'Clinical Practice Guideline',
              evidence_level: guideline.evidence_level,
              tags: guideline.keywords,
              key_findings: guideline.recommendations.join('; '),
              clinical_implications: `Professional guideline from ${guideline.organization} for ${guideline.condition} management.`,
              is_active: true,
              grade_assessment: {
                source: guideline.organization,
                type: 'Clinical Practice Guideline',
                condition: guideline.condition,
                recommendations: guideline.recommendations,
                url: guideline.url
              }
            });

          if (error) {
            console.error('Error inserting guideline:', error);
          } else {
            console.log(`Inserted guideline: ${guideline.title}`);
          }
        }
      } catch (error) {
        console.error('Error processing guideline:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${allGuidelines.length} NICE guidelines`,
      guidelines: allGuidelines.slice(0, 5), // Return first 5 for preview
      source: 'NICE Database'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in NICE guidelines integration:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});