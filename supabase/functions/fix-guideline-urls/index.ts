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
        searchTerm: 'Low back pain and sciatica',
        url: 'https://www.nice.org.uk/guidance/ng59',
        title: 'Low back pain and sciatica in over 16s: assessment and management'
      },
      {
        searchTerm: 'Stroke rehabilitation',
        url: 'https://www.nice.org.uk/guidance/ng236',
        title: 'Stroke rehabilitation in adults'
      },
      {
        searchTerm: 'Chronic obstructive pulmonary disease',
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
      }
    ];

    let updatedCount = 0;

    for (const update of updates) {
      const { data: guidelines } = await supabase
        .from('evidence')
        .select('*')
        .eq('study_type', 'Clinical Practice Guideline')
        .ilike('title', `%${update.searchTerm}%`);

      if (guidelines && guidelines.length > 0) {
        for (const guideline of guidelines) {
          const updatedGradeAssessment = {
            ...(guideline.grade_assessment || {}),
            url: update.url
          };

          const { error } = await supabase
            .from('evidence')
            .update({ grade_assessment: updatedGradeAssessment })
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
