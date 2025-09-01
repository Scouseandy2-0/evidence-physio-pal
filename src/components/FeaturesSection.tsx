import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Search, Award, TrendingUp, Shield } from "lucide-react"
import { Link } from "react-router-dom"

export const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-medical-blue" />,
      title: "Evidence Library",
      description: "Access peer-reviewed research from 50+ medical journals with real-time updates and quality ratings.",
      action: "Browse Library",
      link: "/evidence"
    },
    {
      icon: <Search className="h-8 w-8 text-medical-green" />,
      title: "Smart Search",
      description: "Find relevant evidence using AI-powered search with condition-specific filters and treatment protocols.",
      action: "Try Search",
      link: "/evidence"
    },
    {
      icon: <Users className="h-8 w-8 text-medical-blue" />,
      title: "Assessment Tools",
      description: "Evidence-based assessment questionnaires and outcome measures for comprehensive patient evaluation.",
      action: "View Tools",
      link: "/assessments"
    },
    {
      icon: <Award className="h-8 w-8 text-medical-green" />,
      title: "Quality Ratings",
      description: "GRADE system integration to help you understand the strength and quality of available evidence.",
      action: "Learn More",
      link: "/evidence"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-medical-blue" />,
      title: "Treatment Protocols",
      description: "Step-by-step evidence-based treatment protocols with progression guidelines and outcome tracking.",
      action: "Explore Protocols",
      link: "/protocols"
    },
    {
      icon: <Shield className="h-8 w-8 text-medical-green" />,
      title: "Clinical Guidelines",
      description: "Latest clinical practice guidelines from professional physiotherapy associations worldwide.",
      action: "View Guidelines",
      link: "/guidelines"
    }
  ]

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Comprehensive Evidence-Based Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to provide the highest quality physiotherapy care based on the latest research and clinical guidelines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-medical-blue transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <Link to={feature.link}>
                  <Button variant="outline" className="w-full group-hover:border-medical-blue group-hover:text-medical-blue transition-colors">
                    {feature.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}