import { Header } from "@/components/Header";
import { CollaborationHub } from "@/components/collaboration/CollaborationHub";

const CollaborationPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollaborationHub />
      </main>
    </div>
  );
};

export default CollaborationPage;