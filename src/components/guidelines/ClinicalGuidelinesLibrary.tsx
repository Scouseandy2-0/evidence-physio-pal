import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockGuidelines: ClinicalGuideline[] = [
      {
        id: '1',
        title: 'Clinical Practice Guidelines for Low Back Pain',
        organization: 'APTA',
        condition_category: 'MSK',
        publication_year: 2023,
        last_updated: '2023-06-15',
        guideline_url: 'https://www.apta.org/guidelines',
        summary: 'Comprehensive evidence-based guidelines for the management of acute and chronic low back pain in adults.',
        recommendations: [],
        evidence_strength: 'High',
        target_population: 'Adults with acute or chronic low back pain',
        clinical_questions: ['What are the most effective interventions for acute LBP?', 'How should chronic LBP be managed?'],
        key_recommendations: [
          'Manual therapy techniques are recommended for acute LBP',
          'Exercise therapy is strongly recommended for chronic LBP',
          'Patient education should be provided in all cases'
        ],
        implementation_notes: 'Requires multidisciplinary approach and patient-centered care',
        tags: ['low back pain', 'manual therapy', 'exercise', 'evidence-based']
      },
      {
        id: '2',
        title: 'Stroke Rehabilitation Guidelines',
        organization: 'WHO',
        condition_category: 'Neurological',
        publication_year: 2022,
        last_updated: '2022-12-01',
        guideline_url: 'https://www.who.int/stroke-guidelines',
        summary: 'International guidelines for comprehensive stroke rehabilitation across all phases of recovery.',
        recommendations: [],
        evidence_strength: 'Moderate',
        target_population: 'Adults with stroke at any stage of recovery',
        clinical_questions: ['What interventions improve motor recovery?', 'How should cognitive impairments be addressed?'],
        key_recommendations: [
          'Early mobilization within 24-48 hours post-stroke',
          'Task-specific training for motor recovery',
          'Cognitive rehabilitation for executive function'
        ],
        implementation_notes: 'Requires coordinated multidisciplinary team approach',
        tags: ['stroke', 'neurological', 'rehabilitation', 'motor recovery']
      }
    ];
    setGuidelines(mockGuidelines);
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
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {guideline.guideline_url && (
            <Button variant="default" size="sm" className="flex-1">
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
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};