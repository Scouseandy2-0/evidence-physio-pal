import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText,
  Star,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface ProtocolTemplate {
  id: string;
  name: string;
  condition_category: string;
  category: string;
  evidence_base: string;
  guideline_source: string;
  phases: any[];
  interventions: any[];
  outcome_measures: string[];
  contraindications: string[];
  precautions: string[];
  duration_weeks: number;
  frequency_per_week: number;
  evidence_level: 'A' | 'B' | 'C' | 'D';
  quality_rating: number;
  peer_reviewed: boolean;
}

export const ProtocolTemplateManager = () => {
  const [templates, setTemplates] = useState<ProtocolTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock data for demonstration
    const mockTemplates: ProtocolTemplate[] = [
      {
        id: '1',
        name: 'Evidence-Based Low Back Pain Protocol',
        condition_category: 'MSK',
        category: 'MSK',
        evidence_base: 'Based on systematic reviews and clinical practice guidelines for acute and chronic low back pain management.',
        guideline_source: 'APTA Clinical Practice Guidelines',
        phases: [
          { name: 'Acute Phase', duration: '0-2 weeks', focus: 'Pain management and basic mobility' },
          { name: 'Sub-acute Phase', duration: '2-6 weeks', focus: 'Strengthening and movement re-education' },
          { name: 'Chronic Phase', duration: '6-12 weeks', focus: 'Functional restoration and prevention' }
        ],
        interventions: ['Manual therapy', 'Therapeutic exercise', 'Patient education'],
        outcome_measures: ['ODI', 'VAS', 'Roland Morris', 'Fear Avoidance Beliefs'],
        contraindications: ['Cauda equina syndrome', 'Progressive neurological deficit', 'Fracture'],
        precautions: ['Recent surgery', 'Osteoporosis', 'Pregnancy'],
        duration_weeks: 12,
        frequency_per_week: 2,
        evidence_level: 'A',
        quality_rating: 9,
        peer_reviewed: true
      },
      {
        id: '2',
        name: 'Shoulder Impingement Rehabilitation',
        condition_category: 'MSK',
        category: 'MSK',
        evidence_base: 'Comprehensive protocol based on biomechanical research and clinical outcomes studies.',
        guideline_source: 'Cochrane Reviews + JOSPT Guidelines',
        phases: [
          { name: 'Protection Phase', duration: '0-3 weeks', focus: 'Reduce inflammation and pain' },
          { name: 'Mobility Phase', duration: '3-6 weeks', focus: 'Restore range of motion' },
          { name: 'Strengthening Phase', duration: '6-12 weeks', focus: 'Progressive strengthening' }
        ],
        interventions: ['Scapular stabilization', 'Rotator cuff strengthening', 'Manual therapy'],
        outcome_measures: ['DASH', 'SPADI', 'Constant Score', 'ROM measurements'],
        contraindications: ['Complete rotator cuff tear', 'Frozen shoulder', 'Acute fracture'],
        precautions: ['Recent injection', 'Diabetes', 'Previous surgery'],
        duration_weeks: 8,
        frequency_per_week: 3,
        evidence_level: 'B',
        quality_rating: 8,
        peer_reviewed: true
      }
    ];
    setTemplates(mockTemplates);
  };

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityRating = (rating: number) => {
    const stars = Math.round(rating / 2);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.condition_category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [...new Set(templates.map(t => t.category))];

  const TemplateCard = ({ template }: { template: ProtocolTemplate }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="mt-2">
              {template.condition_category} • {template.category}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getEvidenceLevelColor(template.evidence_level)} text-white`}>
              Level {template.evidence_level}
            </Badge>
            {template.peer_reviewed && (
              <Badge variant="outline">
                <CheckCircle className="h-3 w-3 mr-1" />
                Peer Reviewed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {template.duration_weeks} weeks
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {template.frequency_per_week}x/week
          </div>
        </div>

        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4" />
            Evidence Base
          </h4>
          <p className="text-sm text-muted-foreground">{template.evidence_base}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Source: {template.guideline_source}
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Quality Rating</h4>
          <div className="flex items-center gap-2">
            <div className="flex">{getQualityRating(template.quality_rating)}</div>
            <span className="text-sm text-muted-foreground">
              {template.quality_rating}/10
            </span>
          </div>
        </div>

        {template.phases && template.phases.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Treatment Phases ({template.phases.length})</h4>
            <div className="flex flex-wrap gap-1">
              {template.phases.slice(0, 3).map((phase: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {phase.name || `Phase ${index + 1}`}
                </Badge>
              ))}
              {template.phases.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.phases.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {template.outcome_measures && template.outcome_measures.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Outcome Measures</h4>
            <div className="flex flex-wrap gap-1">
              {template.outcome_measures.slice(0, 3).map((measure, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {measure}
                </Badge>
              ))}
              {template.outcome_measures.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.outcome_measures.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {(template.contraindications.length > 0 || template.precautions.length > 0) && (
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Safety Considerations
            </h4>
            <div className="space-y-1">
              {template.contraindications.length > 0 && (
                <p className="text-xs text-red-600">
                  {template.contraindications.length} contraindication(s)
                </p>
              )}
              {template.precautions.length > 0 && (
                <p className="text-xs text-yellow-600">
                  {template.precautions.length} precaution(s)
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            View Template
          </Button>
          <Button variant="default" size="sm" className="flex-1">
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Protocol Template Library</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Evidence-based treatment protocol templates from clinical guidelines and research.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
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
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="MSK">MSK</TabsTrigger>
          <TabsTrigger value="Neurological">Neurological</TabsTrigger>
          <TabsTrigger value="Respiratory">Respiratory</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or category filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};