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
  logo_url?: string;
  hero_secondary_text?: string | null;
  about_description?: string | null;
  services_section_title?: string | null;
  services_section_subtitle?: string | null;
  pix_key_or_link?: string | null;
  pix_message?: string | null;
  pix_note?: string | null;
  maps_link?: string | null;
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
      
      console.log("Saving shop settings:", { id, data });
      
      if (id) {
        // Update existing record
        const { data: result, error } = await supabase
          .from("shop_settings")
          .update(data)
          .eq("id", id)
          .select();
        if (error) {
          console.error("Error updating shop settings:", error);
          throw error;
        }
        console.log("Shop settings updated:", result);
        return result;
      } else {
        // Insert new record (upsert logic)
        const { data: result, error } = await supabase
          .from("shop_settings")
          .insert(data)
          .select();
        if (error) {
          console.error("Error inserting shop settings:", error);
          throw error;
        }
        console.log("Shop settings inserted:", result);
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop_settings"] });
    },
  });
}
