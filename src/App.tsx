import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./components/auth/AuthPage";
import { AuthProvider } from "./hooks/useAuth";
import { ConditionModules } from "./components/conditions/ConditionModules";
import { AssessmentToolsLibrary } from "./components/conditions/AssessmentToolsLibrary";
import { PersonalizedDashboard } from "./components/dashboard/PersonalizedDashboard";
import { TreatmentProtocolBuilder } from "./components/protocols/TreatmentProtocolBuilder";
import { CPDTracker } from "./components/cpd/CPDTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/protocols" element={<TreatmentProtocolBuilder />} />
            <Route path="/cpd" element={<CPDTracker />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
