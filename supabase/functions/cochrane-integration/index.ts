import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CochraneReview {
  id: string;
  title: string;
  authors: string[];
  publication_date: string;
  abstract: string;
  doi?: string;
  conclusions: string;
  keywords: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerms, maxResults = 10 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Searching Cochrane Library for: ${searchTerms}`);

    // Search Cochrane Library using their search API
    const searchQuery = encodeURIComponent(`${searchTerms} physiotherapy OR physical therapy`);
    const searchUrl = `https://www.cochranelibrary.com/api/search?query=${searchQuery}&type=review&limit=${maxResults}&format=json`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'PhysioEvidence-Bot/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Cochrane API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    const reviews: CochraneReview[] = [];

    // Process Cochrane reviews
    if (searchData.results && Array.isArray(searchData.results)) {
      for (const result of searchData.results) {
        try {
          reviews.push({
            id: result.id || result.doi || `cochrane_${Date.now()}`,
            title: result.title || 'Untitled Review',
            authors: result.authors || [],
            publication_date: result.publishedDate || result.date || new Date().toISOString().split('T')[0],
            abstract: result.abstract || result.summary || '',
            doi: result.doi,
            conclusions: result.conclusions || result.plainLanguageSummary || '',
            keywords: searchTerms.split(' ')
          });
        } catch (error) {
          console.error('Error processing Cochrane result:', error);
        }
      }
    }

    // Store reviews in database
    for (const review of reviews) {
      try {
        // Check if review already exists
        const { data: existing } = await supabase
          .from('evidence')
          .select('id')
          .eq('doi', review.doi)
          .eq('journal', 'Cochrane Database of Systematic Reviews')
          .single();

        if (!existing) {
          // Insert new review
          const { error } = await supabase
            .from('evidence')
            .insert({
              title: review.title,
              authors: review.authors,
              journal: 'Cochrane Database of Systematic Reviews',
              publication_date: review.publication_date,
              doi: review.doi,
              abstract: review.abstract,
              study_type: 'Systematic Review',
              evidence_level: 'A', // Cochrane reviews are high quality
              tags: review.keywords,
              key_findings: review.conclusions,
              clinical_implications: review.conclusions,
              is_active: true,
              grade_assessment: {
                quality: 'High',
                source: 'Cochrane Library',
                type: 'Systematic Review'
              }
            });

          if (error) {
            console.error('Error inserting Cochrane review:', error);
          } else {
            console.log(`Inserted Cochrane review: ${review.title}`);
          }
        }
      } catch (error) {
        console.error('Error processing Cochrane review:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${reviews.length} Cochrane reviews`,
      reviews: reviews.slice(0, 3) // Return first 3 for preview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Cochrane integration:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      note: 'Cochrane Library may require special access or rate limiting'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});