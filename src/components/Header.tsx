import { Button } from "@/components/ui/button"
import { Search, Menu, User, FileText, Brain, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "react-router-dom"

export const Header = () => {
  const { user, signOut } = useAuth();

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
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
            <Link to="/conditions">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4 mr-2" />
                Conditions
              </Button>
            </Link>
            <Link to="/protocols">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Protocols
              </Button>
            </Link>
            <Link to="/assessments">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4 mr-2" />
                Assessments
              </Button>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/cpd">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    CPD
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="medical" size="sm">
                    Get Started
                  </Button>
                </Link>
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