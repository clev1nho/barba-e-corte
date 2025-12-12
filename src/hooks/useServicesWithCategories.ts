import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceWithCategory {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean | null;
  category_id: string | null;
  subcategory: string | null;
  category_name?: string;
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
            name
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
      })) as ServiceWithCategory[];
    },
  });
}

export function groupServicesByCategory(services: ServiceWithCategory[]) {
  const groups: Record<string, { 
    services: ServiceWithCategory[]; 
    subcategories?: Record<string, ServiceWithCategory[]> 
  }> = {};
  
  services.forEach((service) => {
    const categoryName = service.category_name || "Outros";
    
    if (!groups[categoryName]) {
      groups[categoryName] = { services: [], subcategories: {} };
    }
    
    if (service.subcategory) {
      if (!groups[categoryName].subcategories![service.subcategory]) {
        groups[categoryName].subcategories![service.subcategory] = [];
      }
      groups[categoryName].subcategories![service.subcategory].push(service);
    } else {
      groups[categoryName].services.push(service);
    }
  });
  
  return groups;
}
