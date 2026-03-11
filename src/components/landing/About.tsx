import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopSettings } from "@/hooks/useShopSettings";

interface AboutProps {
  settings: ShopSettings | null;
}

export function About({ settings }: AboutProps) {
  const mapsLink = settings?.maps_link?.trim() || "";
  const hasMapsLink = mapsLink.length > 0;

  return (
    <section className="section-premium">
      <div className="max-w-lg mx-auto">
        <div className="premium-divider" />
        <h2 className="section-heading">Sobre a Barbearia</h2>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          {settings?.about_description && settings.about_description.trim().length > 0 && (
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">
              {settings.about_description}
            </p>
          )}

          <div className="flex items-start gap-3.5 p-4 bg-muted/40 rounded-xl border border-border/40">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">Endereço</p>
              <p className="font-medium text-sm">{settings?.address || "Rua Principal, 123 - Centro"}</p>
            </div>
          </div>

          {hasMapsLink && (
            <a href={mapsLink} target="_blank" rel="noreferrer" className="block mt-4">
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4" />
                Ver localização no mapa
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
