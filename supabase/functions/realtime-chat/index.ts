import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, upgrade",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REALTIME-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    logStep("Non-WebSocket request received");
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    logStep("WebSocket connection initiated");

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    let openAISocket: WebSocket | null = null;
    let sessionInitialized = false;

    socket.onopen = () => {
      logStep("Client WebSocket opened");
      
      // Connect to OpenAI Realtime API
      openAISocket = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
        ["realtime", `openai-insecure-api-key.${openAIApiKey}`]
      );

      openAISocket.onopen = () => {
        logStep("Connected to OpenAI Realtime API");
      };

      openAISocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          logStep("Received from OpenAI", { type: data.type });

          // Log full error details if it's an error event
          if (data.type === 'error') {
            logStep("OpenAI Error Details", { 
              error: data.error,
              code: data.error?.code,
              message: data.error?.message,
              fullEvent: data
            });
          }

          // Handle session.created event
          if (data.type === 'session.created' && !sessionInitialized) {
            logStep("Session created, sending session update");
            sessionInitialized = true;
            
            const sessionUpdate = {
              type: "session.update",
              session: {
                type: "session",
                modalities: ["text", "audio"],
                instructions: "You are an expert physiotherapist assistant helping with clinical discussions. Provide evidence-based insights, treatment recommendations, and answer questions about physiotherapy practice. Be concise but thorough.",
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                tools: [
                  {
                    type: "function",
                    name: "search_evidence",
                    description: "Search for physiotherapy evidence and research",
                    parameters: {
                      type: "object",
                      properties: {
                        condition: { type: "string" },
                        intervention: { type: "string" }
                      },
                      required: ["condition"]
                    }
                  }
                ],
                tool_choice: "auto",
                temperature: 0.7,
                max_response_output_tokens: 1000
              }
            };
            
            openAISocket?.send(JSON.stringify(sessionUpdate));
          }

          // Forward all messages to client
          socket.send(event.data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logStep("Error processing OpenAI message", { error: errorMessage });
        }
      };

      openAISocket.onerror = (error) => {
        logStep("OpenAI WebSocket error", error);
        socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
      };

      openAISocket.onclose = () => {
        logStep("OpenAI WebSocket closed");
        socket.close();
      };
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        logStep("Received from client", { type: data.type });
        
        // Forward client messages to OpenAI
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logStep("Error processing client message", { error: errorMessage });
      }
    };

    socket.onclose = () => {
      logStep("Client WebSocket closed");
      openAISocket?.close();
    };

    socket.onerror = (error) => {
      logStep("Client WebSocket error", error);
      openAISocket?.close();
    };

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});