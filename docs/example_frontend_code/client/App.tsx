import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loading from "./pages/Loading";
import Index from "./pages/Index";
import Home from "./pages/Home";
import CreatePet from "./pages/CreatePet";
import FocusSetup from "./pages/FocusSetup";
import FocusReport from "./pages/FocusReport";
import Settings from "./pages/Settings";
import Placeholder from "./pages/Placeholder";
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
          <Route path="/loading" element={<Loading />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-pet" element={<CreatePet />} />
          <Route path="/focus-setup" element={<FocusSetup />} />
          <Route path="/focus-report" element={<FocusReport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/activity" element={<Placeholder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
