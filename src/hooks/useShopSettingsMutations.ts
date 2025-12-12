import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkingHours } from "./useShopSettings";
import { Json } from "@/integrations/supabase/types";

interface UpdateShopSettingsData {
  id?: string;
  name: string;
  subtitle?: string;
  whatsapp?: string;
  address?: string;
  open_time?: string;
  close_time?: string;
  allow_same_day?: boolean;
  slot_interval_minutes?: number;
  highlight_points?: string[];
  working_hours?: WorkingHours;
}

function workingHoursToJson(wh: WorkingHours | undefined): Json | undefined {
  if (!wh) return undefined;
  return wh as unknown as Json;
}

export function useUpdateShopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, working_hours, ...rest }: UpdateShopSettingsData) => {
      const data = {
        ...rest,
        working_hours: workingHoursToJson(working_hours),
      };
      
      if (id) {
        // Update existing record
        const { error } = await supabase
          .from("shop_settings")
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        // Insert new record (upsert logic)
        const { error } = await supabase
          .from("shop_settings")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop_settings"] });
    },
  });
}
