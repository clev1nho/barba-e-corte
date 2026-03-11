import { Star, Quote } from "lucide-react";
import { Testimonial } from "@/hooks/useTestimonials";

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
          className={`w-4 h-4 ${
            star <= rating ? "text-primary fill-primary" : "text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsList({ testimonials, isLoading }: TestimonialsListProps) {
  if (isLoading) {
    return (
      <section className="section-premium bg-card/50">
        <div className="max-w-lg mx-auto">
          <div className="premium-divider" />
          <h2 className="section-heading">O que nossos clientes dizem</h2>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials?.length) return null;

  return (
    <section className="section-premium bg-card/50">
      <div className="max-w-lg mx-auto">
        <div className="premium-divider" />
        <h2 className="section-heading">O que nossos clientes dizem</h2>
        <p className="section-subheading">
          Avaliações reais de quem já passou por aqui
        </p>

        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="glass-card-hover rounded-2xl p-5 animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-foreground/90 mb-4 italic leading-relaxed text-sm md:text-base">"{testimonial.text}"</p>
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
