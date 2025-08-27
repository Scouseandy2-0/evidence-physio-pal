import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, BookOpen, ExternalLink, Star } from "lucide-react"

export const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const evidenceResults = [
    {
      title: "Effectiveness of Manual Therapy in Chronic Low Back Pain",
      journal: "Journal of Physical Therapy Science",
      year: "2024",
      evidence_level: "Grade A",
      summary: "Systematic review demonstrating significant improvement in pain and function with manual therapy techniques for chronic low back pain.",
      tags: ["Manual Therapy", "Low Back Pain", "Systematic Review"]
    },
    {
      title: "Exercise Therapy for Rotator Cuff Tendinopathy: Updated Guidelines",
      journal: "British Journal of Sports Medicine",
      year: "2024",
      evidence_level: "Grade A",
      summary: "Latest evidence-based exercise protocols for rotator cuff rehabilitation with emphasis on progressive loading.",
      tags: ["Exercise Therapy", "Rotator Cuff", "Tendinopathy"]
    },
    {
      title: "Dry Needling vs Traditional Physiotherapy for Neck Pain",
      journal: "Physical Therapy",
      year: "2023",
      evidence_level: "Grade B",
      summary: "Randomized controlled trial comparing dry needling effectiveness with traditional physiotherapy approaches.",
      tags: ["Dry Needling", "Neck Pain", "RCT"]
    }
  ]

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Grade A": return "bg-medical-green text-white"
      case "Grade B": return "bg-medical-blue text-white"
      case "Grade C": return "bg-warning text-white"
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
              Find evidence-based treatments from top physiotherapy journals
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conditions, treatments, or techniques..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="medical" className="sm:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" className="sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                Latest Evidence ({evidenceResults.length} results)
              </h3>
              <Button variant="ghost" size="sm">
                Sort by relevance
              </Button>
            </div>

            {evidenceResults.map((result, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-foreground hover:text-medical-blue cursor-pointer">
                        {result.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {result.journal}
                        </span>
                        <span>{result.year}</span>
                      </div>
                    </div>
                    <Badge className={getGradeColor(result.evidence_level)}>
                      {result.evidence_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {result.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, tagIndex) => (
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
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Full Text
                      </Button>
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