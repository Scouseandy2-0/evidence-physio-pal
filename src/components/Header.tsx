import { Button } from "@/components/ui/button"
import { Search, Menu, User, FileText, Brain, LogOut, BarChart3, Users, Share2, Crown } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useSubscription } from "@/hooks/useSubscription"
import { Link } from "react-router-dom"

export const Header = () => {
  const { user, signOut } = useAuth();
  const { subscribed } = useSubscription();
  
  // Debug logging for auth and subscription status
  console.log("📊 Header status:", { 
    hasUser: !!user, 
    userEmail: user?.email, 
    subscribed,
    showUpgradeButton: !!user && !subscribed
  });

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-medical-blue to-medical-green rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PhysioEvidence</h1>
                <p className="text-xs text-muted-foreground">Evidence-Based Care</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/conditions">
                <Search className="h-4 w-4 mr-2" />
                Conditions
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/protocols">
                <FileText className="h-4 w-4 mr-2" />
                Protocols
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/assessments">
                <Brain className="h-4 w-4 mr-2" />
                Assessments
              </Link>
            </Button>
            {user && (
              <>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/guidelines">
                    <FileText className="h-4 w-4 mr-2" />
                    Guidelines
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/evidence">
                    <Brain className="h-4 w-4 mr-2" />
                    Evidence
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/patients">
                    <Users className="h-4 w-4 mr-2" />
                    Patients
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/collaboration">
                    <Share2 className="h-4 w-4 mr-2" />
                    Collaborate
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/advanced">
                    <Brain className="h-4 w-4 mr-2" />
                    Advanced
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2">
                {!subscribed && (
                  <Button variant="warning" size="sm" asChild>
                    <Link to="/subscription">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to="/cpd">
                    <User className="h-4 w-4 mr-2" />
                    CPD
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
                <Button variant="medical" size="sm" asChild>
                  <Link to="/auth">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}