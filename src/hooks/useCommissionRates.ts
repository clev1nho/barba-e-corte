import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommissionRate {
  id: string;
  barber_id: string;
  category_id: string;
  commission_percent: number;
  created_at: string;
}

export function useCommissionRates() {
  return useQuery({
    queryKey: ["barber_commission_rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barber_commission_rates")
        .select("*");

      if (error) throw error;
      return data as CommissionRate[];
    },
  });
}

export function useUpsertCommissionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      barber_id,
      category_id,
      commission_percent,
    }: {
      barber_id: string;
      category_id: string;
      commission_percent: number;
    }) => {
      const { data, error } = await supabase
        .from("barber_commission_rates")
        .upsert(
          { barber_id, category_id, commission_percent },
          { onConflict: "barber_id,category_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barber_commission_rates"] });
      queryClient.invalidateQueries({ queryKey: ["barber_commissions_calculated"] });
    },
  });
}
