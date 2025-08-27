import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publication_date: string;
  abstract: string;
  doi?: string;
  keywords: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerms, maxResults = 20, dateRange = "1 year" } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Searching PubMed for: ${searchTerms}`);

    // Search PubMed using E-utilities API
    const searchQuery = encodeURIComponent(`${searchTerms} AND "physical therapy"[MeSH Terms] OR "physiotherapy"[All Fields]`);
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchQuery}&retmax=${maxResults}&reldate=365&datetype=pdat&retmode=json`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult?.idlist?.length) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No articles found',
        articles: [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pmids = searchData.esearchresult.idlist;
    console.log(`Found ${pmids.length} articles`);

    // Fetch detailed information for each article
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
    const fetchResponse = await fetch(fetchUrl);
    const xmlText = await fetchResponse.text();

    // Parse XML response (simplified parsing)
    const articles: PubMedArticle[] = [];
    const articleMatches = xmlText.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

    for (const articleXml of articleMatches) {
      try {
        const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
        const titleMatch = articleXml.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/s);
        const abstractMatch = articleXml.match(/<AbstractText[^>]*>(.*?)<\/AbstractText>/s);
        const journalMatch = articleXml.match(/<Title>(.*?)<\/Title>/);
        const doiMatch = articleXml.match(/<ArticleId IdType="doi">(.*?)<\/ArticleId>/);
        
        // Extract publication date
        const yearMatch = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
        const monthMatch = articleXml.match(/<PubDate>[\s\S]*?<Month>(\w+|\d+)<\/Month>/);
        const dayMatch = articleXml.match(/<PubDate>[\s\S]*?<Day>(\d+)<\/Day>/);
        
        // Extract authors
        const authorMatches = articleXml.match(/<Author[^>]*>[\s\S]*?<\/Author>/g) || [];
        const authors = authorMatches.map(author => {
          const lastNameMatch = author.match(/<LastName>(.*?)<\/LastName>/);
          const firstNameMatch = author.match(/<ForeName>(.*?)<\/ForeName>/);
          if (lastNameMatch && firstNameMatch) {
            return `${firstNameMatch[1]} ${lastNameMatch[1]}`;
          }
          return '';
        }).filter(Boolean);

        if (pmidMatch && titleMatch) {
          const year = yearMatch ? yearMatch[1] : '2024';
          const month = monthMatch ? monthMatch[1] : '01';
          const day = dayMatch ? dayMatch[1] : '01';
          
          const monthNum = isNaN(Number(month)) ? 
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month) + 1 || 1 
            : Number(month);

          articles.push({
            pmid: pmidMatch[1],
            title: titleMatch[1].replace(/<[^>]*>/g, ''),
            authors,
            journal: journalMatch ? journalMatch[1] : 'Unknown Journal',
            publication_date: `${year}-${monthNum.toString().padStart(2, '0')}-${day.padStart(2, '0')}`,
            abstract: abstractMatch ? abstractMatch[1].replace(/<[^>]*>/g, '') : '',
            doi: doiMatch ? doiMatch[1] : undefined,
            keywords: searchTerms.split(' ')
          });
        }
      } catch (error) {
        console.error('Error parsing article:', error);
      }
    }

    // Store articles in database
    for (const article of articles) {
      try {
        // Check if article already exists
        const { data: existing } = await supabase
          .from('evidence')
          .select('id')
          .eq('pmid', article.pmid)
          .single();

        if (!existing) {
          // Insert new article
          const { error } = await supabase
            .from('evidence')
            .insert({
              title: article.title,
              authors: article.authors,
              journal: article.journal,
              publication_date: article.publication_date,
              pmid: article.pmid,
              doi: article.doi,
              abstract: article.abstract,
              study_type: 'Research Article',
              evidence_level: 'B', // Default level, can be updated later
              tags: article.keywords,
              key_findings: '', // To be filled by AI analysis later
              clinical_implications: '', // To be filled by AI analysis later
              is_active: true
            });

          if (error) {
            console.error('Error inserting article:', error);
          } else {
            console.log(`Inserted article: ${article.title}`);
          }
        }
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${articles.length} articles from PubMed`,
      articles: articles.slice(0, 5) // Return first 5 for preview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in PubMed integration:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});