import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopSettings } from "@/hooks/useShopSettings";

interface AboutProps {
  settings: ShopSettings | null;
}

export function About({ settings }: AboutProps) {
  const mapsLink = settings?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
    : "#";

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Sobre a Barbearia</h2>

        <div className="glass-card rounded-2xl p-6">
          {/* About description - only render if text exists */}
          {(settings?.about_description !== null && settings?.about_description !== undefined && settings?.about_description !== "") && (
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {settings.about_description}
            </p>
          )}

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Endereço</p>
              <p className="font-medium">{settings?.address || "Rua Principal, 123 - Centro"}</p>
            </div>
          </div>

          <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="block mt-4">
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4" />
              Ver localização no mapa
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
