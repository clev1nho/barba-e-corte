import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useServicesWithCategories, ServiceWithCategory, groupServicesByCategory } from "@/hooks/useServicesWithCategories";

interface StepServiceProps {
  services?: any[]; // Legacy prop, ignored
  isLoading?: boolean;
  selected: ServiceWithCategory | null;
  onSelect: (service: ServiceWithCategory) => void;
}

export function StepService({ selected, onSelect }: StepServiceProps) {
  const { data: services, isLoading } = useServicesWithCategories();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

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

  const grouped = groupServicesByCategory(services || []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-6">Escolha o serviço</h2>

      {grouped.map((group) => {
        const isExpanded = expandedCategories[group.categoryName] ?? false;
        const hasSubcategories = Object.keys(group.subcategories).length > 0;

        return (
          <div key={group.categoryName} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCategory(group.categoryName)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold">{group.categoryName}</span>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isExpanded && (
              <div className="border-t border-border">
                {/* Regular services */}
                {group.services.map((service) => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                    isSelected={selected?.id === service.id}
                    onSelect={onSelect}
                  />
                ))}

                {/* Subcategories */}
                {hasSubcategories && Object.entries(group.subcategories).map(([subcat, services]) => (
                  <div key={subcat}>
                    <div className="px-4 py-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                      {subcat}
                    </div>
                    {services.map((service) => (
                      <ServiceItem
                        key={service.id}
                        service={service}
                        isSelected={selected?.id === service.id}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ServiceItem({ 
  service, 
  isSelected, 
  onSelect 
}: { 
  service: ServiceWithCategory; 
  isSelected: boolean; 
  onSelect: (s: ServiceWithCategory) => void;
}) {
  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full text-left p-4 border-b border-border/50 last:border-b-0 transition-all ${
        isSelected ? "bg-primary/10" : "hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-medium">{service.name}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm">
            <span className="text-muted-foreground">{service.duration_minutes} min</span>
            <span className="text-primary font-semibold">
              R$ {service.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}
