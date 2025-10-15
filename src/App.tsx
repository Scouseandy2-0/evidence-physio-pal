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
import { DataPopulationPage } from "./pages/DataPopulationPage";
import AuthCallback from "./pages/AuthCallback";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactUsPage from "./pages/ContactUsPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <>
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
<Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={<ProtectedRoute><PersonalizedDashboard /></ProtectedRoute>} />
                <Route path="/conditions" element={<ConditionsPage />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/assessment/:toolId" element={<AssessmentPage />} />
                <Route path="/protocols" element={<ProtectedRoute><ProtocolsPage /></ProtectedRoute>} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/cpd" element={<ProtectedRoute><CPDPage /></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
                <Route path="/collaboration" element={<ProtectedRoute><CollaborationPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/advanced" element={<ProtectedRoute><AdvancedFeatures /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
                <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
                <Route path="/subscription-analytics" element={<ProtectedRoute><SubscriptionAnalyticsPage /></ProtectedRoute>} />
                <Route path="/verification" element={<ProtectedRoute><HealthcareProviderVerification /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
                <Route path="/populate-data" element={<DataPopulationPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </>
);

export default App;
