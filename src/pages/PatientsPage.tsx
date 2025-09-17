import { Header } from "@/components/Header";
import { PatientManagement } from "@/components/patients/PatientManagement";
import { EnhancedAnalyticsDashboard } from "@/components/advanced/EnhancedAnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart } from "lucide-react";

const PatientsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Patient Management</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage patient records, sessions, and track treatment outcomes
            </p>
          </div>
          
          <Tabs defaultValue="management" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patient Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analytics Dashboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="management" className="space-y-6">
              <PatientManagement />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <EnhancedAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PatientsPage;