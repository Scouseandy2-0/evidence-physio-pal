// Script to populate real evidence data from external sources
// This will call the Supabase edge functions to fetch real data

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xbonrxqrzkuwxovyqrxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib25yeHFyemt1d3hvdnlxcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTUyMDQsImV4cCI6MjA3MTg5MTIwNH0.3RzdQ257mN2U0hmJZrBkVC4DhwDGS5avOgSLvTBG4gI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const searchTerms = [
  "low back pain",
  "stroke rehabilitation", 
  "knee osteoarthritis",
  "shoulder impingement",
  "chronic pain",
  "balance training",
  "manual therapy",
  "exercise therapy",
  "spinal cord injury",
  "COPD rehabilitation"
];

const sources = ['pubmed', 'cochrane', 'pedro', 'guidelines'];

async function populateRealData() {
  console.log('Starting real evidence data population...');
  
  for (const searchTerm of searchTerms) {
    console.log(`\nFetching data for: ${searchTerm}`);
    
    for (const source of sources) {
      try {
        console.log(`  Calling ${source}-integration...`);
        
        const { data, error } = await supabase.functions.invoke(`${source}-integration`, {
          body: {
            searchTerms: searchTerm,
            maxResults: 5 // Reduced to avoid overwhelming the database
          }
        });

        if (error) {
          console.error(`    Error with ${source}:`, error);
          continue;
        }

        console.log(`    Success with ${source}:`, data?.message || 'Data fetched');
        
        // Add delay to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`    Failed ${source}:`, error.message);
      }
    }
    
    // Delay between search terms
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\nData population completed!');
  
  // Check how much data was added
  const { data: evidenceCount } = await supabase
    .from('evidence')
    .select('id', { count: 'exact' });
    
  console.log(`Total evidence entries in database: ${evidenceCount?.length || 0}`);
}

// Run the population script
populateRealData().catch(console.error);