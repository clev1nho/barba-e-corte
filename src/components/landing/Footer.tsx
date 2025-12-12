import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { useShopSettings } from "@/hooks/useShopSettings";

export function Footer() {
  const { data: settings } = useShopSettings();

  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings?.name || "Logo"} 
              className="w-8 h-8 rounded-lg object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <span className="font-semibold">{settings?.name || "Care For Men"}</span>
        </div>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <Link to="/agendar" className="hover:text-primary transition-colors">
            Agendar
          </Link>
          <Link to="/admin/login" className="hover:text-primary transition-colors">
            Admin
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Barbearia Exclusiva. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
