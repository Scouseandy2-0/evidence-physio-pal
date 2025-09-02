import { Header } from "@/components/Header";
import { EvidenceIntegration } from "@/components/evidence/EvidenceIntegration";
import { RealDataPopulator } from "@/components/evidence/RealDataPopulator";
import { DataPopulator } from "@/components/evidence/DataPopulator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search Evidence</TabsTrigger>
              <TabsTrigger value="populate">Populate Data</TabsTrigger>
              <TabsTrigger value="comprehensive">Comprehensive Sync</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-6">
              <EvidenceIntegration />
            </TabsContent>
            
            <TabsContent value="populate" className="space-y-6">
              <DataPopulator />
            </TabsContent>
            
            <TabsContent value="comprehensive" className="space-y-6">
              <RealDataPopulator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default EvidencePage;