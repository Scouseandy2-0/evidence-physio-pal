import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
  specialty?: string;
  useStream?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { messages, context, specialty = 'physiotherapy', useStream = false }: ChatRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required');
    }

    // Enhanced system prompt for physiotherapy AI assistant
    const systemPrompt = `You are Dr. PhysioAI, an expert physiotherapist and evidence-based practice specialist. You have extensive knowledge in:

CORE COMPETENCIES:
- Musculoskeletal assessment and treatment
- Neurological rehabilitation
- Cardiopulmonary physiotherapy
- Sports medicine and injury prevention
- Pain science and management
- Movement analysis and biomechanics
- Exercise prescription and rehabilitation
- Manual therapy techniques

EVIDENCE-BASED PRACTICE:
- Latest research from PubMed, Cochrane, and PEDro
- GRADE evidence assessment
- Clinical practice guidelines (NICE, APTA, CSP)
- Systematic reviews and meta-analyses
- Clinical reasoning and decision-making

CLINICAL SPECIALTIES:
- Orthopedic physiotherapy
- Neurological conditions (stroke, SCI, MS, Parkinson's)
- Respiratory conditions (COPD, post-COVID)
- Chronic pain management
- Sports injuries and performance
- Pediatric and geriatric care

COMMUNICATION STYLE:
- Professional yet approachable
- Evidence-based recommendations
- Practical, actionable advice
- Clear explanations of complex concepts
- Appropriate clinical terminology
- Always consider patient safety and scope of practice

IMPORTANT GUIDELINES:
- Always emphasize the importance of proper assessment
- Recommend face-to-face evaluation when necessary
- Provide evidence levels when citing research
- Consider contraindications and red flags
- Promote best practice standards
- Stay within physiotherapy scope of practice

${context ? `\nCONTEXT: ${context}` : ''}

You should respond professionally, provide evidence-based information, and always prioritize patient safety. When discussing treatments, mention the evidence level and any important precautions.`;

    const allMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log(`AI Chat request: ${messages.length} messages, specialty: ${specialty}, streaming: ${useStream}`);

    if (useStream) {
      // Streaming response
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: allMessages,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limits exceeded, please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Payment required, please add funds to your Lovable AI workspace.');
        }
        throw new Error(`Lovable AI API error: ${response.status}`);
      }

      // Create a ReadableStream to handle the streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) return;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Decode the chunk and process each line
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.close();
                    return;
                  }
                  
                  try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) {
                      const formattedChunk = `data: ${JSON.stringify({ content })}\n\n`;
                      controller.enqueue(new TextEncoder().encode(formattedChunk));
                    }
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } else {
      // Non-streaming response
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: allMessages,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limits exceeded, please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Payment required, please add funds to your Lovable AI workspace.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Store conversation in database for learning and improvement
      try {
        await supabase
          .from('chat_conversations')
          .insert({
            messages: allMessages,
            response: aiResponse,
            specialty,
            context,
            created_at: new Date().toISOString(),
          });
      } catch (dbError) {
        console.error('Failed to store conversation:', dbError);
        // Continue anyway - don't fail the request
      }

      return new Response(JSON.stringify({ 
        response: aiResponse,
        model: 'google/gemini-2.5-flash',
        specialty,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('AI Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});