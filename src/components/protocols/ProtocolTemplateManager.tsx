import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PremiumFeature } from "@/components/subscription/PremiumFeature";
import { useSubscription } from "@/hooks/useSubscription";
import {
  FileText,
  Download,
  Copy,
  Search,
  Star,
  Clock,
  User,
  Eye
} from "lucide-react";

interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  frequency_per_week: number;
  is_validated: boolean;
  created_at: string;
  condition_id: string | null;
  protocol_steps: any;
  evidence_ids: string[] | null;
  contraindications: string[] | null;
  precautions: string[] | null;
  expected_outcomes: string | null;
}

export const ProtocolTemplateManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolTemplate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_protocols')
        .select('*')
        .eq('is_validated', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as ProtocolTemplate[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load protocol templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (template: ProtocolTemplate) => {
    setSelectedProtocol(template);
    setViewDialogOpen(true);
  };

  const handleClone = async (template: ProtocolTemplate) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to clone protocols",
        variant: "destructive",
      });
      return;
    }
    
    setCloning(template.id);
    try {
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session. Please log in again.");
      }

      const { data, error } = await supabase
        .from('treatment_protocols')
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          duration_weeks: template.duration_weeks,
          frequency_per_week: template.frequency_per_week,
          condition_id: template.condition_id,
          protocol_steps: template.protocol_steps,
          evidence_ids: template.evidence_ids,
          contraindications: template.contraindications,
          precautions: template.precautions,
          expected_outcomes: template.expected_outcomes,
          created_by: session.user.id,
          is_validated: false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Protocol cloned successfully. You can now customize it.",
      });
    } catch (error: any) {
      console.error('Clone error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clone protocol. Please ensure you are logged in.",
        variant: "destructive",
      });
    } finally {
      setCloning(null);
    }
  };

  if (!subscribed) {
    return (
      <PremiumFeature feature="Protocol Template Manager" showUpgrade={true}>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Protocol Template Library</h2>
          <p className="text-muted-foreground">Access evidence-based protocol templates</p>
        </div>
      </PremiumFeature>
    );
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Protocol Template Manager</h1>
        <p className="text-muted-foreground">Browse and clone validated treatment protocols</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Validated
                  </Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {template.duration_weeks} weeks
                    </span>
                    <span>{template.frequency_per_week}x/week</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleView(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleClone(template)}
                      disabled={cloning === template.id}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {cloning === template.id ? "Cloning..." : "Clone"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProtocol?.name}
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Validated
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedProtocol?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedProtocol && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </h4>
                  <p className="text-muted-foreground">{selectedProtocol.duration_weeks} weeks</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Frequency</h4>
                  <p className="text-muted-foreground">{selectedProtocol.frequency_per_week}x per week</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handleClone(selectedProtocol);
                    setViewDialogOpen(false);
                  }}
                  disabled={cloning === selectedProtocol.id}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {cloning === selectedProtocol.id ? "Cloning..." : "Clone This Protocol"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};