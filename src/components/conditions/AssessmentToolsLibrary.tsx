import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Activity
} from "lucide-react";

interface AssessmentTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  scoring_method: string;
  interpretation_guide: any;
  psychometric_properties: any;
  reference_values: any;
  instructions: string;
  condition_ids?: string[];
}

interface ConditionDetails {
  id: string;
  name: string;
  category: string;
  description: string;
  icd_codes: string[];
  keywords: string[];
  prevalence_data: any;
}

export const AssessmentToolsLibrary = () => {
  const [assessmentTools, setAssessmentTools] = useState<AssessmentTool[]>([]);
  const [conditions, setConditions] = useState<ConditionDetails[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'self-report' | 'performance-based'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessmentTools();
    fetchConditions();
  }, []);

  const fetchAssessmentTools = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_tools')
        .select('*')
        .order('name');

      if (error) throw error;
      setAssessmentTools(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching assessment tools",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .order('name');

      if (error) throw error;
      setConditions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching conditions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConditionNames = (conditionIds: string[]) => {
    if (!conditionIds || conditionIds.length === 0) return ['General Use'];
    return conditionIds.map(id => {
      const condition = conditions.find(c => c.id === id);
      return condition ? condition.name : 'Unknown';
    });
  };

  const filteredTools = assessmentTools.filter(tool => {
    if (selectedCategory === 'all') return true;
    const toolType = tool.tool_type?.toLowerCase() || '';
    if (selectedCategory === 'self-report') {
      return toolType.includes('self-report') || toolType.includes('questionnaire');
    }
    if (selectedCategory === 'performance-based') {
      return toolType.includes('performance') || toolType.includes('objective');
    }
    return true;
  });

  const getReliabilityLevel = (icc: string) => {
    const value = parseFloat(icc);
    if (value >= 0.9) return { level: 'Excellent', color: 'bg-green-500' };
    if (value >= 0.75) return { level: 'Good', color: 'bg-blue-500' };
    if (value >= 0.5) return { level: 'Moderate', color: 'bg-yellow-500' };
    return { level: 'Poor', color: 'bg-red-500' };
  };

  const AssessmentToolCard = ({ tool }: { tool: AssessmentTool }) => {
    const conditionNames = getConditionNames(tool.condition_ids || []);
    const psychProperties = tool.psychometric_properties || {};
    const interpretationGuide = tool.interpretation_guide || {};
    const referenceValues = tool.reference_values || {};

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              <CardDescription className="mt-2">
                {tool.description}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {tool.tool_type || 'Assessment'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              Applicable Conditions
            </h4>
            <div className="flex flex-wrap gap-1">
              {conditionNames.map((name, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <ClipboardList className="h-4 w-4" />
              Scoring Method
            </h4>
            <p className="text-sm text-muted-foreground">
              {tool.scoring_method || 'Standard scoring method'}
            </p>
          </div>

          {Object.keys(psychProperties).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Psychometric Properties
                </h4>
                <div className="space-y-2">
                  {psychProperties.reliability && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Reliability:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{psychProperties.reliability}</span>
                        {psychProperties.reliability.includes('ICC') && (
                          <div className={`w-2 h-2 rounded-full ${getReliabilityLevel(psychProperties.reliability.split(' ')[1]).color}`}></div>
                        )}
                      </div>
                    </div>
                  )}
                  {psychProperties.validity && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Validity:</span>
                      <span className="font-medium">{psychProperties.validity}</span>
                    </div>
                  )}
                  {psychProperties.responsiveness && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Responsiveness:</span>
                      <span className="font-medium">{psychProperties.responsiveness}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {Object.keys(interpretationGuide).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  Interpretation Guide
                </h4>
                <div className="space-y-1">
                  {Object.entries(interpretationGuide).map(([key, value], index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              Use Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategorySummary = ({ category }: { category: string }) => {
    const categoryTools = assessmentTools.filter(tool => {
      const toolType = tool.tool_type?.toLowerCase() || '';
      if (category === 'self-report') {
        return toolType.includes('self-report') || toolType.includes('questionnaire');
      }
      if (category === 'performance-based') {
        return toolType.includes('performance') || toolType.includes('objective');
      }
      return false;
    });

    const icons = {
      'self-report': ClipboardList,
      'performance-based': Activity
    };

    const Icon = icons[category as keyof typeof icons];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="capitalize">{category.replace('-', ' ')} Tools</CardTitle>
              <CardDescription>
                {categoryTools.length} tools available
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryTools.slice(0, 3).map(tool => (
              <div key={tool.id} className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium text-sm">{tool.name}</span>
                <Badge variant="outline" className="text-xs">
                  {tool.tool_type}
                </Badge>
              </div>
            ))}
            {categoryTools.length > 3 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCategory(category as any)}
                >
                  View all {categoryTools.length} tools
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Assessment Tools Library</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive collection of validated assessment tools for physiotherapy practice 
          with scoring guides and psychometric properties.
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Tools</TabsTrigger>
          <TabsTrigger value="self-report">Self-Report</TabsTrigger>
          <TabsTrigger value="performance-based">Performance-Based</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategorySummary category="self-report" />
            <CategorySummary category="performance-based" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentTools.map(tool => (
              <AssessmentToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="self-report" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <AssessmentToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance-based" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <AssessmentToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No assessment tools found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later for more tools.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};