import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumFeature, FreeTierBanner } from "@/components/subscription/PremiumFeature";
import { ChatGPTInterface } from "@/components/ai/ChatGPTInterface";
import { 
  Search, 
  Bone, 
  Brain, 
  Wind, 
  FileText, 
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Lock,
  Crown,
  MessageSquare,
  Database,
  BookOpen,
  Play,
  Stethoscope
} from "lucide-react";

interface Condition {
  id: string;
  name: string;
  category: 'msk' | 'neurological' | 'respiratory';
  description: string;
  icd_codes: string[];
  keywords: string[];
  prevalence_data: any;
}

interface AssessmentTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  scoring_method: string;
  interpretation_guide: any;
  psychometric_properties: any;
  reference_values: any;
  condition_ids: string[];
  instructions?: string;
}

const categoryIcons = {
  msk: Bone,
  neurological: Brain,
  respiratory: Wind
};

const categoryColors = {
  msk: 'bg-blue-500',
  neurological: 'bg-purple-500', 
  respiratory: 'bg-green-500'
};

const categoryNames = {
  msk: 'Musculoskeletal',
  neurological: 'Neurological',
  respiratory: 'Respiratory'
};

export const ConditionModules = () => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [assessmentTools, setAssessmentTools] = useState<AssessmentTool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'msk' | 'neurological' | 'respiratory'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [evidenceData, setEvidenceData] = useState<any[]>([]);
  const { toast } = useToast();
  const { subscribed } = useSubscription();

  useEffect(() => {
    fetchConditions();
    fetchAssessmentTools();
  }, []);

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
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const filteredConditions = conditions.filter(condition => {
    const matchesCategory = selectedCategory === 'all' || condition.category === selectedCategory;
    const matchesSearch = condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         condition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         condition.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter conditions based on subscription status for free tier
  const getAccessibleConditions = (categoryConditions: Condition[]) => {
    if (subscribed) {
      return categoryConditions;
    }
    // Free users only get the first condition in each category
    return categoryConditions.slice(0, 1);
  };

  const mskConditions = getAccessibleConditions(filteredConditions.filter(c => c.category === 'msk'));
  const respiratoryConditions = getAccessibleConditions(filteredConditions.filter(c => c.category === 'respiratory'));
  const neuroConditions = getAccessibleConditions(filteredConditions.filter(c => c.category === 'neurological'));

  const getConditionsByCategory = (category: 'msk' | 'neurological' | 'respiratory') => {
    return conditions.filter(c => c.category === category);
  };

  const getAssessmentToolsForCondition = (conditionId: string) => {
    return assessmentTools.filter(tool => 
      tool.condition_ids && tool.condition_ids.includes(conditionId)
    );
  };

  const searchEvidence = async (conditionName: string) => {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .or(`title.ilike.%${conditionName}%,abstract.ilike.%${conditionName}%,tags.cs.{${conditionName}}`)
        .eq('is_active', true)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching evidence",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const searchExternalSources = async (conditionName: string) => {
    try {
      // Search multiple databases
      const [pubmedResult, cochraneResult, pedroResult] = await Promise.allSettled([
        supabase.functions.invoke('pubmed-integration', {
          body: { searchTerms: conditionName, maxResults: 5 }
        }),
        supabase.functions.invoke('cochrane-integration', {
          body: { searchTerms: conditionName, maxResults: 3 }
        }),
        supabase.functions.invoke('pedro-integration', {
          body: { searchTerms: conditionName, condition: conditionName, maxResults: 3 }
        })
      ]);

      toast({
        title: "Evidence Search Complete",
        description: `Searched PubMed, Cochrane, and PEDro databases for ${conditionName}`,
      });
      
      // Refresh local evidence after external search
      return await searchEvidence(conditionName);
    } catch (error: any) {
      toast({
        title: "External search error",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const ConditionCard = ({ condition }: { condition: Condition }) => {
    const Icon = categoryIcons[condition.category];
    const tools = getAssessmentToolsForCondition(condition.id);
    const prevalenceData = condition.prevalence_data || {};

    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${categoryColors[condition.category]}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{condition.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {categoryNames[condition.category]}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {condition.description}
          </CardDescription>

          {prevalenceData.prevalence && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Prevalence:</span>
              <span className="font-medium">{prevalenceData.prevalence}</span>
            </div>
          )}

          {condition.icd_codes && condition.icd_codes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {condition.icd_codes.map(code => (
                <Badge key={code} variant="outline" className="text-xs">
                  {code}
                </Badge>
              ))}
            </div>
          )}

          {tools.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span>Assessment Tools ({tools.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tools.slice(0, 2).map(tool => (
                  <Badge key={tool.id} variant="secondary" className="text-xs">
                    {tool.name}
                  </Badge>
                ))}
                {tools.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tools.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => {
                setSelectedCondition(condition);
                setShowAIChat(true);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask AI about {condition.name}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                if (!subscribed) {
                  toast({
                    title: "Premium Feature",
                    description: "Upgrade to access evidence search",
                    variant: "destructive",
                  });
                  return;
                }
                const evidence = await searchEvidence(condition.name);
                setEvidenceData(evidence);
                toast({
                  title: "Evidence Search",
                  description: `Found ${evidence.length} studies for ${condition.name}`,
                });
              }}
            >
              <Database className="h-4 w-4 mr-2" />
              {subscribed ? "Search Evidence" : "Upgrade for Evidence"}
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                if (!subscribed) {
                  toast({
                    title: "Premium Feature", 
                    description: "Upgrade to access external databases",
                    variant: "destructive",
                  });
                  return;
                }
                const evidence = await searchExternalSources(condition.name);
                setEvidenceData(evidence);
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {subscribed ? "Search External DBs" : "Upgrade for External"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategoryOverview = ({ category }: { category: 'msk' | 'neurological' | 'respiratory' }) => {
    const conditions = getConditionsByCategory(category);
    const Icon = categoryIcons[category];
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${categoryColors[category]}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{categoryNames[category]} Conditions</CardTitle>
              <CardDescription>
                {conditions.length} conditions with evidence-based protocols
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conditions.slice(0, 6).map(condition => (
              <div key={condition.id} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{condition.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {condition.description}
                </p>
              </div>
            ))}
          </div>
          {conditions.length > 6 && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setSelectedCategory(category)}
            >
              View All {conditions.length} {categoryNames[category]} Conditions
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading condition modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Condition-Specific Modules</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive evidence-based information for MSK, neurological, and respiratory conditions 
          with assessment tools and treatment protocols.
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Conditions</TabsTrigger>
          <TabsTrigger value="msk">Musculoskeletal</TabsTrigger>
          <TabsTrigger value="neurological">Neurological</TabsTrigger>
          <TabsTrigger value="respiratory">Respiratory</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conditions by name, description, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-6">
            <CategoryOverview category="msk" />
            <CategoryOverview category="neurological" />
            <CategoryOverview category="respiratory" />
          </div>
        </TabsContent>

        <TabsContent value="msk" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search MSK conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <FreeTierBanner 
            currentItem={mskConditions.length} 
            totalItems={conditions.filter(c => c.category === 'msk').length}
            category="MSK"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mskConditions.map(condition => (
              <ConditionCard key={condition.id} condition={condition} />
            ))}
            {!subscribed && conditions.filter(c => c.category === 'msk').length > 1 && (
              <PremiumFeature feature="additional MSK conditions">
                <div></div>
              </PremiumFeature>
            )}
          </div>
        </TabsContent>

        <TabsContent value="neurological" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search neurological conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <FreeTierBanner 
            currentItem={neuroConditions.length} 
            totalItems={conditions.filter(c => c.category === 'neurological').length}
            category="Neurological"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neuroConditions.map(condition => (
              <ConditionCard key={condition.id} condition={condition} />
            ))}
            {!subscribed && conditions.filter(c => c.category === 'neurological').length > 1 && (
              <PremiumFeature feature="additional neurological conditions">
                <div></div>
              </PremiumFeature>
            )}
          </div>
        </TabsContent>

        <TabsContent value="respiratory" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search respiratory conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <FreeTierBanner 
            currentItem={respiratoryConditions.length} 
            totalItems={conditions.filter(c => c.category === 'respiratory').length}
            category="Respiratory"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {respiratoryConditions.map(condition => (
              <ConditionCard key={condition.id} condition={condition} />
            ))}
            {!subscribed && conditions.filter(c => c.category === 'respiratory').length > 1 && (
              <PremiumFeature feature="additional respiratory conditions">
                <div></div>
              </PremiumFeature>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {filteredConditions.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No conditions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse by category above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Chat Dialog */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              AI Assistant - {selectedCondition?.name}
            </DialogTitle>
            <DialogDescription>
              Get evidence-based guidance and clinical insights for {selectedCondition?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedCondition && (
              <ChatGPTInterface 
                initialContext={`Patient condition: ${selectedCondition.name}\nDescription: ${selectedCondition.description}\nCategory: ${categoryNames[selectedCondition.category]}\nICD Codes: ${selectedCondition.icd_codes?.join(', ')}`}
                specialty={selectedCondition.category}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence Results Dialog */}
      <Dialog open={evidenceData.length > 0} onOpenChange={() => setEvidenceData([])}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Evidence Results ({evidenceData.length})
            </DialogTitle>
            <DialogDescription>
              Latest research evidence from multiple databases
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {evidenceData.map((evidence, index) => (
              <Card key={evidence.id || index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{evidence.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{evidence.study_type}</Badge>
                    <Badge variant={evidence.evidence_level === 'A' ? 'default' : 'secondary'}>
                      Level {evidence.evidence_level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{evidence.journal}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {evidence.abstract}
                  </p>
                  {evidence.key_findings && (
                    <p className="text-sm mt-2 font-medium">
                      Key Findings: {evidence.key_findings}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};