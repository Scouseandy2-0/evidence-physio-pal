import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ConditionInput = {
  name: string;
  category: 'msk' | 'neurological' | 'respiratory';
  description?: string;
  icd_codes?: string[];
  keywords?: string[];
  prevalence_data?: Record<string, unknown>;
};

type EvidenceInput = {
  title: string;
  authors?: string[];
  journal?: string;
  publication_date?: string;
  study_type?: string;
  abstract?: string;
  key_findings?: string;
  clinical_implications?: string;
  evidence_level?: string; // may be 'high'|'moderate'|'low'|'very_low' or 'A'|'B'|'C'|'D'
  condition_ids?: string[]; // names from client; we'll map to UUIDs
  tags?: string[];
  pmid?: string;
  doi?: string;
};

type AssessmentToolInput = {
  name: string;
  tool_type?: string;
  description?: string;
  condition_ids?: string[]; // names from client; we'll map to UUIDs
  instructions?: string;
  scoring_method?: string;
  interpretation_guide?: Record<string, unknown>;
  reference_values?: Record<string, unknown>;
  psychometric_properties?: Record<string, unknown>;
};

type Body = {
  task?: 'conditions' | 'evidence' | 'assessment_tools' | 'all' | 'populate_all';
  conditions?: ConditionInput[];
  evidence?: EvidenceInput[];
  assessmentTools?: AssessmentToolInput[];
  quick?: boolean; // For fast initial population
};

