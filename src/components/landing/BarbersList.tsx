import { User } from "lucide-react";
import { Barber } from "@/hooks/useBarbers";

interface BarbersListProps {
  barbers: Barber[];
  isLoading: boolean;
}

export function BarbersList({ barbers, isLoading }: BarbersListProps) {
  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Nossos Barbeiros</h2>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-24 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
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
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Nossos Barbeiros</h2>
        <p className="text-muted-foreground text-center mb-8">
          Profissionais experientes e dedicados
        </p>

        <div className="grid gap-4">
          {barbers.map((barber, index) => (
            <div
              key={barber.id}
              className="glass-card rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {barber.photo_url ? (
                    <img
                      src={barber.photo_url}
                      alt={barber.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{barber.name}</h3>
                  {barber.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{barber.bio}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
