
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StoreDashboard from "./pages/StoreDashboard";
import Stores from "./pages/Stores";
import StoresPage from "./pages/StoresPage";
import PublicDiscounts from "./pages/PublicDiscounts";
import Privacy from "./pages/Privacy";
import Chrome from "./pages/Chrome";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/store-dashboard" element={<StoreDashboard />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/admin-stores" element={<Stores />} />
          <Route path="/discounts" element={<PublicDiscounts />} />
          <Route path="/discounts/:urlSlug" element={<PublicDiscounts />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chrome" element={<Chrome />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
