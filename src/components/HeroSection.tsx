import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, BookOpen, Users, Award } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import heroImage from "@/assets/physio-hero.jpg"

export const HeroSection = () => {
  const [stats, setStats] = useState({
    evidence: 0,
    conditions: 0,
    assessmentTools: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [evidenceResult, conditionsResult, toolsResult] = await Promise.all([
        supabase.from('evidence').select('*', { count: 'exact', head: true }),
        supabase.from('conditions').select('*', { count: 'exact', head: true }),
        supabase.from('assessment_tools').select('*', { count: 'exact', head: true })
      ])

      setStats({
        evidence: evidenceResult.count || 0,
        conditions: conditionsResult.count || 0,
        assessmentTools: toolsResult.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }
  return (
    <section className="relative bg-gradient-to-br from-background to-neutral-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-medical-blue/10 text-medical-blue text-sm font-medium">
                <Award className="h-4 w-4 mr-2" />
                Evidence-Based Practice
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Advanced Physiotherapy
                <span className="text-medical-blue"> Evidence</span> at Your Fingertips
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Access the latest research from top medical journals to provide evidence-based physiotherapy treatments. Make informed decisions with peer-reviewed clinical guidelines.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/evidence">
                <Button variant="medical" size="lg" className="flex-1 sm:flex-none w-full">
                  <Search className="h-5 w-5 mr-2" />
                  Search Evidence Database
                </Button>
              </Link>
              <Link to="/guidelines">
                <Button variant="outline" size="lg" className="flex-1 sm:flex-none w-full">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Guidelines
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-blue">{stats.evidence}+</div>
                <div className="text-sm text-muted-foreground">Evidence Papers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-green">{stats.conditions}+</div>
                <div className="text-sm text-muted-foreground">Conditions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-blue">{stats.assessmentTools}+</div>
                <div className="text-sm text-muted-foreground">Assessment Tools</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <Card className="overflow-hidden shadow-lg">
              <img 
                src={heroImage} 
                alt="Modern physiotherapy clinic with professional equipment" 
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
            </Card>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medical-green rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Updates</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-medical-blue" />
                <div>
                  <div className="text-sm font-medium">Evidence Rating</div>
                  <div className="text-xs text-muted-foreground">Grade A - Strong</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}