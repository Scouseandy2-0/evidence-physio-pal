import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    // Update existing guidelines with correct NICE URLs
    const updates = [
      {
        searchTerm: 'Low back pain',
        url: 'https://www.nice.org.uk/guidance/ng59',
        title: 'Low back pain and sciatica in over 16s: assessment and management'
      },
      {
        searchTerm: 'Stroke',
        url: 'https://www.nice.org.uk/guidance/ng236',
        title: 'Stroke rehabilitation in adults'
      },
      {
        searchTerm: 'COPD',
        url: 'https://www.nice.org.uk/guidance/ng115',
        title: 'Chronic obstructive pulmonary disease in over 16s: diagnosis and management'
      },
      {
        searchTerm: 'Osteoarthritis',
        url: 'https://www.nice.org.uk/guidance/ng226',
        title: 'Osteoarthritis in over 16s: diagnosis and management'
      },
      {
        searchTerm: 'Physical activity',
        url: 'https://www.nice.org.uk/guidance/ph44',
        title: 'Physical activity: brief advice for adults in primary care'
      },
      {
        searchTerm: 'Rheumatoid arthritis',
        url: 'https://www.nice.org.uk/guidance/ng100',
        title: 'Rheumatoid arthritis in adults: management'
      },
      {
        searchTerm: 'Falls',
        url: 'https://www.nice.org.uk/guidance/cg161',
        title: 'Falls in older people: assessing risk and prevention'
      },
      {
        searchTerm: 'Multiple sclerosis',
        url: 'https://www.nice.org.uk/guidance/ng220',
        title: 'Multiple sclerosis in adults: management'
      },
      {
        searchTerm: 'Spinal injury',
        url: 'https://www.nice.org.uk/guidance/ng41',
        title: 'Spinal injury: assessment and initial management'
      },
      {
        searchTerm: "Parkinson",
        url: 'https://www.nice.org.uk/guidance/ng71',
        title: "Parkinson's disease in adults"
      }
    ];

    let updatedCount = 0;

    for (const update of updates) {
      // Try multiple search strategies to find the guideline
      const searchQueries = [
        supabase.from('evidence').select('*').eq('study_type', 'Clinical Practice Guideline').ilike('title', `%${update.searchTerm}%`),
        supabase.from('evidence').select('*').eq('study_type', 'Clinical Practice Guideline').ilike('abstract', `%${update.searchTerm}%`),
        supabase.from('evidence').select('*').eq('study_type', 'Clinical Practice Guideline').contains('tags', [update.searchTerm])
      ];

      const allGuidelines = new Set<string>();
      
      for (const query of searchQueries) {
        const { data: guidelines } = await query;
        if (guidelines && guidelines.length > 0) {
          guidelines.forEach(g => allGuidelines.add(g.id));
        }
      }

      // Update all found guidelines
      for (const guidelineId of allGuidelines) {
        const { data: guideline } = await supabase
          .from('evidence')
          .select('*')
          .eq('id', guidelineId)
          .single();

        if (guideline) {
          const updatedGradeAssessment = {
            ...(guideline.grade_assessment || {}),
            url: update.url,
            title: update.title
          };

          const { error } = await supabase
            .from('evidence')
            .update({ 
              grade_assessment: updatedGradeAssessment,
              doi: update.url  // Also update DOI field as fallback
            })
            .eq('id', guideline.id);

          if (!error) {
            updatedCount++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} guidelines with correct NICE URLs` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error fixing guideline URLs:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
