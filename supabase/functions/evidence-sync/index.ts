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
    const { 
      searchTerms = 'physiotherapy physical therapy', 
      sources = ['pubmed', 'cochrane', 'pedro', 'guidelines'],
      maxResults = 20 
    } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting evidence sync for: ${searchTerms}`);
    console.log(`Sources: ${sources.join(', ')}`);

    const results: {
      success: boolean;
      sources_processed: Array<{
        source: string;
        success: boolean;
        message: string;
        count: number;
      }>;
      total_articles: number;
      errors: Array<{
        source: string;
        error: string;
        message: string;
      }>;
    } = {
      success: true,
      sources_processed: [],
      total_articles: 0,
      errors: []
    };

    // Call each integration function
    for (const source of sources) {
      try {
        console.log(`Processing ${source}...`);
        
        const functionUrl = `${supabaseUrl}/functions/v1/${source}-integration`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchTerms,
            maxResults: Math.floor(maxResults / sources.length),
            condition: 'musculoskeletal'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.sources_processed.push({
            source,
            success: true,
            message: data.message,
            count: data.articles?.length || data.reviews?.length || data.studies?.length || data.guidelines?.length || 0
          });
          results.total_articles += results.sources_processed[results.sources_processed.length - 1].count;
        } else {
          const errorData = await response.json().catch(() => ({}));
          results.errors.push({
            source,
            error: errorData.error || `HTTP ${response.status}`,
            message: errorData.note || 'Unknown error'
          });
        }
      } catch (error) {
        console.error(`Error processing ${source}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          source,
          error: errorMessage,
          message: 'Function call failed'
        });
      }
    }

    // Log sync completion (removed system-wide status update as it requires valid UUID)
    console.log(`Sync completed successfully: ${results.total_articles} articles from ${results.sources_processed.length} sources`);

    return new Response(JSON.stringify({
      ...results,
      message: `Evidence sync completed. Processed ${results.total_articles} articles from ${results.sources_processed.length} sources.`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in evidence sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      message: 'Evidence sync failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});