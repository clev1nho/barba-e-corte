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
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-16 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-muted/30 animate-pulse" />
      </section>
    );
  }

  const whatsappLink = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : "#";

  const hasCustomLogo = settings?.logo_url && !logoError;

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-24 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-bg.jpg')`,
          backgroundPosition: '90% 10%',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />

      {/* Multi-layer overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo/Icon */}
        <div className="mb-10 animate-float">
          {hasCustomLogo ? (
            <img
              src={settings.logo_url!}
              alt={settings?.name || "Logo"}
              className="w-32 h-32 mx-auto object-contain rounded-2xl shadow-[var(--shadow-premium)] ring-1 ring-primary/20"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl bg-gradient-gold shadow-[var(--shadow-premium)] ring-1 ring-primary/30">
              <Scissors className="w-14 h-14 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 animate-fade-in tracking-tight leading-[1.1]">
          {settings?.name || "Barbearia Exclusiva"}
        </h1>

        {/* Decorative line */}
        <div className="premium-divider animate-fade-in" style={{ animationDelay: "0.08s" }} />

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-foreground/85 font-medium mb-3 animate-fade-in font-sans" style={{ animationDelay: "0.15s" }}>
          {settings?.subtitle || "Cortes de alto nível e atendimento profissional"}
        </p>

        {/* Description */}
        {settings?.hero_secondary_text && settings.hero_secondary_text.trim().length > 0 && (
          <p className="text-muted-foreground mb-10 animate-fade-in font-sans text-sm md:text-base max-w-sm mx-auto" style={{ animationDelay: "0.25s" }}>
            {settings.hero_secondary_text}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 animate-slide-up max-w-xs mx-auto" style={{ animationDelay: "0.35s" }}>
          <Link to="/agendar" className="w-full">
            <Button variant="hero" size="xl" className="w-full">
              <Calendar className="w-5 h-5" />
              Agendar horário
            </Button>
          </Link>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" size="lg" className="w-full border-primary/20 text-foreground hover:bg-primary/8 hover:border-primary/35">
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </Button>
          </a>
        </div>

        {/* Opening hours card */}
        {settings?.opening_hours && settings.opening_hours.trim().length > 0 && (
          <div className="mt-14 glass-card rounded-2xl p-5 animate-slide-up max-w-xs mx-auto border-primary/10" style={{ animationDelay: "0.5s" }}>
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-[0.2em] font-sans font-medium">Horário de funcionamento</p>
            <p className="text-lg font-semibold text-primary font-sans">
              {settings.opening_hours}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
