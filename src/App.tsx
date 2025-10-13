import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IonApp, setupIonicReact } from '@ionic/react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GuidelinesPage from "./pages/GuidelinesPage";
import EvidencePage from "./pages/EvidencePage";
import AssessmentPage from "./pages/AssessmentPage";
import ConditionsPage from "./pages/ConditionsPage";
import { AuthPage } from "./components/auth/AuthPage";
import { AuthProvider } from "./hooks/useAuth";
import { SubscriptionProvider } from "./hooks/useSubscription";
import { ConditionModules } from "./components/conditions/ConditionModules";
import AssessmentsPage from "./pages/AssessmentsPage";
import { PersonalizedDashboard } from "./components/dashboard/PersonalizedDashboard";
import CPDPage from "./pages/CPDPage";
import PatientsPage from "./pages/PatientsPage";
import CollaborationPage from "./pages/CollaborationPage";
import ProtocolsPage from "./pages/ProtocolsPage";
import SecurityPage from "./pages/SecurityPage";
import SubscriptionAnalyticsPage from "./pages/SubscriptionAnalyticsPage";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { SubscriptionPage } from "./components/subscription/SubscriptionPage";
import { SubscriptionSuccessPage } from "./components/subscription/SubscriptionSuccessPage";
import { AdvancedFeatures } from "./components/advanced/AdvancedFeatures";
import { HealthcareProviderVerification } from "./components/admin/HealthcareProviderVerification";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";

setupIonicReact();

const queryClient = new QueryClient();

const App = () => (
  <IonApp>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<OnboardingFlow />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<PersonalizedDashboard />} />
                <Route path="/conditions" element={<ConditionsPage />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/assessment/:toolId" element={<AssessmentPage />} />
                <Route path="/protocols" element={<ProtocolsPage />} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/cpd" element={<CPDPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/collaboration" element={<CollaborationPage />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/advanced" element={<AdvancedFeatures />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
                <Route path="/subscription-analytics" element={<SubscriptionAnalyticsPage />} />
                <Route path="/verification" element={<HealthcareProviderVerification />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </IonApp>
);

export default App;
