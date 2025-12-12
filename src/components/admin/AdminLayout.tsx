import { ReactNode, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LayoutDashboard, Calendar, Scissors, Users, Settings, LogOut, Home, Loader2, DollarSign } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Calendar, label: "Agenda", href: "/admin/agenda" },
  { icon: Scissors, label: "Serviços", href: "/admin/servicos" },
  { icon: Users, label: "Barbeiros", href: "/admin/barbeiros" },
  { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
  { icon: Settings, label: "Config", href: "/admin/configuracoes" },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAuthenticated, isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleBackToSite = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">{title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToSite}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao site</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-24 px-4 py-6">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-2 py-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px]">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
