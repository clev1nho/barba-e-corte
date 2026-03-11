import { Barber } from "@/hooks/useBarbers";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface BarbersListProps {
  barbers: Barber[];
  isLoading: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BarbersList({ barbers, isLoading }: BarbersListProps) {
  const ref = useScrollReveal();

  if (isLoading) {
    return (
      <section className="section-premium">
        <div className="max-w-4xl mx-auto">
          <div className="premium-divider" />
          <h2 className="section-heading">Nossos Barbeiros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 md:h-[220px] bg-muted/40" />
                <div className="p-4">
                  <div className="h-5 bg-muted/40 rounded w-3/4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!barbers?.length) return null;

  return (
    <section className="section-premium" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="premium-divider reveal-on-scroll" />
        <h2 className="section-heading reveal-on-scroll">Nossos Barbeiros</h2>
        <p className="section-subheading reveal-on-scroll">
          Profissionais experientes e dedicados
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbers.map((barber, index) => (
            <div
              key={barber.id}
              className="glass-card-hover rounded-2xl overflow-hidden reveal-on-scroll flex flex-col border-primary/10"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Image area */}
              <div className="w-full aspect-[3/4] bg-card/50 flex items-center justify-center p-4">
                {barber.photo_url ? (
                  <img
                    src={barber.photo_url}
                    alt={barber.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-gold rounded-xl flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-primary-foreground font-display">
                      {getInitials(barber.name)}
                    </span>
                  </div>
                )}
              </div>
              {/* Name bar */}
              <div className="h-16 flex items-center justify-center px-4 shrink-0 bg-card/60 border-t border-primary/8">
                <h3 className="font-semibold text-lg text-center text-foreground font-sans">{barber.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
