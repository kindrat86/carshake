import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ScanNew = lazy(() => import("./pages/ScanNew"));
const ScanConfirmation = lazy(() => import("./pages/ScanConfirmation"));
const ScanDetail = lazy(() => import("./pages/ScanDetail"));
const ExitScan = lazy(() => import("./pages/ExitScan"));
const Business = lazy(() => import("./pages/Business"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ProtectUseCase = lazy(() => import("./pages/ProtectUseCase"));
const CityPage = lazy(() => import("./pages/CityPage"));
const CityIndex = lazy(() => import("./pages/CityIndex"));
const StatePage = lazy(() => import("./pages/StatePage"));
const VehiclePage = lazy(() => import("./pages/VehiclePage"));
const VehicleIndex = lazy(() => import("./pages/VehicleIndex"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const TrustPage = lazy(() => import("./pages/TrustPage"));
const ScenarioPage = lazy(() => import("./pages/ScenarioPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-page" />}>
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
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:category/:slug" element={<BlogPost />} />
              <Route path="/protect/:usecase" element={<ProtectUseCase />} />
              <Route path="/city" element={<CityIndex />} />
              <Route path="/city/:cityName" element={<CityPage />} />
              <Route path="/state/:stateName" element={<StatePage />} />
              <Route path="/vehicle" element={<VehicleIndex />} />
              <Route path="/vehicle/:vehicleType" element={<VehiclePage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/trust" element={<TrustPage />} />
              <Route path="/scenario/:scenarioName" element={<ScenarioPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