function mapEvidenceLevel(level?: string): 'A' | 'B' | 'C' | 'D' | null {
  if (!level) return null;
  const normalized = level.toLowerCase();
  const map: Record<string, 'A' | 'B' | 'C' | 'D'> = {
    high: 'A',
    moderate: 'B',
    low: 'C',
    very_low: 'D',
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D',
  };
  return map[normalized] ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Supabase environment' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    let body: Body;
    try {
      body = await req.json();
    } catch {
      body = {} as Body;
    }

    const task = body.task ?? 'all';
    const isQuickMode = body.quick === true;

    // Quick seed data for initial population
    const quickConditions: ConditionInput[] = [
      { name: 'Low Back Pain', category: 'msk', description: 'Common musculoskeletal condition affecting the lower back', keywords: ['back pain', 'lumbar', 'spine'] },
      { name: 'Stroke', category: 'neurological', description: 'Cerebrovascular accident affecting brain function', keywords: ['CVA', 'stroke', 'hemiplegia'] },
      { name: 'Chronic Obstructive Pulmonary Disease', category: 'respiratory', description: 'Progressive lung disease causing breathing difficulties', keywords: ['COPD', 'emphysema', 'chronic bronchitis'] },
      { name: 'Knee Osteoarthritis', category: 'msk', description: 'Degenerative joint disease of the knee', keywords: ['knee', 'arthritis', 'OA'] },
      { name: 'Neck Pain', category: 'msk', description: 'Pain in the cervical spine region', keywords: ['neck', 'cervical', 'whiplash'] },
    ];

    const quickEvidence: EvidenceInput[] = [
      {
        title: 'Exercise therapy for chronic low back pain',
        journal: 'Cochrane Database of Systematic Reviews',
        publication_date: '2021-09-28',
        study_type: 'Systematic Review',
        evidence_level: 'high',
        condition_ids: ['Low Back Pain'],
        doi: '10.1002/14651858.CD009790.pub2',
        key_findings: 'Exercise reduces pain and improves function in chronic low back pain',
      },
      {
        title: 'Task-specific training for walking after stroke',
        journal: 'Physical Therapy',
        publication_date: '2020-06-01',
        study_type: 'Systematic Review',
        evidence_level: 'high',
        condition_ids: ['Stroke'],
        key_findings: 'Task-specific walking training improves mobility outcomes',
      },
    ];

    const quickAssessmentTools: AssessmentToolInput[] = [
      {
        name: 'Oswestry Disability Index',
        tool_type: 'questionnaire',
        description: 'Disability questionnaire for low back pain',
        condition_ids: ['Low Back Pain'],
        scoring_method: 'Sum of 10 sections (0-50), multiply by 2 for percentage',
      },
      {
        name: 'National Institutes of Health Stroke Scale',
        tool_type: 'clinical',
        description: 'Standardized stroke severity assessment',
        condition_ids: ['Stroke'],
        scoring_method: 'Sum of 11 items (0-42 points)',
      },
    ];

    // Helper: batch upsert conditions
    async function upsertConditions(conditions: ConditionInput[] = []) {
      if (!conditions.length) return 0;
      
      let inserted = 0;
      // Batch check existing
      const names = conditions.map(c => c.name);
      const { data: existing } = await supabase
        .from('conditions')
        .select('name')
        .in('name', names);
      
      const existingNames = new Set((existing ?? []).map((r: any) => r.name));
      const toInsert = conditions.filter(c => !existingNames.has(c.name));
      
      if (toInsert.length) {
        const { error, data } = await supabase
          .from('conditions')
          .insert(toInsert.map(c => ({
            name: c.name,
            category: c.category as any,
            description: c.description ?? null,
            icd_codes: c.icd_codes ?? null,
            keywords: c.keywords ?? null,
            prevalence_data: c.prevalence_data ?? null,
          })));
        
        if (!error) inserted = toInsert.length;
        else console.error('Batch condition insert error', error);
      }
      
      return inserted;
    }

    // Helper: map condition names to UUIDs
    async function getConditionIdMap() {
      const { data } = await supabase.from('conditions').select('id, name');
      const map = new Map<string, string>();
      (data ?? []).forEach((row: any) => map.set(row.name, row.id));
      return map;
    }

    // Helper: batch insert evidence
    async function insertEvidence(items: EvidenceInput[] = []) {
      if (!items.length) return 0;
      
      const idMap = await getConditionIdMap();
      
      // Check existing by DOI/PMID
      const dois = items.filter(e => e.doi).map(e => e.doi!);
      const { data: existingDois } = dois.length 
        ? await supabase.from('evidence').select('doi').in('doi', dois)
        : { data: [] };
      
      const existingDoiSet = new Set((existingDois ?? []).map((r: any) => r.doi));
      const toInsert = items.filter(e => !e.doi || !existingDoiSet.has(e.doi));
      
      if (toInsert.length) {
        const records = toInsert.map(e => {
          const conditionUUIDs = (e.condition_ids ?? [])
            .map(name => idMap.get(name))
            .filter(Boolean) as string[];
          const level = mapEvidenceLevel(e.evidence_level);
          
          return {
            title: e.title,
            authors: e.authors ?? null,
            journal: e.journal ?? null,
            publication_date: e.publication_date ?? null,
            study_type: e.study_type ?? null,
            abstract: e.abstract ?? null,
            key_findings: e.key_findings ?? null,
            clinical_implications: e.clinical_implications ?? null,
            evidence_level: level,
            condition_ids: conditionUUIDs.length ? conditionUUIDs : null,
            tags: e.tags ?? null,
            pmid: e.pmid ?? null,
            doi: e.doi ?? null,
            is_active: true,
          };
        });
        
        const { error } = await supabase.from('evidence').insert(records as any);
        if (error) {
          console.error('Batch evidence insert error', error);
          return 0;
        }
        return toInsert.length;
      }
      
      return 0;
    }

    // Helper: batch insert assessment tools
    async function insertAssessmentTools(items: AssessmentToolInput[] = []) {
      if (!items.length) return 0;
      
      const idMap = await getConditionIdMap();
      const names = items.map(t => t.name);
      const { data: existing } = await supabase
        .from('assessment_tools')
        .select('name')
        .in('name', names);
      
      const existingNames = new Set((existing ?? []).map((r: any) => r.name));
      const toInsert = items.filter(t => !existingNames.has(t.name));
      
      if (toInsert.length) {
        const records = toInsert.map(t => {
          const conditionUUIDs = (t.condition_ids ?? [])
            .map(name => idMap.get(name))
            .filter(Boolean) as string[];
          
          return {
            name: t.name,
            tool_type: t.tool_type ?? null,
            description: t.description ?? null,
            condition_ids: conditionUUIDs.length ? conditionUUIDs : null,
            instructions: t.instructions ?? null,
            scoring_method: t.scoring_method ?? null,
            interpretation_guide: t.interpretation_guide ?? null,
            reference_values: t.reference_values ?? null,
            psychometric_properties: t.psychometric_properties ?? null,
          };
        });
        
        const { error } = await supabase.from('assessment_tools').insert(records as any);
        if (error) {
          console.error('Batch assessment tools insert error', error);
          return 0;
        }
        return toInsert.length;
      }
      
      return 0;
    }

    let results: Record<string, number> = {};

    // Handle populate_all task with quick mode
    if (task === 'populate_all') {
      const conditionsToUse = isQuickMode ? quickConditions : (body.conditions ?? quickConditions);
      const evidenceToUse = isQuickMode ? quickEvidence : (body.evidence ?? quickEvidence);
      const toolsToUse = isQuickMode ? quickAssessmentTools : (body.assessmentTools ?? quickAssessmentTools);
      
      results.conditions = await upsertConditions(conditionsToUse);
      results.evidence = await insertEvidence(evidenceToUse);
      results.assessment_tools = await insertAssessmentTools(toolsToUse);
    } else {
      if (task === 'conditions' || task === 'all') {
        results.conditions = await upsertConditions(body.conditions ?? []);
      }
      if (task === 'evidence' || task === 'all') {
        results.evidence = await insertEvidence(body.evidence ?? []);
      }
      if (task === 'assessment_tools' || task === 'all') {
        results.assessment_tools = await insertAssessmentTools(body.assessmentTools ?? []);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('admin-populate error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
