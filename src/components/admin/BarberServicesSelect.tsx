import { useServices } from "@/hooks/useServices";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface BarberServicesSelectProps {
  selectedServiceIds: string[];
  onChange: (serviceIds: string[]) => void;
  disabled?: boolean;
}

export function BarberServicesSelect({ 
  selectedServiceIds, 
  onChange, 
  disabled 
}: BarberServicesSelectProps) {
  const { data: services, isLoading: loadingServices } = useServices(false);
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();

  if (loadingServices || loadingCategories) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      onChange(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      onChange([...selectedServiceIds, serviceId]);
    }
  };

  const selectAll = () => {
    if (services) {
      onChange(services.map(s => s.id));
    }
  };

  const deselectAll = () => {
    onChange([]);
  };

  // Group services by category
  const servicesByCategory: Record<string, typeof services> = {};
  const uncategorized: typeof services = [];

  services?.forEach(service => {
    const categoryId = (service as any).category_id;
    if (categoryId) {
      if (!servicesByCategory[categoryId]) {
        servicesByCategory[categoryId] = [];
      }
      servicesByCategory[categoryId]?.push(service);
    } else {
      uncategorized?.push(service);
    }
  });

  const getCategoryName = (categoryId: string) => {
    return categories?.find(c => c.id === categoryId)?.name || "Sem categoria";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Serviços que este barbeiro realiza</Label>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={selectAll} className="text-primary hover:underline" disabled={disabled}>
            Todos
          </button>
          <span className="text-muted-foreground">|</span>
          <button type="button" onClick={deselectAll} className="text-primary hover:underline" disabled={disabled}>
            Nenhum
          </button>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-4">
        {Object.entries(servicesByCategory).map(([categoryId, categoryServices]) => (
          <div key={categoryId}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              {getCategoryName(categoryId)}
            </p>
            <div className="space-y-2 pl-2">
              {categoryServices?.map(service => (
                <div key={service.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServiceIds.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                    disabled={disabled}
                  />
                  <Label 
                    htmlFor={`service-${service.id}`} 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {service.name}
                    {!service.active && <span className="text-muted-foreground ml-1">(inativo)</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}

        {uncategorized && uncategorized.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Sem categoria</p>
            <div className="space-y-2 pl-2">
              {uncategorized.map(service => (
                <div key={service.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServiceIds.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                    disabled={disabled}
                  />
                  <Label 
                    htmlFor={`service-${service.id}`} 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {service.name}
                    {!service.active && <span className="text-muted-foreground ml-1">(inativo)</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!services || services.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhum serviço cadastrado
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {selectedServiceIds.length} serviço(s) selecionado(s)
      </p>
    </div>
  );
}
