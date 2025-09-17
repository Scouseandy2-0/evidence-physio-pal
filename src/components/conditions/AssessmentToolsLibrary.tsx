import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PremiumFeature, FreeTierBanner } from "@/components/subscription/PremiumFeature";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Search,
  FileText,
  Clock,
  TrendingUp,
  Users,
  Star,
  Play,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Filter,
  BarChart3
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
  condition_ids: string[];
}

interface AssessmentToolsLibraryProps {
  onToolSelect?: (toolId: string) => void;
}

export const AssessmentToolsLibrary = ({ onToolSelect }: AssessmentToolsLibraryProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscribed } = useSubscription();
  const [tools, setTools] = useState<AssessmentTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<AssessmentTool | null>(null);

  useEffect(() => {
    fetchAssessmentTools();
  }, []);

  const fetchAssessmentTools = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_tools')
        .select('*')
        .order('name');

      if (error) throw error;
      setTools(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading assessment tools",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toolTypes = [...new Set(tools.map(tool => tool.tool_type).filter(Boolean))];
  
  const categories = [
    { id: 'pain', name: 'Pain Assessment', keywords: ['pain', 'vas', 'nprs', 'mcgill', 'catastrophizing'] },
    { id: 'function', name: 'Functional Assessment', keywords: ['disability', 'function', 'odi', 'ndi', 'dash', 'womac'] },
    { id: 'balance', name: 'Balance & Mobility', keywords: ['balance', 'gait', 'berg', 'tug', 'dynamic', 'confidence'] },
    { id: 'cognitive', name: 'Cognitive Assessment', keywords: ['cognitive', 'mental', 'mmse', 'moca'] },
    { id: 'qol', name: 'Quality of Life', keywords: ['quality', 'sf-36', 'eq-5d', 'respiratory'] },
    { id: 'sports', name: 'Sports & Activity', keywords: ['knee', 'ikdc', 'lysholm', 'sport', 'activity'] },
    { id: 'pediatric', name: 'Pediatric Assessment', keywords: ['pediatric', 'child', 'podci'] },
    { id: 'workplace', name: 'Work & Ergonomics', keywords: ['work', 'quick', 'dash', 'ability'] },
    { id: 'psychological', name: 'Psychological Factors', keywords: ['fear', 'avoidance', 'beliefs', 'fabq'] }
  ];

  const getCategoryForTool = (tool: AssessmentTool) => {
    const toolText = `${tool.name} ${tool.description}`.toLowerCase();
    for (const category of categories) {
      if (category.keywords.some(keyword => toolText.includes(keyword))) {
        return category.id;
      }
    }
    return 'other';
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || tool.tool_type === selectedType;
    const matchesCategory = selectedCategory === 'all' || getCategoryForTool(tool) === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Filter tools based on subscription status
  const getAccessibleTools = (toolsList: AssessmentTool[]) => {
    if (subscribed) {
      return toolsList;
    }
    // Free users get limited access
    return toolsList.slice(0, 8);
  };

  const accessibleTools = getAccessibleTools(filteredTools);
  const showUpgradePrompt = !subscribed && filteredTools.length > 8;

  const startAssessment = (tool: AssessmentTool) => {
    navigate(`/assessment/${tool.id}`);
  };

  const getReliabilityColor = (reliability: string) => {
    const value = parseFloat(reliability);
    if (value >= 0.9) return 'bg-green-500';
    if (value >= 0.8) return 'bg-blue-500';
    if (value >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const AssessmentToolCard = ({ tool }: { tool: AssessmentTool }) => {
    const psychProps = tool.psychometric_properties || {};
    const reliability = psychProps.reliability || 'N/A';
    const validity = psychProps.validity || 'N/A';
    const responsiveness = psychProps.responsiveness || 'N/A';

    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg leading-tight">{tool.name}</CardTitle>
              <CardDescription className="mt-2">{tool.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2">
              {tool.tool_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Scoring:</span>
              <span className="font-medium">{tool.scoring_method}</span>
            </div>
            
            {reliability !== 'N/A' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reliability:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{reliability}</span>
                  <div className={`w-3 h-3 rounded-full ${getReliabilityColor(reliability)}`} />
                </div>
              </div>
            )}
            
            {responsiveness !== 'N/A' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Responsiveness:</span>
                <Badge variant="outline" className="text-xs">
                  {responsiveness}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => startAssessment(tool)}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedTool(tool)}>
                  <BookOpen className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{tool.name}</DialogTitle>
                  <DialogDescription>{tool.description}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Assessment Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {tool.tool_type}
                      </div>
                      <div>
                        <span className="font-medium">Scoring:</span> {tool.scoring_method}
                      </div>
                    </div>
                  </div>

                  {tool.instructions && (
                    <div>
                      <h4 className="font-medium mb-2">Instructions</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {tool.instructions}
                      </p>
                    </div>
                  )}

                  {tool.psychometric_properties && Object.keys(tool.psychometric_properties).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Psychometric Properties</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(tool.psychometric_properties).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tool.interpretation_guide && Object.keys(tool.interpretation_guide).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Score Interpretation</h4>
                      <div className="space-y-2">
                        {Object.entries(tool.interpretation_guide).map(([range, meaning]) => (
                          <div key={range} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                            <span className="font-medium">{range}:</span>
                            <span>{meaning as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => startAssessment(tool)} 
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start This Assessment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
          Comprehensive collection of validated assessment tools for physiotherapy practice. 
          Over {tools.length} evidence-based instruments for clinical decision making.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tools.length}</div>
            <p className="text-xs text-muted-foreground">Available assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Clinical domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Reliability</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tools.filter(t => {
                const rel = t.psychometric_properties?.reliability;
                return rel && parseFloat(rel) >= 0.9;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Reliability ≥ 0.9</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tools.filter(t => t.tool_type === 'Self-report').length}
            </div>
            <p className="text-xs text-muted-foreground">Self-report tools</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessment tools by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {toolTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Free Tier Banner */}
      {showUpgradePrompt && (
        <FreeTierBanner 
          currentItem={accessibleTools.length} 
          totalItems={filteredTools.length}
          category="assessment tools"
        />
      )}

      {/* Tools Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {accessibleTools.length} of {filteredTools.length} assessment tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleTools.map((tool) => (
              <AssessmentToolCard key={tool.id} tool={tool} />
            ))}
            {showUpgradePrompt && (
              <PremiumFeature feature="additional assessment tools">
                <div className="h-full"></div>
              </PremiumFeature>
            )}
          </div>

          {accessibleTools.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No assessment tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {categories.map((category) => {
            const categoryTools = accessibleTools.filter(tool => getCategoryForTool(tool) === category.id);
            if (categoryTools.length === 0) return null;

            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>
                    {categoryTools.length} assessment tool{categoryTools.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTools.map((tool) => (
                      <AssessmentToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};