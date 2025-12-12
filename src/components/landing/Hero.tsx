import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { ShopSettings } from "@/hooks/useShopSettings";

interface HeroProps {
  settings: ShopSettings | null;
}

export function Hero({ settings }: HeroProps) {
  const [logoError, setLogoError] = useState(false);
  
  const whatsappLink = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : "#";

  const hasCustomLogo = settings?.logo_url && !logoError;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background image with responsive positioning */}
      <div 
        className="absolute inset-0 bg-cover bg-[position:85%_10%] md:bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo/Icon */}
        <div className="mb-6 animate-float">
          {hasCustomLogo ? (
            <img
              src={settings.logo_url!}
              alt={settings?.name || "Logo"}
              className="w-24 h-24 mx-auto object-contain rounded-2xl shadow-lg shadow-primary/30"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-gold shadow-lg shadow-primary/30">
              <Scissors className="w-10 h-10 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
          {settings?.name || "Barbearia Exclusiva"}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-white font-semibold mb-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {settings?.subtitle || "Cortes de alto nível e atendimento profissional"}
        </p>

        {/* Description - only render if text exists */}
        {(settings?.hero_secondary_text !== null && settings?.hero_secondary_text !== undefined && settings?.hero_secondary_text !== "") && (
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {settings.hero_secondary_text}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/agendar" className="w-full">
            <Button variant="hero" size="xl" className="w-full">
              <Calendar className="w-5 h-5" />
              Agendar horário
            </Button>
          </Link>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" size="lg" className="w-full border-primary/30 text-foreground hover:bg-primary/10">
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </Button>
          </a>
        </div>

        {/* Quick info card */}
        <div className="mt-10 glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs text-muted-foreground mb-2">Horário de funcionamento</p>
          <p className="text-lg font-semibold text-primary">
            {settings?.open_time || "09:00"} - {settings?.close_time || "19:00"}
          </p>
        </div>
      </div>
    </section>
  );
}
