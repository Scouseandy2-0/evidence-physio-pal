import { Header } from "@/components/Header";
import { EvidenceIntegration } from "@/components/evidence/EvidenceIntegration";
import { RealDataPopulator } from "@/components/evidence/RealDataPopulator";

const EvidencePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Evidence Database</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access the latest research evidence from PubMed, Cochrane, and other trusted sources
            </p>
          </div>
          <RealDataPopulator />
          <EvidenceIntegration />
        </div>
      </main>
    </div>
  );
};

export default EvidencePage;