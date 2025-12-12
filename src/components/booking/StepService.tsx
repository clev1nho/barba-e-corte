import { Check } from "lucide-react";
import { Service } from "@/hooks/useServices";

interface StepServiceProps {
  services: Service[];
  isLoading: boolean;
  selected: Service | null;
  onSelect: (service: Service) => void;
}

export function StepService({ services, isLoading, selected, onSelect }: StepServiceProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-6">Escolha o serviço</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-2" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-6">Escolha o serviço</h2>

      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service)}
          className={`w-full text-left glass-card rounded-xl p-4 transition-all ${
            selected?.id === service.id
              ? "ring-2 ring-primary bg-primary/10"
              : "hover:bg-muted/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {service.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-muted-foreground">
                  {service.duration_minutes} min
                </span>
                <span className="text-primary font-semibold">
                  R$ {service.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
            {selected?.id === service.id && (
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
