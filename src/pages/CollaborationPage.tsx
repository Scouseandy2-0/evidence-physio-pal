import { Header } from "@/components/Header";
import { CollaborationHub } from "@/components/collaboration/CollaborationHub";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Bell } from "lucide-react";

const CollaborationPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Collaboration Center</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with colleagues and stay updated with the latest developments
            </p>
          </div>
          
          <Tabs defaultValue="hub" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hub" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaboration Hub
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hub" className="space-y-6">
              <CollaborationHub />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationCenter />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CollaborationPage;