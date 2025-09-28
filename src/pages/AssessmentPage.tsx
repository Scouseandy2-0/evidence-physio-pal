import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveAssessment } from "@/components/assessment/InteractiveAssessment";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AssessmentTool {
  id: string;
  name: string;
  description: string | null;
  tool_type: string | null;
  scoring_method: string | null;
  interpretation_guide: any;
  psychometric_properties: any;
  reference_values: any;
  instructions: string | null;
  condition_ids: string[] | null;
}

const AssessmentPage = () => {
  const { toolId } = useParams();
  const [tool, setTool] = useState<AssessmentTool | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (toolId) {
      fetchTool(toolId);
    }
  }, [toolId]);

  const fetchTool = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTool(data);
    } catch (error: any) {
      toast({
        title: "Error loading assessment tool",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assessment tool...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Assessment Tool Not Found</h1>
            <p className="text-muted-foreground">The requested assessment tool could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <InteractiveAssessment tool={tool} />
    </div>
  );
};

export default AssessmentPage;