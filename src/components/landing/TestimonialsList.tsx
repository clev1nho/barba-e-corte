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
      <section className="py-16 px-4 bg-charcoal">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">O que nossos clientes dizem</h2>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
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
    <section className="py-16 px-4 bg-charcoal">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">O que nossos clientes dizem</h2>
        <p className="text-muted-foreground text-center mb-8">
          Avaliações reais de quem já passou por aqui
        </p>

        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="glass-card rounded-xl p-5 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="w-6 h-6 text-primary/40 mb-2" />
              <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{testimonial.client_name}</p>
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
