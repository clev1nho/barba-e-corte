import { Star, Quote } from "lucide-react";
import { Testimonial } from "@/hooks/useTestimonials";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface TestimonialsListProps {
  testimonials: Testimonial[];
  isLoading: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? "text-primary fill-primary" : "text-muted/60"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsList({ testimonials, isLoading }: TestimonialsListProps) {
  const ref = useScrollReveal();

  if (isLoading) {
    return (
      <section className="section-premium bg-card/30">
        <div className="max-w-lg mx-auto">
          <div className="premium-divider" />
          <h2 className="section-heading">O que nossos clientes dizem</h2>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted/40 rounded w-full mb-2" />
                <div className="h-4 bg-muted/40 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials?.length) return null;

  return (
    <section className="section-premium bg-card/30" ref={ref}>
      <div className="max-w-lg mx-auto">
        <div className="premium-divider reveal-on-scroll" />
        <h2 className="section-heading reveal-on-scroll">O que nossos clientes dizem</h2>
        <p className="section-subheading reveal-on-scroll">
          Avaliações reais de quem já passou por aqui
        </p>

        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="glass-card-hover rounded-2xl p-5 reveal-on-scroll"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <Quote className="w-5 h-5 text-primary/20 mb-3" />
              <p className="text-foreground/85 mb-4 italic leading-relaxed text-sm md:text-base">"{testimonial.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{testimonial.client_name}</p>
                  {testimonial.date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(testimonial.date).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <StarRating rating={testimonial.rating || 5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
