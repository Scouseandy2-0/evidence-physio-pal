import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { SearchSection } from "@/components/SearchSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { EvidenceIntegration } from "@/components/evidence/EvidenceIntegration"
import { RealDataDashboard } from "@/components/dashboard/RealDataDashboard"
import { useAuth } from "@/hooks/useAuth"

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SearchSection />
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Live Database Statistics</h2>
              <p className="text-muted-foreground">Real-time data from our comprehensive evidence database</p>
            </div>
            <RealDataDashboard />
            {user && (
              <div className="mt-12">
                <EvidenceIntegration />
              </div>
            )}
          </div>
        </section>
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Index;
