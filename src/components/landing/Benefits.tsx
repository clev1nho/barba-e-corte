import { Clock, CalendarCheck, ThumbsUp, Shield } from "lucide-react";
import { ShopSettings } from "@/hooks/useShopSettings";
import { useLanguage } from "@/i18n/LanguageContext";

interface BenefitsProps {
  settings: ShopSettings | null;
}

const defaultIcons = [Clock, CalendarCheck, ThumbsUp, Shield];

export function Benefits({ settings }: BenefitsProps) {
  const { t, translateShopField } = useLanguage();

  const highlightPoints = translateShopField("highlight_points", settings?.highlight_points);

  const benefits = highlightPoints?.length
    ? highlightPoints.map((text: string, i: number) => ({
        icon: defaultIcons[i % defaultIcons.length],
        text,
      }))
    : t.benefits_default.map((text, i) => ({
        icon: defaultIcons[i % defaultIcons.length],
        text,
      }));

  return (
    <section className="section-premium bg-card/50">
      <div className="max-w-lg mx-auto">
        <div className="premium-divider" />
        <h2 className="section-heading">{t.benefits_title}</h2>
        <p className="section-subheading">{t.benefits_subtitle}</p>

        <div className="grid gap-3.5">
          {benefits.map((benefit: { icon: any; text: string }, index: number) => (
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
