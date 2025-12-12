import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Agende agora seu horário sem complicação
        </h2>

        <p className="text-muted-foreground mb-8">
          Em poucos cliques você garante seu atendimento com o melhor da barbearia.
        </p>

        <Link to="/agendar">
          <Button variant="hero" size="xl" className="w-full max-w-xs">
            <Calendar className="w-5 h-5" />
            Agendar horário
          </Button>
        </Link>
      </div>
    </section>
  );
}
