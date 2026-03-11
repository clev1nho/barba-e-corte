import { Check, User, Users } from "lucide-react";
import { Barber } from "@/hooks/useBarbers";

interface StepBarberProps {
  barbers: Barber[];
  isLoading: boolean;
  selected: Barber | null;
  anyBarber: boolean;
  onSelect: (barber: Barber | null, anyBarber: boolean) => void;
}

export function StepBarber({ barbers, isLoading, selected, anyBarber, onSelect }: StepBarberProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-6 font-display">Escolha o barbeiro</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted/40" />
              <div className="flex-1">
                <div className="h-5 bg-muted/40 rounded w-24 mb-2" />
                <div className="h-4 bg-muted/40 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <h2 className="text-xl font-bold mb-6 font-display tracking-tight">Escolha o barbeiro</h2>

      <button
        onClick={() => onSelect(null, true)}
        className={`w-full text-left glass-card rounded-xl p-4 transition-all duration-220 ${
          anyBarber ? "ring-2 ring-primary bg-primary/6 border-primary/20" : "hover:bg-muted/20 hover:border-primary/10"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center border border-border/30">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Qualquer barbeiro disponível</h3>
            <p className="text-sm text-muted-foreground">
              Mostraremos os horários com barbeiros disponíveis
            </p>
          </div>
          {anyBarber && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </button>

      {barbers.map((barber) => (
        <button
          key={barber.id}
          onClick={() => onSelect(barber, false)}
          className={`w-full text-left glass-card rounded-xl p-4 transition-all duration-220 ${
            selected?.id === barber.id && !anyBarber
              ? "ring-2 ring-primary bg-primary/6 border-primary/20"
              : "hover:bg-muted/20 hover:border-primary/10"
          }`}
        >
          <div className="flex items-center gap-4">
            {barber.photo_url ? (
              <img
                src={barber.photo_url}
                alt={barber.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/15"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{barber.name}</h3>
              {barber.bio && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {barber.bio}
                </p>
              )}
            </div>
            {selected?.id === barber.id && !anyBarber && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
