import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ScanNew from "./pages/ScanNew";
import ScanConfirmation from "./pages/ScanConfirmation";
import ScanDetail from "./pages/ScanDetail";
import ExitScan from "./pages/ExitScan";
import Business from "./pages/Business";
import BusinessDashboard from "./pages/BusinessDashboard";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/scan/:id" element={<ScanDetail />} />
            <Route path="/scan/new" element={<ScanNew />} />
            <Route path="/scan/:id" element={<ScanConfirmation />} />
            <Route path="/scan/:id/exit" element={<ExitScan />} />
            <Route path="/business" element={<Business />} />
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
