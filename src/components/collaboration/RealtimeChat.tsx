import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Hash, MessageSquare } from "lucide-react";

export const RealtimeChat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  
  const channels = [
    { id: 'general', name: 'General Discussion', description: 'General physiotherapy discussions' },
    { id: 'msk-research', name: 'MSK Research', description: 'Musculoskeletal research and evidence' },
    { id: 'neuro-rehab', name: 'Neuro Rehabilitation', description: 'Neurological rehabilitation techniques' }
  ];

  const sampleMessages = [
    {
      id: '1',
      content: 'Welcome to the Evidence-Based Physiotherapy chat! Feel free to discuss research and share insights.',
      user_name: 'System',
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Professional Chat</h1>
        <p className="text-muted-foreground">Connect with fellow physiotherapy professionals in real-time discussions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-5 w-5" />
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-3">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedChannel(channel.id)}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {channel.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              {channels.find(c => c.id === selectedChannel)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-4">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Professional Chat</h3>
                  <p className="text-muted-foreground">Start conversations about evidence-based practice</p>
                </div>
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};