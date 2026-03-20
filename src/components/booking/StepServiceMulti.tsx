import { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp, Clock, DollarSign, AlertCircle } from "lucide-react";
import { useServicesWithCategories, ServiceWithCategory, groupServicesByCategory } from "@/hooks/useServicesWithCategories";
import { useServiceIdsForBarber } from "@/hooks/useBarberServices";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

interface StepServiceMultiProps {
  selectedServices: ServiceWithCategory[];
  onSelect: (services: ServiceWithCategory[]) => void;
  onContinue: () => void;
  barberId?: string;
}

export function StepServiceMulti({ selectedServices, onSelect, onContinue, barberId }: StepServiceMultiProps) {
  const { data: services, isLoading } = useServicesWithCategories();
  const { data: barberServiceIds } = useServiceIdsForBarber(barberId);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { t, translateService } = useLanguage();

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const availableServices = useMemo(() => {
    if (!services) return [];
    if (!barberId || !barberServiceIds || barberServiceIds.length === 0) {
      return services;
    }
    return services.filter(s => barberServiceIds.includes(s.id));
  }, [services, barberId, barberServiceIds]);

  const toggleService = (service: ServiceWithCategory) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      onSelect(selectedServices.filter(s => s.id !== service.id));
    } else {
      onSelect([...selectedServices, service]);
    }
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDeposit = selectedServices.reduce((sum, s) => sum + (s.deposit_amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-6">{t.step_service_multi_title}</h2>
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

  const grouped = groupServicesByCategory(availableServices);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{t.step_service_multi_title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.step_service_multi_subtitle}</p>
      </div>

      {selectedServices.length > 0 && (
        <div className="glass-card rounded-xl p-4 border-2 border-primary/30 space-y-2">
          <h3 className="font-semibold text-sm">{t.step_service_multi_summary}</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {totalDuration} {t.min_unit}
            </span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <DollarSign className="w-4 h-4" />
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
            {totalDeposit > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {t.step_service_multi_deposit}: R$ {totalDeposit.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {selectedServices.map(s => (
              <span key={s.id} className="text-xs bg-muted px-2 py-1 rounded">
                {translateService(s.id, s.name)}
              </span>
            ))}
          </div>
        </div>
      )}

      {barberId && barberServiceIds && barberServiceIds.length > 0 && barberServiceIds.length !== services?.length && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{t.step_service_multi_barber_filter}</span>
        </div>
      )}

      {grouped.map((group) => {
        const isExpanded = expandedCategories[group.categoryName] ?? false;
        const hasSubcategories = Object.keys(group.subcategories).length > 0;
        const allCategoryServices = [...group.services, ...Object.values(group.subcategories).flat()];
        const categorySelectedCount = allCategoryServices.filter(s => selectedServices.some(sel => sel.id === s.id)).length;

        return (
          <div key={group.categoryName} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCategory(group.categoryName)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{group.categoryName}</span>
                {categorySelectedCount > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {categorySelectedCount}
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isExpanded && (
              <div className="border-t border-border">
                {group.services.map((service) => (
                  <ServiceItemMulti
                    key={service.id}
                    service={service}
                    isSelected={selectedServices.some(s => s.id === service.id)}
                    onToggle={toggleService}
                  />
                ))}

                {hasSubcategories && Object.entries(group.subcategories).map(([subcat, services]) => (
                  <div key={subcat}>
                    <div className="px-4 py-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                      {subcat}
                    </div>
                    {services.map((service) => (
                      <ServiceItemMulti
                        key={service.id}
                        service={service}
                        isSelected={selectedServices.some(s => s.id === service.id)}
                        onToggle={toggleService}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Button 
        onClick={onContinue}
        disabled={selectedServices.length === 0}
        size="lg" 
        className="w-full mt-4"
      >
        {selectedServices.length === 0 
          ? t.step_service_multi_select_min 
          : t.step_service_multi_continue.replace("{n}", String(selectedServices.length))}
      </Button>
    </div>
  );
}

function ServiceItemMulti({ 
  service, 
  isSelected, 
  onToggle 
}: { 
  service: ServiceWithCategory; 
  isSelected: boolean; 
  onToggle: (s: ServiceWithCategory) => void;
}) {
  const { t, translateService } = useLanguage();

  return (
    <button
      onClick={() => onToggle(service)}
      className={`w-full text-left p-4 border-b border-border/50 last:border-b-0 transition-all ${
        isSelected ? "bg-primary/10" : "hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-medium">{translateService(service.id, service.name)}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm">
            <span className="text-muted-foreground">{service.duration_minutes} {t.min_unit}</span>
            <span className="text-primary font-semibold">
              R$ {service.price.toFixed(2).replace(".", ",")}
            </span>
            {(service.deposit_amount ?? 0) > 0 && (
              <span className="text-xs text-muted-foreground">
                {t.step_service_multi_deposit}: R$ {(service.deposit_amount ?? 0).toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
          isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
        }`}>
          {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
        </div>
      </div>
    </button>
  );
}
