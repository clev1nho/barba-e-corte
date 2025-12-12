import { Barber } from "@/hooks/useBarbers";

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
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Nossos Barbeiros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="h-64 md:h-[220px] bg-muted" />
                <div className="p-4">
                  <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
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
    <section className="py-16 px-0 md:px-4">
      <div className="w-full max-w-none md:max-w-4xl mx-auto px-0 md:px-0">
        <h2 className="text-2xl font-bold mb-2 text-center px-4 md:px-0">Nossos Barbeiros</h2>
        <p className="text-muted-foreground text-center mb-8 px-4 md:px-0">
          Profissionais experientes e dedicados
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6">
          {barbers.map((barber, index) => (
            <div
              key={barber.id}
              className="glass-card rounded-none md:rounded-xl overflow-hidden animate-fade-in transition-transform duration-300 md:hover:scale-[1.02] hover:shadow-lg flex flex-col h-[420px] md:h-[360px]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image area - fills available space */}
              <div className="flex-1 overflow-hidden">
                {barber.photo_url ? (
                  <img
                    src={barber.photo_url}
                    alt={barber.name}
                    className="w-full h-full object-cover object-top md:object-contain md:object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-gold flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-primary-foreground">
                      {getInitials(barber.name)}
                    </span>
                  </div>
                )}
              </div>
              {/* Name bar - fixed height at bottom */}
              <div className="h-16 flex items-center justify-center px-4 shrink-0">
                <h3 className="font-semibold text-lg text-center">{barber.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
