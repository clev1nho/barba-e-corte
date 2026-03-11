import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { useShopSettings } from "@/hooks/useShopSettings";

export function Footer() {
  const { data: settings } = useShopSettings();

  const footerText = settings?.footer_text?.trim();

  return (
    <footer className="py-12 px-4 border-t border-border/30 bg-card/20">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2.5 mb-6">
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
          <span className="font-semibold font-display tracking-tight">{settings?.name || "Care For Men"}</span>
        </div>

        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors duration-220">
            Início
          </Link>
          <Link to="/agendar" className="hover:text-primary transition-colors duration-220">
            Agendar
          </Link>
          <Link to="/admin/login" className="hover:text-primary transition-colors duration-220">
            Admin
          </Link>
        </div>

        {footerText && footerText.length > 0 && (
          <p className="text-center text-xs text-muted-foreground/50 mt-8">
            {footerText}
          </p>
        )}
      </div>
    </footer>
  );
}
