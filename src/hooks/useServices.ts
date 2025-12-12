import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean | null;
}

export function useServices(activeOnly = true) {
  return useQuery({
    queryKey: ["services", activeOnly],
    queryFn: async () => {
      let query = supabase.from("services").select("*");
      
      if (activeOnly) {
        query = query.eq("active", true);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data as Service[];
    },
  });
}
