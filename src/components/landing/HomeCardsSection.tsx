import { useActiveHomeCards } from "@/hooks/useHomeCards";
import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  MessageCircle,
  Lock,
  Globe,
  Instagram,
  MessageSquare,
  Link2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  message: MessageCircle,
  lock: Lock,
  globe: Globe,
  instagram: Instagram,
  whatsapp: MessageSquare,
  link: Link2,
};

export function HomeCardsSection() {
  const { data: cards, isLoading } = useActiveHomeCards();
  const navigate = useNavigate();
  const ref = useScrollReveal();

  if (isLoading || !cards?.length) {
    return null;
  }

  const handleCardClick = (linkUrl: string) => {
    if (linkUrl.startsWith("http")) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(linkUrl);
    }
  };

  return (
    <section className="py-12 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, index) => {
            const IconComponent = ICON_MAP[card.icon_key] || MessageCircle;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.link_url)}
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-primary/10 shadow-[var(--shadow-card)] group transition-all duration-220 hover:border-primary/25 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 reveal-on-scroll text-left"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/10" />

                {/* Icon badge */}
                <div className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-md">
                  <IconComponent className="w-5 h-5 text-primary-foreground" />
                </div>

                {/* Text content */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground drop-shadow-md font-display">
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p className="text-sm text-foreground/65 mt-1 drop-shadow font-sans">
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
