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
    <section className="py-16 px-4 bg-charcoal">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Por que agendar pelo app?</h2>
        <p className="text-muted-foreground text-center mb-8">
          Praticidade para você, organização para nós
        </p>

        <div className="grid gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-4 glass-card rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
