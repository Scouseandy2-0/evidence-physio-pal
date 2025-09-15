import { Header } from "@/components/Header";
import { PatientManagement } from "@/components/patients/PatientManagement";

const PatientsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientManagement />
      </main>
    </div>
  );
};

export default PatientsPage;