import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText,
  ExternalLink,
  Calendar,
  Building,
  Users,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface ClinicalGuideline {
  id: string;
  title: string;
  organization: string;
  condition_category: string;
  publication_year: number;
  last_updated: string;
  guideline_url: string;
  summary: string;
  recommendations: any[];
  evidence_strength: string;
  target_population: string;
  clinical_questions: string[];
  key_recommendations: string[];
  implementation_notes: string;
  tags: string[];
}

export const ClinicalGuidelinesLibrary = () => {
  const [guidelines, setGuidelines] = useState<ClinicalGuideline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('study_type', 'Clinical Practice Guideline')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedGuidelines: ClinicalGuideline[] = (data || []).map(item => {
        const gradeAssessment = item.grade_assessment as any;
        // Try multiple sources for the URL: grade_assessment.url, doi, or fallback
        const guidelineUrl = gradeAssessment?.url || item.doi || 
          (item.title?.toLowerCase().includes('nice') ? 'https://www.nice.org.uk/guidance' : '#');
        
        return {
          id: item.id,
          title: item.title,
          organization: item.journal || item.authors?.[0] || 'Unknown Organization',
          condition_category: getConditionCategory(item.tags || []),
          publication_year: item.publication_date ? new Date(item.publication_date).getFullYear() : new Date().getFullYear(),
          last_updated: item.updated_at || item.created_at,
          guideline_url: guidelineUrl,
          summary: item.abstract || 'No summary available',
          recommendations: [],
          evidence_strength: item.evidence_level || 'Not specified',
          target_population: gradeAssessment?.condition || 'General population',
          clinical_questions: [],
          key_recommendations: gradeAssessment?.recommendations || item.key_findings?.split(';') || [],
          implementation_notes: item.clinical_implications || '',
          tags: item.tags || []
        };
      });

      setGuidelines(transformedGuidelines);
    } catch (error: any) {
      toast({
        title: "Error fetching guidelines",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConditionCategory = (tags: string[]): string => {
    const tagStr = tags.join(' ').toLowerCase();
    if (tagStr.includes('back') || tagStr.includes('pain') || tagStr.includes('osteoarthritis') || tagStr.includes('manual')) {
      return 'MSK';
    }
    if (tagStr.includes('stroke') || tagStr.includes('brain') || tagStr.includes('neurological')) {
      return 'Neurological';
    }
    if (tagStr.includes('copd') || tagStr.includes('respiratory') || tagStr.includes('pulmonary')) {
      return 'Respiratory';
    }
    return 'General';
  };

  const fixGuidelineUrls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('fix-guideline-urls');

      if (error) throw error;

      toast({
        title: "URLs Fixed",
        description: data.message || "Successfully updated guideline URLs",
      });

      // Refresh the guidelines list
      await fetchGuidelines();
    } catch (error: any) {
      toast({
        title: "Error fixing URLs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreGuidelines = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('guidelines-integration', {
        body: {
          searchTerms: 'physiotherapy',
          organization: 'all',
          condition: ''
        }
      });

      if (error) throw error;

      toast({
        title: "Guidelines Updated",
        description: `Successfully fetched ${data.guidelines?.length || 0} new guidelines`,
      });

      // Refresh the guidelines list
      await fetchGuidelines();
    } catch (error: any) {
      toast({
        title: "Error fetching new guidelines",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEvidenceStrengthColor = (strength: string) => {
    switch (strength?.toLowerCase()) {
      case 'high': return 'bg-green-500';
      case 'moderate': return 'bg-blue-500';
      case 'low': return 'bg-yellow-500';
      case 'very low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getYearsAgo = (year: number) => {
    const currentYear = new Date().getFullYear();
    const yearsAgo = currentYear - year;
    if (yearsAgo === 0) return 'This year';
    if (yearsAgo === 1) return '1 year ago';
    return `${yearsAgo} years ago`;
  };

  const filteredGuidelines = guidelines.filter(guideline => {
    const matchesCategory = selectedCategory === 'all' || guideline.condition_category === selectedCategory;
    const matchesOrganization = selectedOrganization === 'all' || guideline.organization === selectedOrganization;
    const matchesSearch = guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guideline.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guideline.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesOrganization && matchesSearch;
  });

  const categories = [...new Set(guidelines.map(g => g.condition_category))];
  const organizations = [...new Set(guidelines.map(g => g.organization))];

  const GuidelineCard = ({ guideline }: { guideline: ClinicalGuideline }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg leading-tight">{guideline.title}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              {guideline.organization}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`${getEvidenceStrengthColor(guideline.evidence_strength)} text-white`}>
              {guideline.evidence_strength || 'Not specified'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {guideline.condition_category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {guideline.publication_year} ({getYearsAgo(guideline.publication_year)})
          </div>
          {guideline.target_population && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {guideline.target_population.length > 20 
                ? `${guideline.target_population.substring(0, 20)}...` 
                : guideline.target_population}
            </div>
          )}
        </div>

        {guideline.summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground">
              {guideline.summary.length > 150 
                ? `${guideline.summary.substring(0, 150)}...` 
                : guideline.summary}
            </p>
          </div>
        )}

        {guideline.key_recommendations && guideline.key_recommendations.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Key Recommendations ({guideline.key_recommendations.length})
            </h4>
            <div className="space-y-1">
              {guideline.key_recommendations.slice(0, 3).map((rec, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  • {rec.length > 80 ? `${rec.substring(0, 80)}...` : rec}
                </p>
              ))}
              {guideline.key_recommendations.length > 3 && (
                <p className="text-xs text-muted-foreground font-medium">
                  +{guideline.key_recommendations.length - 3} more recommendations
                </p>
              )}
            </div>
          </div>
        )}

        {guideline.clinical_questions && guideline.clinical_questions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Clinical Questions Addressed</h4>
            <p className="text-sm text-muted-foreground">
              Addresses {guideline.clinical_questions.length} clinical question(s)
            </p>
          </div>
        )}

        {guideline.tags && guideline.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {guideline.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {guideline.tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{guideline.tags.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {guideline.last_updated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(guideline.last_updated).toLocaleDateString()}
          </div>
        )}

        <Separator />

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              toast({
                title: "Guideline Details",
                description: `Viewing details for: ${guideline.title}`,
              });
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {guideline.guideline_url && guideline.guideline_url !== '#' && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                window.open(guideline.guideline_url, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Guide
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Clinical Guidelines Library</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive collection of evidence-based clinical practice guidelines from leading healthcare organizations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search guidelines, organizations, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map(org => (
                <SelectItem key={org} value={org}>
                  {org}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Guidelines</TabsTrigger>
          <TabsTrigger value="MSK">MSK</TabsTrigger>
          <TabsTrigger value="Neurological">Neurological</TabsTrigger>
          <TabsTrigger value="Respiratory">Respiratory</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredGuidelines.length} of {guidelines.length} guidelines
            </p>
            <div className="flex gap-2">
              <Button onClick={fixGuidelineUrls} variant="outline" size="sm">
                Fix URLs
              </Button>
              <Button onClick={fetchMoreGuidelines} variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Fetch NICE Guidelines
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuidelines.map(guideline => (
              <GuidelineCard key={guideline.id} guideline={guideline} />
            ))}
          </div>

          {filteredGuidelines.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No guidelines found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria, or fetch the latest guidelines from NICE.
                </p>
                <Button onClick={fetchMoreGuidelines}>
                  <Star className="h-4 w-4 mr-2" />
                  Fetch NICE Guidelines
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};