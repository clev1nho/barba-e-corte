import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceCategory {
  id: string;
  name: string;
  display_order: number | null;
  home_enabled: boolean | null;
  icon_image_url: string | null;
}

export function useServiceCategories(activeOnly = false) {
  return useQuery({
    queryKey: ["service_categories", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("service_categories")
        .select("*")
        .order("display_order", { ascending: true, nullsFirst: false });

      if (activeOnly) {
        query = query.eq("home_enabled", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ServiceCategory[];
    },
  });
}
