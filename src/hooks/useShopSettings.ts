import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface DaySchedule {
  open: string | null;
  close: string | null;
  closed: boolean;
}

export interface WorkingHours {
  segunda: DaySchedule;
  terça: DaySchedule;
  quarta: DaySchedule;
  quinta: DaySchedule;
  sexta: DaySchedule;
  sábado: DaySchedule;
  domingo: DaySchedule;
}

export interface ShopSettings {
  id: string;
  name: string;
  subtitle: string | null;
  whatsapp: string | null;
  address: string | null;
  open_time: string | null;
  close_time: string | null;
  allow_same_day: boolean | null;
  slot_interval_minutes: number | null;
  highlight_points: string[] | null;
  working_hours: WorkingHours | null;
  logo_url: string | null;
  hero_secondary_text: string | null;
  about_description: string | null;
  services_section_title: string | null;
  services_section_subtitle: string | null;
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
  segunda: { open: "09:00", close: "19:00", closed: false },
  terça: { open: "09:00", close: "19:00", closed: false },
  quarta: { open: "09:00", close: "19:00", closed: false },
  quinta: { open: "09:00", close: "19:00", closed: false },
  sexta: { open: "09:00", close: "19:00", closed: false },
  sábado: { open: "09:00", close: "18:00", closed: false },
  domingo: { open: null, close: null, closed: true },
};

function parseWorkingHours(json: Json | null): WorkingHours | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return null;
  }
  
  const obj = json as Record<string, unknown>;
  const days = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"] as const;
  
  const result: Partial<WorkingHours> = {};
  for (const day of days) {
    const dayData = obj[day];
    if (dayData && typeof dayData === "object" && !Array.isArray(dayData)) {
      const d = dayData as Record<string, unknown>;
      result[day] = {
        open: typeof d.open === "string" ? d.open : null,
        close: typeof d.close === "string" ? d.close : null,
        closed: typeof d.closed === "boolean" ? d.closed : false,
      };
    } else {
      result[day] = DEFAULT_WORKING_HOURS[day];
    }
  }
  
  return result as WorkingHours;
}

export function useShopSettings() {
  return useQuery({
    queryKey: ["shop_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const workingHours = parseWorkingHours(data.working_hours);
        return {
          id: data.id,
          name: data.name,
          subtitle: data.subtitle,
          whatsapp: data.whatsapp,
          address: data.address,
          open_time: data.open_time,
          close_time: data.close_time,
          allow_same_day: data.allow_same_day,
          slot_interval_minutes: data.slot_interval_minutes,
          highlight_points: data.highlight_points,
          working_hours: workingHours || DEFAULT_WORKING_HOURS,
          logo_url: data.logo_url,
          hero_secondary_text: data.hero_secondary_text,
          about_description: data.about_description,
          services_section_title: (data as any).services_section_title ?? null,
          services_section_subtitle: (data as any).services_section_subtitle ?? null,
        } as ShopSettings;
      }
      
      return null;
    },
  });
}

export { DEFAULT_WORKING_HOURS };
