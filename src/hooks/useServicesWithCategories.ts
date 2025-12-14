import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceWithCategory {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  deposit_amount: number | null;
  active: boolean | null;
  category_id: string | null;
  subcategory: string | null;
  category_name?: string;
  category_order?: number | null;
}

export function useServicesWithCategories(activeOnly = true) {
  return useQuery({
    queryKey: ["services_with_categories", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("services")
        .select(`
          *,
          service_categories (
            name,
            display_order
          )
        `);
      
      if (activeOnly) {
        query = query.eq("active", true);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      
      return data.map((service: any) => ({
        ...service,
        category_name: service.service_categories?.name || null,
        category_order: service.service_categories?.display_order ?? 999,
      })) as ServiceWithCategory[];
    },
  });
}

export interface GroupedServices {
  categoryName: string;
  categoryOrder: number;
  services: ServiceWithCategory[];
  subcategories: Record<string, ServiceWithCategory[]>;
}

export function groupServicesByCategory(services: ServiceWithCategory[]): GroupedServices[] {
  const groupsMap: Record<string, GroupedServices> = {};
  
  services.forEach((service) => {
    const categoryName = service.category_name || "Outros";
    const categoryOrder = service.category_order ?? 999;
    
    if (!groupsMap[categoryName]) {
      groupsMap[categoryName] = { 
        categoryName, 
        categoryOrder, 
        services: [], 
        subcategories: {} 
      };
    }
    
    if (service.subcategory) {
      if (!groupsMap[categoryName].subcategories[service.subcategory]) {
        groupsMap[categoryName].subcategories[service.subcategory] = [];
      }
      groupsMap[categoryName].subcategories[service.subcategory].push(service);
    } else {
      groupsMap[categoryName].services.push(service);
    }
  });
  
  // Sort by category order, then by name
  return Object.values(groupsMap).sort((a, b) => {
    if (a.categoryOrder !== b.categoryOrder) {
      return a.categoryOrder - b.categoryOrder;
    }
    return a.categoryName.localeCompare(b.categoryName, 'pt-BR');
  });
}
