import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { ShopSettings } from "@/hooks/useShopSettings";

interface HeroProps {
  settings: ShopSettings | null;
  isLoading?: boolean;
}

export function Hero({ settings, isLoading }: HeroProps) {
  const [logoError, setLogoError] = useState(false);

  if (isLoading) {
    return (
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-16 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-muted/50 animate-pulse" />
      </section>
    );
  }

  const whatsappLink = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : "#";

  const hasCustomLogo = settings?.logo_url && !logoError;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: `url('/images/hero-bg.jpg')`,
          backgroundPosition: '90% 10%',
        }}
      />
      
      {/* Gradient overlay for premium look */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 animate-float">
          {hasCustomLogo ? (
            <img
              src={settings.logo_url!}
              alt={settings?.name || "Logo"}
              className="w-28 h-28 mx-auto object-contain rounded-2xl shadow-lg shadow-primary/20"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-gold shadow-lg shadow-primary/20">
              <Scissors className="w-12 h-12 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in tracking-tight">
          {settings?.name || "Barbearia Exclusiva"}
        </h1>

        {/* Decorative line */}
        <div className="premium-divider animate-fade-in" style={{ animationDelay: "0.05s" }} />

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-foreground/90 font-medium mb-3 animate-fade-in font-sans" style={{ animationDelay: "0.1s" }}>
          {settings?.subtitle || "Cortes de alto nível e atendimento profissional"}
        </p>

        {/* Description */}
        {settings?.hero_secondary_text && settings.hero_secondary_text.trim().length > 0 && (
          <p className="text-muted-foreground mb-8 animate-fade-in font-sans text-sm md:text-base" style={{ animationDelay: "0.2s" }}>
            {settings.hero_secondary_text}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 animate-slide-up max-w-xs mx-auto" style={{ animationDelay: "0.3s" }}>
          <Link to="/agendar" className="w-full">
            <Button variant="hero" size="xl" className="w-full">
              <Calendar className="w-5 h-5" />
              Agendar horário
            </Button>
          </Link>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" size="lg" className="w-full border-primary/25 text-foreground hover:bg-primary/10 hover:border-primary/40">
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </Button>
          </a>
        </div>

        {/* Opening hours card */}
        {settings?.opening_hours && settings.opening_hours.trim().length > 0 && (
          <div className="mt-12 glass-card rounded-2xl p-5 animate-slide-up max-w-xs mx-auto" style={{ animationDelay: "0.4s" }}>
            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-widest font-sans">Horário de funcionamento</p>
            <p className="text-lg font-semibold text-primary font-sans">
              {settings.opening_hours}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
