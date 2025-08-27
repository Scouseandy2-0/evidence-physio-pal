import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-EVIDENCE-SUMMARIZER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { evidenceText, condition, requestType = 'summary' } = await req.json();
    logStep("Received request", { condition, requestType });

    if (!evidenceText) {
      throw new Error('Evidence text is required');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (requestType) {
      case 'summary':
        systemPrompt = `You are an expert physiotherapist and researcher. Summarize research evidence into clear, actionable clinical insights. Focus on:
        - Key findings and their clinical significance
        - Evidence quality and level
        - Clinical implications and practical applications
        - Limitations and considerations
        Keep summaries concise but comprehensive for busy clinicians.`;
        userPrompt = `Summarize this research evidence for ${condition || 'physiotherapy practice'}:\n\n${evidenceText}`;
        break;
      
      case 'recommendations':
        systemPrompt = `You are an expert physiotherapist providing evidence-based treatment recommendations. Generate specific, practical recommendations based on research evidence. Include:
        - Specific interventions and techniques
        - Dosage and frequency recommendations
        - Expected outcomes and timeframes
        - Contraindications and precautions
        - Evidence level supporting each recommendation`;
        userPrompt = `Based on this evidence for ${condition || 'the condition'}, provide specific treatment recommendations:\n\n${evidenceText}`;
        break;
      
      case 'clinical_questions':
        systemPrompt = `You are an expert physiotherapist identifying important clinical questions. Generate relevant clinical questions that arise from research evidence. Focus on:
        - Gaps in current evidence
        - Areas needing further research
        - Practical implementation questions
        - Patient-specific considerations`;
        userPrompt = `Based on this evidence for ${condition || 'the condition'}, what key clinical questions should practitioners consider:\n\n${evidenceText}`;
        break;
    }

    logStep("Making OpenAI API call");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logStep("OpenAI API error", errorData);
      throw new Error(errorData.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    logStep("AI response generated successfully");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      requestType,
      condition 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});