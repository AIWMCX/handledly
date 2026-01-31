import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";

// Core pages - loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages - reduces initial bundle by ~400KB
const Services = lazy(() => import("./pages/Services"));
const Quote = lazy(() => import("./pages/Quote"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));

// Service pages - lazy loaded (only accessed via navigation)
const LocalMoving = lazy(() => import("./pages/services/LocalMoving"));
const ResidentialMovers = lazy(() => import("./pages/services/ResidentialMovers"));
const LongDistanceMoving = lazy(() => import("./pages/services/LongDistanceMoving"));
const MovingHelpLabor = lazy(() => import("./pages/services/MovingHelpLabor"));
const HeavyItemsMoving = lazy(() => import("./pages/services/HeavyItemsMoving"));
const PianoMoving = lazy(() => import("./pages/services/PianoMoving"));
const PoolTableMoving = lazy(() => import("./pages/services/PoolTableMoving"));
const SafeMoving = lazy(() => import("./pages/services/SafeMoving"));
const SameDayMoving = lazy(() => import("./pages/services/SameDayMoving"));
const JunkRemoval = lazy(() => import("./pages/services/JunkRemoval"));

// Admin pages - lazy loaded (only accessed by 3 admin users)
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const Overview = lazy(() => import("./pages/admin/Overview"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const Conversations = lazy(() => import("./pages/admin/Conversations"));
const CallLogs = lazy(() => import("./pages/admin/CallLogs"));
const Appointments = lazy(() => import("./pages/admin/Appointments"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const CostMonitoring = lazy(() => import("./pages/admin/CostMonitoring"));
const AIQuality = lazy(() => import("./pages/admin/AIQuality"));

const queryClient = new QueryClient();

// Page loading component - smooth transition between routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/local-moving" element={<LocalMoving />} />
                <Route path="/services/residential-movers" element={<ResidentialMovers />} />
                <Route path="/services/long-distance-moving" element={<LongDistanceMoving />} />
                <Route path="/services/moving-help-labor" element={<MovingHelpLabor />} />
                <Route path="/services/heavy-items-moving" element={<HeavyItemsMoving />} />
                <Route path="/services/piano-moving" element={<PianoMoving />} />
                <Route path="/services/pool-table-moving" element={<PoolTableMoving />} />
                <Route path="/services/safe-moving" element={<SafeMoving />} />
                <Route path="/services/same-day-moving" element={<SameDayMoving />} />
                <Route path="/services/junk-removal" element={<JunkRemoval />} />
                <Route path="/quote" element={<Quote />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/client-portal" element={<ClientPortal />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Overview />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="conversations" element={<Conversations />} />
                  <Route path="calls" element={<CallLogs />} />
                  <Route path="ai-quality" element={<AIQuality />} />
                  <Route path="cost-monitoring" element={<CostMonitoring />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
