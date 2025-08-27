import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { SearchSection } from "@/components/SearchSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { EvidenceIntegration } from "@/components/evidence/EvidenceIntegration"
import { useAuth } from "@/hooks/useAuth"

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SearchSection />
        {user && (
          <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <EvidenceIntegration />
            </div>
          </section>
        )}
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Index;
