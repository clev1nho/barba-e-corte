import { Clock, CalendarCheck, ThumbsUp, Shield } from "lucide-react";
import { ShopSettings } from "@/hooks/useShopSettings";

interface BenefitsProps {
  settings: ShopSettings | null;
}

const defaultBenefits = [
  { icon: Clock, text: "Evite filas e espera desnecessária" },
  { icon: CalendarCheck, text: "Escolha barbeiro, serviço, dia e horário" },
  { icon: ThumbsUp, text: "Receba confirmação do seu horário" },
  { icon: Shield, text: "Experiência profissional garantida" },
];

export function Benefits({ settings }: BenefitsProps) {
  const benefits = settings?.highlight_points?.length
    ? settings.highlight_points.map((text, i) => ({
        icon: defaultBenefits[i % defaultBenefits.length].icon,
        text,
      }))
    : defaultBenefits;

  return (
    <section className="section-premium bg-card/50">
      <div className="max-w-lg mx-auto">
        <div className="premium-divider" />
        <h2 className="section-heading">Por que agendar pelo app?</h2>
        <p className="section-subheading">
          Praticidade para você, organização para nós
        </p>

        <div className="grid gap-3.5">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-4 glass-card-hover rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-sm">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
