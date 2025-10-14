import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, BookOpen, ExternalLink, Star, Loader2, Database, Globe } from "lucide-react"

interface Evidence {
  id: string;
  title: string;
  authors: string[] | null;
  journal: string | null;
  publication_date: string | null;
  evidence_level: string | null;
  abstract: string | null;
  key_findings: string | null;
  tags: string[] | null;
  pmid: string | null;
  doi: string | null;
  study_type: string | null;
}

export const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [evidenceResults, setEvidenceResults] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(false)
  const [searchSource, setSearchSource] = useState<'database' | 'pubmed' | 'cochrane' | 'pedro'>('database')
  const [filters, setFilters] = useState({
    evidenceLevel: 'all',
    studyType: 'all',
    dateRange: 'all'
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load initial evidence from database
    searchDatabase("")
  }, [])

  useEffect(() => {
    // Re-search when filters change (only for database search)
    if (searchSource === 'database') {
      searchDatabase(searchTerm)
    }
  }, [filters])

  const searchDatabase = async (query: string) => {
    setLoading(true)
    try {
      let dbQuery = supabase
        .from('evidence')
        .select('*')
        .eq('is_active', true)
        .order('publication_date', { ascending: false })
        .limit(20)

      if (query.trim()) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,abstract.ilike.%${query}%,tags.cs.{${query}}`)
      }

      if (filters.evidenceLevel !== 'all' && ['A', 'B', 'C'].includes(filters.evidenceLevel)) {
        dbQuery = dbQuery.eq('evidence_level', filters.evidenceLevel as 'A' | 'B' | 'C')
      }

      if (filters.studyType !== 'all') {
        dbQuery = dbQuery.eq('study_type', filters.studyType)
      }

      const { data, error } = await dbQuery

      if (error) throw error
      setEvidenceResults(data || [])
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: "Failed to search evidence database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchExternalSource = async (source: 'pubmed' | 'cochrane' | 'pedro') => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter search terms",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke(`${source}-integration`, {
        body: {
          searchTerms: searchTerm,
          maxResults: 10
        }
      })

      if (error) throw error

      toast({
        title: "Search Completed",
        description: data.message || `Search completed from ${source}`,
      })

      // Refresh database results to show newly imported evidence
      await searchDatabase(searchTerm)
    } catch (error: any) {
      toast({
        title: "External Search Error",
        description: `Failed to search ${source}: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchSource === 'database') {
      searchDatabase(searchTerm)
    } else {
      searchExternalSource(searchSource)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-medical-green text-white"
      case "B": return "bg-medical-blue text-white"  
      case "C": return "bg-warning text-white"
      default: return "bg-neutral-200 text-neutral-600"
    }
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Search Evidence Database
            </h2>
            <p className="text-muted-foreground">
              Find evidence-based treatments from top physiotherapy journals and databases
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8 shadow-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Source Tabs */}
                <Tabs value={searchSource} onValueChange={(value) => setSearchSource(value as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="database" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database
                    </TabsTrigger>
                    <TabsTrigger value="pubmed" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      PubMed
                    </TabsTrigger>
                    <TabsTrigger value="cochrane" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Cochrane
                    </TabsTrigger>
                    <TabsTrigger value="pedro" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      PEDro
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search Input */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={searchSource === 'database' 
                        ? "Search conditions, treatments, or techniques..." 
                        : `Search ${searchSource.toUpperCase()} database...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="medical" 
                    className="sm:w-auto"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>

                {/* Filters - Only show for database search */}
                {searchSource === 'database' && (
                  <div className="flex flex-wrap gap-4">
                    <Select
                      value={filters.evidenceLevel}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, evidenceLevel: value }))}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Evidence Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="A">Grade A</SelectItem>
                        <SelectItem value="B">Grade B</SelectItem>
                        <SelectItem value="C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.studyType}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, studyType: value }))}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Study Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Systematic Review">Systematic Review</SelectItem>
                        <SelectItem value="RCT">RCT</SelectItem>
                        <SelectItem value="Cohort Study">Cohort Study</SelectItem>
                        <SelectItem value="Case Study">Case Study</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="outline" 
                      onClick={() => searchDatabase(searchTerm)}
                      disabled={loading}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                {loading ? 'Searching...' : `Evidence Results (${evidenceResults.length} found)`}
              </h3>
              {evidenceResults.length > 0 && (
                <Badge variant="outline">
                  Source: {searchSource === 'database' ? 'Local Database' : searchSource.toUpperCase()}
                </Badge>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Searching evidence database...</span>
              </div>
            )}

            {!loading && evidenceResults.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Evidence Found</h4>
                  <p className="text-muted-foreground">
                    Try different search terms or search external databases
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && evidenceResults.map((result, index) => (
              <Card key={result.id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {result.doi || result.pmid ? (
                          <a 
                            href={result.doi ? `https://doi.org/${result.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-medical-blue hover:underline"
                          >
                            {result.title}
                          </a>
                        ) : (
                          <span className="text-foreground">{result.title}</span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {result.journal || 'Unknown Journal'}
                        </span>
                        <span>{result.publication_date ? new Date(result.publication_date).getFullYear() : 'N/A'}</span>
                        {result.pmid && (
                          <span>PMID: {result.pmid}</span>
                        )}
                      </div>
                    </div>
                    {result.evidence_level && (
                      <Badge className={getGradeColor(result.evidence_level)}>
                        Grade {result.evidence_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {result.abstract || result.key_findings || 'No abstract available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {result.tags?.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      {result.doi || result.pmid ? (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={
                              result.doi
                                ? `https://doi.org/${result.doi}`
                                : `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Full Text
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(result.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Search className="h-4 w-4 mr-1" />
                            Search on Scholar
                          </a>
                        </Button>
                      )}
                      {result.journal?.toLowerCase().includes('cochrane') && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://www.cochranelibrary.com/search?searchText=${encodeURIComponent(result.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Search className="h-4 w-4 mr-1" />
                            Search Cochrane
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}