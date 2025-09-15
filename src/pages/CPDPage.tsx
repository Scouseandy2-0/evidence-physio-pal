import { Header } from "@/components/Header";
import { CPDTracker } from "@/components/cpd/CPDTracker";

const CPDPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CPDTracker />
      </main>
    </div>
  );
};

export default CPDPage;