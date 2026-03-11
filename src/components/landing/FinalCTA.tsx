import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function FinalCTA() {
  const ref = useScrollReveal();

  return (
    <section className="section-premium" ref={ref}>
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-6 border border-primary/15 reveal-on-scroll">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight reveal-on-scroll">
          Agende agora seu horário sem complicação
        </h2>

        <div className="premium-divider reveal-on-scroll" />

        <p className="text-muted-foreground mb-8 text-sm md:text-base reveal-on-scroll">
          Em poucos cliques você garante seu atendimento com o melhor da barbearia.
        </p>

        <Link to="/agendar" className="reveal-on-scroll inline-block">
          <Button variant="hero" size="xl" className="w-full max-w-xs">
            <Calendar className="w-5 h-5" />
            Agendar horário
          </Button>
        </Link>
      </div>
    </section>
  );
}
