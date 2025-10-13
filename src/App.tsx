import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Cursos from "./pages/Cursos";
import DetalheCurso from "./pages/DetalheCurso";
import Professores from "./pages/Professores";
import Performance from "./pages/Performance";
import Analises from "./pages/Analises";
import CRM from "./pages/CRM";
import Relatorios from "./pages/Relatorios";
import GestaoMetas from "./pages/GestaoMetas";
import MapaCursos from "./pages/MapaCursos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota pública */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Layout com Navbar para rotas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <Outlet />
                  </div>
                </ProtectedRoute>
              }>
                {/* Rotas filhas */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="cursos" element={<Cursos />} />
                <Route path="curso/:id" element={<DetalheCurso />} />
                <Route path="professores" element={<Professores />} />
                <Route path="performance" element={<Performance />} />
                <Route path="analises" element={<Analises />} />
                <Route path="crm" element={<CRM />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="gestao-metas" element={<GestaoMetas />} />
                <Route path="mapa-cursos" element={<MapaCursos />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
