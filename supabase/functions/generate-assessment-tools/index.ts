import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  num_tools?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { num_tools = 20 }: RequestBody = await req.json().catch(() => ({}));
    const count = Math.max(1, Math.min(50, Number(num_tools) || 20));

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a clinical data generator for physiotherapy assessment tools. 
Return structured data via the provided function tool only. Do not include explanatory text.
Ensure fields are realistic, clinically accurate, concise, and safe.`;

    const userPrompt = `Generate ${count} physiotherapy assessment tools. Use widely used instruments where applicable.
For each tool include fields: name, description, tool_type ("questionnaire" or "performance test"), scoring_method,
condition_ids (empty array []), interpretation_guide (with keys low, moderate, high where applicable),
psychometric_properties (reliability, validity), reference_values (e.g., normal, mild), instructions.
Examples include: DASH, NDI, Oswestry, Berg Balance Scale, 6MWT, Timed Up and Go.`;

    const toolsSchema = [
      {
        type: "function",
        function: {
          name: "emit_assessment_tools",
          description: "Return the generated physiotherapy assessment tools as a structured list.",
          parameters: {
            type: "object",
            properties: {
              tools: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    tool_type: { type: "string", enum: ["questionnaire", "performance test"] },
                    scoring_method: { type: "string" },
                    condition_ids: {
                      type: "array",
                      items: { type: "string" },
                      default: [],
                    },
                    interpretation_guide: {
                      type: "object",
                      properties: {
                        low: { type: "string" },
                        moderate: { type: "string" },
                        high: { type: "string" },
                      },
                      additionalProperties: true,
                    },
                    psychometric_properties: {
                      type: "object",
                      properties: {
                        reliability: { type: "string" },
                        validity: { type: "string" },
                      },
                      additionalProperties: true,
                    },
                    reference_values: {
                      type: "object",
                      additionalProperties: true,
                    },
                    instructions: { type: "string" },
                  },
                  required: [
                    "name",
                    "description",
                    "tool_type",
                    "scoring_method",
                    "condition_ids",
                    "interpretation_guide",
                    "psychometric_properties",
                    "reference_values",
                    "instructions",
                  ],
                  additionalProperties: true,
                },
              },
            },
            required: ["tools"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: toolsSchema,
        tool_choice: { type: "function", function: { name: "emit_assessment_tools" } },
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error", response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI provider error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCalls = data?.choices?.[0]?.message?.tool_calls ?? [];

    if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
      console.error("No tool calls returned", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Model did not return structured tools" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const argsStr: string = toolCalls[0]?.function?.arguments ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(argsStr);
    } catch (e) {
      console.error("Failed to parse tool arguments", e, argsStr.slice(0, 400));
      return new Response(JSON.stringify({ error: "Failed to parse structured output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tools = Array.isArray(parsed?.tools) ? parsed.tools : [];
    if (!Array.isArray(tools) || tools.length === 0) {
      return new Response(JSON.stringify({ error: "No tools returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

// Best-effort normalization
const normalized = tools.map((t: any) => ({
  name: String(t?.name ?? "Unnamed Tool"),
  description: String(t?.description ?? ""),
  tool_type: (t?.tool_type === "questionnaire" || t?.tool_type === "performance test") ? t.tool_type : "questionnaire",
  scoring_method: String(t?.scoring_method ?? ""),
  condition_ids: Array.isArray(t?.condition_ids) ? t.condition_ids : [],
  interpretation_guide: t?.interpretation_guide ?? {},
  psychometric_properties: t?.psychometric_properties ?? {},
  reference_values: t?.reference_values ?? {},
  instructions: String(t?.instructions ?? ""),
}));

// Persist to DB using service role to bypass RLS (trusted backend)
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
  return new Response(JSON.stringify({ error: 'Server configuration error' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Avoid inserting duplicates by name
let existingNames = new Set<string>();
try {
  const { data: existing, error: existingError } = await supabase
    .from('assessment_tools')
    .select('name');
  if (existingError) {
    console.error('Failed to fetch existing assessment tools:', existingError);
  } else {
    existingNames = new Set((existing ?? []).map((r: any) => String(r.name)));
  }
} catch (e) {
  console.error('Error loading existing tools:', e);
}

const toInsert = normalized.filter((t: any) => !existingNames.has(t.name));
let inserted = 0;
if (toInsert.length > 0) {
  const { error: insertError } = await supabase.from('assessment_tools').insert(toInsert);
  if (insertError) {
    console.error('Failed to insert assessment tools:', insertError);
  } else {
    inserted = toInsert.length;
  }
}

const result = { inserted, skipped: normalized.length - inserted, total: normalized.length };

return new Response(JSON.stringify(result), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
  } catch (error) {
    console.error("generate-assessment-tools error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});