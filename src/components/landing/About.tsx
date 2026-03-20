import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopSettings } from "@/hooks/useShopSettings";
import { useLanguage } from "@/i18n/LanguageContext";

interface AboutProps {
  settings: ShopSettings | null;
}

export function About({ settings }: AboutProps) {
  const { t, translateShopField } = useLanguage();
  const mapsLink = settings?.maps_link?.trim() || "";
  const hasMapsLink = mapsLink.length > 0;

  const aboutDescription = translateShopField("about_description", settings?.about_description);

  return (
    <section className="section-premium">
      <div className="max-w-lg mx-auto">
        <div className="premium-divider" />
        <h2 className="section-heading">{t.about_title}</h2>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          {aboutDescription && aboutDescription.trim().length > 0 && (
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">
              {aboutDescription}
            </p>
          )}

          <div className="flex items-start gap-3.5 p-4 bg-muted/40 rounded-xl border border-border/40">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">{t.about_address_label}</p>
              <p className="font-medium text-sm">{settings?.address || t.about_default_address}</p>
            </div>
          </div>

          {hasMapsLink && (
            <a href={mapsLink} target="_blank" rel="noreferrer" className="block mt-4">
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4" />
                {t.about_map_button}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
