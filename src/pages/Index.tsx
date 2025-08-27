import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { SearchSection } from "@/components/SearchSection"
import { FeaturesSection } from "@/components/FeaturesSection"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SearchSection />
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Index;
