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
  task?: 'conditions' | 'evidence' | 'assessment_tools' | 'all';
  conditions?: ConditionInput[];
  evidence?: EvidenceInput[];
  assessmentTools?: AssessmentToolInput[];
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

    // Helper: upsert conditions by name
    async function upsertConditions(conditions: ConditionInput[] = []) {
      let inserted = 0;
      for (const c of conditions) {
        // Check existence by name
        const { data: existing } = await supabase.from('conditions').select('id').eq('name', c.name).maybeSingle();
        if (!existing) {
          const { error } = await supabase.from('conditions').insert({
            name: c.name,
            category: c.category as any,
            description: c.description ?? null,
            icd_codes: c.icd_codes ?? null,
            keywords: c.keywords ?? null,
            prevalence_data: c.prevalence_data ?? null,
          });
          if (!error) inserted++;
          else console.error('Condition insert error', c.name, error);
        }
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

    // Helper: insert evidence
    async function insertEvidence(items: EvidenceInput[] = []) {
      const idMap = await getConditionIdMap();
      let inserted = 0;
      for (const e of items) {
        // Skip if already exists by doi or pmid+title
        const query = supabase.from('evidence').select('id').limit(1);
        if (e.doi) query.eq('doi', e.doi);
        else if (e.pmid) query.eq('pmid', e.pmid);
        else query.eq('title', e.title);
        const { data: existing } = await query.maybeSingle();
        if (existing) continue;

        const conditionUUIDs = (e.condition_ids ?? []).map(name => idMap.get(name)).filter(Boolean) as string[];
        const level = mapEvidenceLevel(e.evidence_level);

        const { error } = await supabase.from('evidence').insert({
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
        } as any);
        if (!error) inserted++;
        else console.error('Evidence insert error', e.title, error);
      }
      return inserted;
    }

    // Helper: insert assessment tools
    async function insertAssessmentTools(items: AssessmentToolInput[] = []) {
      const idMap = await getConditionIdMap();
      let inserted = 0;
      for (const t of items) {
        const { data: existing } = await supabase.from('assessment_tools').select('id').eq('name', t.name).maybeSingle();
        if (existing) continue;
        const conditionUUIDs = (t.condition_ids ?? []).map(name => idMap.get(name)).filter(Boolean) as string[];
        const { error } = await supabase.from('assessment_tools').insert({
          name: t.name,
          tool_type: t.tool_type ?? null,
          description: t.description ?? null,
          condition_ids: conditionUUIDs.length ? conditionUUIDs : null,
          instructions: t.instructions ?? null,
          scoring_method: t.scoring_method ?? null,
          interpretation_guide: t.interpretation_guide ?? null,
          reference_values: t.reference_values ?? null,
          psychometric_properties: t.psychometric_properties ?? null,
        } as any);
        if (!error) inserted++;
        else console.error('Assessment tool insert error', t.name, error);
      }
      return inserted;
    }

    let results: Record<string, number> = {};

    if (task === 'conditions' || task === 'all') {
      results.conditions = await upsertConditions(body.conditions ?? []);
    }
    if (task === 'evidence' || task === 'all') {
      results.evidence = await insertEvidence(body.evidence ?? []);
    }
    if (task === 'assessment_tools' || task === 'all') {
      results.assessment_tools = await insertAssessmentTools(body.assessmentTools ?? []);
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
