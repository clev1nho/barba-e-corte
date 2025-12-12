import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Agendar from "./pages/Agendar";
import AdminLogin from "./pages/admin/Login";
import AdminSetup from "./pages/admin/Setup";
import Dashboard from "./pages/admin/Dashboard";
import Agenda from "./pages/admin/Agenda";
import Servicos from "./pages/admin/Servicos";
import Barbeiros from "./pages/admin/Barbeiros";
import Configuracoes from "./pages/admin/Configuracoes";
import Financeiro from "./pages/admin/Financeiro";
import CategoriasHome from "./pages/admin/CategoriasHome";
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
          <Route path="/agendar" element={<Agendar />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/agenda" element={<Agenda />} />
          <Route path="/admin/servicos" element={<Servicos />} />
          <Route path="/admin/barbeiros" element={<Barbeiros />} />
          <Route path="/admin/configuracoes" element={<Configuracoes />} />
          <Route path="/admin/financeiro" element={<Financeiro />} />
          <Route path="/admin/categorias-home" element={<CategoriasHome />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
