import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Edit, Clock, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Protocol {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  frequency_per_week: number | null;
  is_validated: boolean | null;
  created_at: string;
  protocol_steps: any;
  expected_outcomes: string | null;
  contraindications: string[] | null;
  precautions: string[] | null;
  evidence_ids: string[] | null;
}

export const MyProtocols = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [deleteProtocolId, setDeleteProtocolId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyProtocols();
  }, []);

  const fetchMyProtocols = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your protocols",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("treatment_protocols")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProtocols(data || []);
    } catch (error) {
      console.error("Error fetching protocols:", error);
      toast({
        title: "Error",
        description: "Failed to load your protocols",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (protocolId: string) => {
    try {
      const { error } = await supabase
        .from("treatment_protocols")
        .delete()
        .eq("id", protocolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Protocol deleted successfully",
      });
      
      fetchMyProtocols();
    } catch (error) {
      console.error("Error deleting protocol:", error);
      toast({
        title: "Error",
        description: "Failed to delete protocol",
        variant: "destructive",
      });
    }
    setDeleteProtocolId(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (protocols.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            You haven't created or cloned any protocols yet.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Visit the Template Library to clone validated protocols or use the Protocol Builder to create your own.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{protocol.name}</CardTitle>
                {protocol.is_validated && (
                  <Badge variant="secondary">Validated</Badge>
                )}
              </div>
              {protocol.description && (
                <CardDescription className="line-clamp-2">
                  {protocol.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                {protocol.duration_weeks && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{protocol.duration_weeks} weeks</span>
                  </div>
                )}
                {protocol.frequency_per_week && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{protocol.frequency_per_week}x/week</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProtocol(protocol)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteProtocolId(protocol.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedProtocol} onOpenChange={() => setSelectedProtocol(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedProtocol?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedProtocol && (
              <div className="space-y-6">
                {selectedProtocol.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedProtocol.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedProtocol.duration_weeks && (
                    <div>
                      <h3 className="font-semibold mb-1">Duration</h3>
                      <p className="text-muted-foreground">{selectedProtocol.duration_weeks} weeks</p>
                    </div>
                  )}
                  {selectedProtocol.frequency_per_week && (
                    <div>
                      <h3 className="font-semibold mb-1">Frequency</h3>
                      <p className="text-muted-foreground">{selectedProtocol.frequency_per_week} times per week</p>
                    </div>
                  )}
                </div>

                {selectedProtocol.expected_outcomes && (
                  <div>
                    <h3 className="font-semibold mb-2">Expected Outcomes</h3>
                    <p className="text-muted-foreground">{selectedProtocol.expected_outcomes}</p>
                  </div>
                )}

                {selectedProtocol.protocol_steps && (
                  <div>
                    <h3 className="font-semibold mb-2">Protocol Steps</h3>
                    <div className="space-y-2">
                      {Array.isArray(selectedProtocol.protocol_steps) ? (
                        selectedProtocol.protocol_steps.map((step: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <p className="font-medium">Step {index + 1}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {typeof step === 'string' ? step : JSON.stringify(step)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">{JSON.stringify(selectedProtocol.protocol_steps)}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedProtocol.contraindications && selectedProtocol.contraindications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Contraindications</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProtocol.contraindications.map((item, index) => (
                        <li key={index} className="text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProtocol.precautions && selectedProtocol.precautions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Precautions</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProtocol.precautions.map((item, index) => (
                        <li key={index} className="text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProtocolId} onOpenChange={() => setDeleteProtocolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Protocol</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this protocol? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProtocolId && handleDelete(deleteProtocolId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
