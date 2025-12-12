import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Barber {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  active: boolean | null;
  days_of_week: string[] | null;
  start_time: string | null;
  end_time: string | null;
}

export function useBarbers(activeOnly = true) {
  return useQuery({
    queryKey: ["barbers", activeOnly],
    queryFn: async () => {
      let query = supabase.from("barbers").select("*");
      
      if (activeOnly) {
        query = query.eq("active", true);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data as Barber[];
    },
  });
}
