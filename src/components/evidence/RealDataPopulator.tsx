import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";

export const RealDataPopulator = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");
  const [results, setResults] = useState<Array<{source: string, term: string, success: boolean, count?: number}>>([]);
  const [totalEvidenceCount, setTotalEvidenceCount] = useState(0);
  const { toast } = useToast();

  const searchTerms = [
    "low back pain",
    "stroke rehabilitation", 
    "knee osteoarthritis",
    "shoulder impingement",
    "chronic pain",
    "balance training",
    "manual therapy",
    "exercise therapy",
    "spinal cord injury",
    "COPD rehabilitation",
    "neck pain",
    "hip osteoarthritis",
    "vestibular rehabilitation",
    "cardiac rehabilitation",
    "neuroplasticity"
  ];

  const sources = [
    { id: 'pubmed', name: 'PubMed' },
    { id: 'cochrane', name: 'Cochrane Library' },
    { id: 'pedro', name: 'PEDro Database' },
    { id: 'guidelines', name: 'Clinical Guidelines' }
  ];

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('id', { count: 'exact' });
      
      if (!error) {
        setTotalEvidenceCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    }
  };

  const populateRealData = async () => {
    setIsPopulating(true);
    setProgress(0);
    setResults([]);
    
    const totalOperations = searchTerms.length * sources.length;
    let completedOperations = 0;

    try {
      for (const searchTerm of searchTerms) {
        setCurrentOperation(`Processing: ${searchTerm}`);
        
        for (const source of sources) {
          setCurrentOperation(`${searchTerm} - ${source.name}`);
          
          try {
            const { data, error } = await supabase.functions.invoke(`${source.id}-integration`, {
              body: {
                searchTerms: searchTerm,
                condition: searchTerm,
                maxResults: 4 // Increased for better data volume
              }
            });

            const newResult = {
              source: source.name,
              term: searchTerm,
              success: !error,
              count: error ? 0 : (data?.articles?.length || data?.reviews?.length || data?.studies?.length || data?.guidelines?.length || 0)
            };

            setResults(prev => [...prev, newResult]);

            if (error) {
              console.error(`Error with ${source.name} for ${searchTerm}:`, error);
            }
            
          } catch (error) {
            console.error(`Failed ${source.name} for ${searchTerm}:`, error);
            setResults(prev => [...prev, {
              source: source.name,
              term: searchTerm,
              success: false,
              count: 0
            }]);
          }
          
          completedOperations++;
          setProgress((completedOperations / totalOperations) * 100);
          
          // Small delay to avoid overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Slightly longer delay between search terms
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Check final count
      await checkExistingData();
      
      toast({
        title: "Data Population Complete",
        description: `Successfully populated evidence database with real data from external sources`,
      });
      
    } catch (error: any) {
      toast({
        title: "Population Error",
        description: error.message || "Failed to populate real data",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
      setCurrentOperation("");
    }
  };

  const successfulResults = results.filter(r => r.success);
  const totalFetched = successfulResults.reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Real Evidence Data Population
        </CardTitle>
        <CardDescription>
          Fetch real research data from PubMed, Cochrane, PEDro, and clinical guidelines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Current database entries: <span className="font-medium">{totalEvidenceCount}</span>
          </div>
          <Button 
            onClick={populateRealData} 
            disabled={isPopulating}
            variant="default"
          >
            {isPopulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPopulating ? 'Populating...' : 'Populate Real Data'}
          </Button>
        </div>
        
        {isPopulating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentOperation}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Population Results:</h4>
            <div className="text-sm text-muted-foreground mb-2">
              Successfully fetched {totalFetched} evidence entries from {successfulResults.length} successful operations
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {results.slice(-10).map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {result.success ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="truncate">
                    {result.source} - {result.term} 
                    {result.success && result.count ? ` (${result.count} items)` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};