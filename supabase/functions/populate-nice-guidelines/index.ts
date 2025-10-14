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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting NICE guidelines population for protocols...');

    // Calculate date from 6 years ago
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
    const cutoffDate = sixYearsAgo.toISOString().split('T')[0];

    console.log(`Fetching NICE guidelines from ${cutoffDate} onwards...`);

    // Fetch NICE guidelines from the last 6 years
    const { data: niceGuidelines, error: guidelinesError } = await supabase
      .from('evidence')
      .select('id, title, condition_ids, publication_date, key_findings')
      .ilike('title', '%NICE%')
      .gte('publication_date', cutoffDate)
      .eq('is_active', true);

    if (guidelinesError) {
      throw new Error(`Failed to fetch NICE guidelines: ${guidelinesError.message}`);
    }

    console.log(`Found ${niceGuidelines?.length || 0} NICE guidelines`);

    if (!niceGuidelines || niceGuidelines.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No NICE guidelines found from the last 6 years',
          protocolsUpdated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all treatment protocols
    const { data: protocols, error: protocolsError } = await supabase
      .from('treatment_protocols')
      .select('id, name, condition_id, evidence_ids');

    if (protocolsError) {
      throw new Error(`Failed to fetch protocols: ${protocolsError.message}`);
    }

    console.log(`Found ${protocols?.length || 0} protocols to update`);

    let updatedCount = 0;
    const updatePromises: Promise<any>[] = [];

    // Match guidelines to protocols based on condition_id
    for (const protocol of protocols || []) {
      const matchingGuidelines = niceGuidelines.filter(guideline => {
        // Check if guideline's condition_ids includes this protocol's condition_id
        return guideline.condition_ids && 
               Array.isArray(guideline.condition_ids) &&
               guideline.condition_ids.includes(protocol.condition_id);
      });

      if (matchingGuidelines.length > 0) {
        // Get existing evidence IDs or initialize empty array
        const existingEvidenceIds = protocol.evidence_ids || [];
        
        // Add new guideline IDs that aren't already present
        const newGuidelineIds = matchingGuidelines
          .map(g => g.id)
          .filter(id => !existingEvidenceIds.includes(id));

        if (newGuidelineIds.length > 0) {
          const updatedEvidenceIds = [...existingEvidenceIds, ...newGuidelineIds];

          console.log(`Updating protocol "${protocol.name}" with ${newGuidelineIds.length} NICE guidelines`);

          // Update protocol with new evidence IDs
          const updatePromise = supabase
            .from('treatment_protocols')
            .update({ evidence_ids: updatedEvidenceIds })
            .eq('id', protocol.id);

          updatePromises.push(updatePromise);
          updatedCount++;
        }
      }
    }

    // Execute all updates in parallel
    const results = await Promise.allSettled(updatePromises);
    
    // Check for any failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some updates failed:', failures);
    }

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    console.log(`Successfully updated ${successCount} protocols with NICE guidelines`);

    return new Response(
      JSON.stringify({
        message: 'NICE guidelines population completed',
        totalGuidelines: niceGuidelines.length,
        protocolsUpdated: successCount,
        protocolsAttempted: updatedCount,
        failures: failures.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-nice-guidelines function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
