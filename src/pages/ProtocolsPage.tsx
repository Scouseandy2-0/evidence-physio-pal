import { useState } from "react";
import { Header } from "@/components/Header";
import { TreatmentProtocolBuilder } from "@/components/protocols/TreatmentProtocolBuilder";
import { ProtocolTemplateManager } from "@/components/protocols/ProtocolTemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wrench } from "lucide-react";

const ProtocolsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Treatment Protocols</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create, manage, and access evidence-based treatment protocols
            </p>
          </div>
          
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Protocol Builder
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Template Library
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="space-y-6">
              <TreatmentProtocolBuilder />
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6">
              <ProtocolTemplateManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProtocolsPage;