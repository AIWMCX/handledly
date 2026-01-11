import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Quote from "./pages/Quote";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import { Overview, Leads, Conversations, CallLogs, Appointments, Settings } from "./pages/admin";
import {
  LocalMoving,
  ResidentialMovers,
  LongDistanceMoving,
  MovingHelpLabor,
  HeavyItemsMoving,
  PianoMoving,
  PoolTableMoving,
  SafeMoving,
  SameDayMoving,
  JunkRemoval,
} from "./pages/services";

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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="leads" element={<Leads />} />
              <Route path="conversations" element={<Conversations />} />
              <Route path="calls" element={<CallLogs />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
