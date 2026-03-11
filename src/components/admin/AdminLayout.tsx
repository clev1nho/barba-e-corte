import { ReactNode, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LayoutDashboard, Calendar, Scissors, Users, Settings, LogOut, Home, Loader2, DollarSign, LayoutGrid } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const allNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", ownerOnly: true },
  { icon: Calendar, label: "Agenda", href: "/admin/agenda", ownerOnly: false },
  { icon: Scissors, label: "Serviços", href: "/admin/servicos", ownerOnly: true },
  { icon: Users, label: "Barbeiros", href: "/admin/barbeiros", ownerOnly: true },
  { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro", ownerOnly: true },
  { icon: LayoutGrid, label: "Home", href: "/admin/categorias-home", ownerOnly: true },
  { icon: Settings, label: "Config", href: "/admin/configuracoes", ownerOnly: true },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAuthenticated, hasAdminAccess, isAdminOrOwner, isStaff, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(() => {
    if (isAdminOrOwner) return allNavItems;
    return allNavItems.filter(item => !item.ownerOnly);
  }, [isAdminOrOwner]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !hasAdminAccess)) {
      navigate("/admin/login");
      return;
    }
    
    if (!loading && isStaff && location.pathname !== "/admin/agenda") {
      navigate("/admin/agenda");
    }
  }, [loading, isAuthenticated, hasAdminAccess, isStaff, navigate, location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleBackToSite = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !hasAdminAccess) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3.5 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-gradient-gold rounded-full" />
            <div>
              <h1 className="font-bold text-lg font-display tracking-tight leading-tight">{title}</h1>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-medium">Painel administrativo</p>
            </div>
          </div>
          <button
            onClick={handleBackToSite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/8 text-primary hover:bg-primary/12 transition-all duration-220 font-medium border border-primary/10"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltar ao site</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pb-24 px-4 py-6 max-w-4xl mx-auto">{children}</main>

      {/* Premium Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/30 safe-area-pb">
        <div className="flex overflow-x-auto scrollbar-hide py-2 px-1 max-w-4xl mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-220 flex-shrink-0 min-w-[72px] ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-220 ${isActive ? "bg-primary/10 shadow-sm" : ""}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] whitespace-nowrap font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground hover:text-destructive transition-all duration-220 flex-shrink-0 min-w-[72px]"
          >
            <div className="p-1.5">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] whitespace-nowrap font-medium">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
