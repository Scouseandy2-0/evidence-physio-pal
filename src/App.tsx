import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GuidelinesPage from "./pages/GuidelinesPage";
import EvidencePage from "./pages/EvidencePage";
import AssessmentPage from "./pages/AssessmentPage";
import { AuthPage } from "./components/auth/AuthPage";
import { AuthProvider } from "./hooks/useAuth";
import { SubscriptionProvider } from "./hooks/useSubscription";
import { ConditionModules } from "./components/conditions/ConditionModules";
import { AssessmentToolsLibrary } from "./components/conditions/AssessmentToolsLibrary";
import { PersonalizedDashboard } from "./components/dashboard/PersonalizedDashboard";
import { TreatmentProtocolBuilder } from "./components/protocols/TreatmentProtocolBuilder";
import { CPDTracker } from "./components/cpd/CPDTracker";
import { PatientManagement } from "./components/patients/PatientManagement";
import { CollaborationHub } from "./components/collaboration/CollaborationHub";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { SubscriptionPage } from "./components/subscription/SubscriptionPage";
import { SubscriptionSuccessPage } from "./components/subscription/SubscriptionSuccessPage";
import { AdvancedFeatures } from "./components/advanced/AdvancedFeatures";
import { HealthcareProviderVerification } from "./components/admin/HealthcareProviderVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<PersonalizedDashboard />} />
            <Route path="/conditions" element={<ConditionModules />} />
            <Route path="/assessments" element={<AssessmentToolsLibrary />} />
            <Route path="/assessment/:toolId" element={<AssessmentPage />} />
            <Route path="/protocols" element={<TreatmentProtocolBuilder />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/cpd" element={<CPDTracker />} />
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/collaboration" element={<CollaborationHub />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/advanced" element={<AdvancedFeatures />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
            <Route path="/verification" element={<HealthcareProviderVerification />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
