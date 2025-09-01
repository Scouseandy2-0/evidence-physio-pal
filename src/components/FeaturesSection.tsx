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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-medical-blue/10 text-medical-blue text-sm font-medium mb-6">
            <Award className="h-4 w-4 mr-2" />
            Professional Tools & Resources
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Comprehensive Evidence-Based Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to provide the highest quality physiotherapy care based on the latest research and clinical guidelines from trusted medical databases.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-card">
              <CardHeader className="pb-4">
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-background to-muted/50 w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-medical-blue transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Link to={feature.link} className="block">
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:border-medical-blue group-hover:text-medical-blue group-hover:bg-medical-blue/5 transition-all duration-300 font-medium"
                  >
                    {feature.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-medical-blue/10 to-medical-green/10 rounded-2xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to enhance your practice?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of physiotherapists worldwide who trust our evidence-based platform for superior patient outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="medical" size="lg" className="sm:w-auto w-full">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/evidence">
                <Button variant="outline" size="lg" className="sm:w-auto w-full">
                  Explore Database
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}