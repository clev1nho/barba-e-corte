import { useActiveHomeCards } from "@/hooks/useHomeCards";
import { useNavigate } from "react-router-dom";
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

  // Não mostrar seção se não há cards ativos
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
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, index) => {
            const IconComponent = ICON_MAP[card.icon_key] || MessageCircle;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.link_url)}
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gold/30 shadow-lg group transition-all duration-300 hover:scale-[1.02] hover:border-gold/60 hover:shadow-xl animate-fade-in text-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background image or gradient */}
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal" />
                )}

                {/* Dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Icon badge - top right */}
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg">
                  <IconComponent className="w-5 h-5 text-primary-foreground" />
                </div>

                {/* Text content - bottom left */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg md:text-xl font-semibold text-white drop-shadow-md">
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p className="text-sm text-white/80 mt-1 drop-shadow">
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
