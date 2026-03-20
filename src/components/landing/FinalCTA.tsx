import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="section-premium">
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
          {t.final_cta_title}
        </h2>

        <div className="premium-divider" />

        <p className="text-muted-foreground mb-8 text-sm md:text-base">
          {t.final_cta_subtitle}
        </p>

        <Link to="/agendar">
          <Button variant="hero" size="xl" className="w-full max-w-xs">
            <Calendar className="w-5 h-5" />
            {t.final_cta_button}
          </Button>
        </Link>
      </div>
    </section>
  );
}
