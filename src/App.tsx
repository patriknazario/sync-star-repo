import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Cursos from "./pages/Cursos";
import Professores from "./pages/Professores";
import Performance from "./pages/Performance";
import Analises from "./pages/Analises";
import CRM from "./pages/CRM";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/professores" element={<Professores />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/analises" element={<Analises />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
