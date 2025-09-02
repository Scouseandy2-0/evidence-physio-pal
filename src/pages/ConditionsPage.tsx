import { Header } from "@/components/Header";
import { ConditionModules } from "@/components/conditions/ConditionModules";

const ConditionsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ConditionModules />
      </main>
    </div>
  );
};

export default ConditionsPage;