import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Mic, MicOff, Volume2, VolumeX, Send, Brain } from "lucide-react";
import { AudioRecorder, encodeAudioForAPI, playAudioData } from "@/utils/audioUtils";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'audio';
}

export const RealtimeChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectToRealtimeChat = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use real-time chat",
          variant: "destructive",
        });
        return;
      }

      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      // Connect to WebSocket
      const wsUrl = `wss://xbonrxqrzkuwxovyqrxx.functions.supabase.co/realtime-chat`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("Connected to realtime chat");
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Real-time AI chat is ready",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data.type);

          switch (data.type) {
            case 'response.audio.delta':
              if (audioEnabled && audioContextRef.current) {
                const binaryString = atob(data.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await playAudioData(audioContextRef.current, bytes);
              }
              setIsAISpeaking(true);
              break;

            case 'response.audio.done':
              setIsAISpeaking(false);
              break;

            case 'response.audio_transcript.delta':
              // Update the current assistant message
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, text: lastMessage.text + data.delta }
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      text: data.delta,
                      sender: 'assistant',
                      timestamp: new Date(),
                      type: 'text'
                    }
                  ];
                }
              });
              break;

            case 'conversation.item.input_audio_transcription.completed':
              // Add user's transcribed message
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  text: data.transcript,
                  sender: 'user',
                  timestamp: new Date(),
                  type: 'audio'
                }
              ]);
              break;

            case 'error':
              toast({
                title: "Chat error",
                description: data.message || "An error occurred",
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection error",
          description: "Failed to connect to real-time chat",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setIsRecording(false);
        setIsAISpeaking(false);
      };

    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to chat",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
    setIsAISpeaking(false);
  };

  const startRecording = async () => {
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        toast({
          title: "Not connected",
          description: "Please connect to chat first",
          variant: "destructive",
        });
        return;
      }

      audioRecorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await audioRecorderRef.current.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);

    // Commit the audio buffer
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.commit'
      }));
      wsRef.current.send(JSON.stringify({
        type: 'response.create'
      }));
    }
  };

  const sendTextMessage = () => {
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: textInput,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      }
    ]);

    // Send to AI
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: textInput
          }
        ]
      }
    }));

    wsRef.current.send(JSON.stringify({
      type: 'response.create'
    }));

    setTextInput("");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Clinical Assistant
            </CardTitle>
            <CardDescription>
              Real-time voice and text chat with AI physiotherapy expert
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isAISpeaking && (
              <Badge variant="outline" className="animate-pulse">
                AI Speaking
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button onClick={connectToRealtimeChat} size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Connect to Chat
            </Button>
          ) : (
            <Button onClick={disconnect} variant="outline" size="sm">
              Disconnect
            </Button>
          )}
          
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            variant="outline"
            size="sm"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 border rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2" />
              <p>Start a conversation with your AI clinical assistant</p>
              <p className="text-sm">Ask about conditions, treatments, or evidence</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {message.sender === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    {message.type === 'audio' && (
                      <Badge variant="outline">
                        <Mic className="h-3 w-3 mr-1" />
                        Voice
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        {isConnected && (
          <div className="space-y-3">
            {/* Voice controls */}
            <div className="flex justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {isRecording ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Text input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your question..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                disabled={!isConnected}
              />
              <Button
                onClick={sendTextMessage}
                disabled={!textInput.trim() || !isConnected}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};