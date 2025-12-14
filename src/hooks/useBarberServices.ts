import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BarberService {
  id: string;
  barber_id: string;
  service_id: string;
  created_at: string | null;
}

export function useBarberServices(barberId?: string) {
  return useQuery({
    queryKey: ["barber_services", barberId],
    queryFn: async () => {
      if (!barberId) return [];
      
      const { data, error } = await supabase
        .from("barber_services")
        .select("*")
        .eq("barber_id", barberId);

      if (error) throw error;
      return data as BarberService[];
    },
    enabled: !!barberId,
  });
}

export function useAllBarberServices() {
  return useQuery({
    queryKey: ["all_barber_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barber_services")
        .select("*");

      if (error) throw error;
      return data as BarberService[];
    },
  });
}

export function useServiceIdsForBarber(barberId?: string) {
  return useQuery({
    queryKey: ["barber_service_ids", barberId],
    queryFn: async () => {
      if (!barberId) return [];
      
      const { data, error } = await supabase
        .from("barber_services")
        .select("service_id")
        .eq("barber_id", barberId);

      if (error) throw error;
      return data.map(d => d.service_id);
    },
    enabled: !!barberId,
  });
}

export function useUpdateBarberServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ barberId, serviceIds }: { barberId: string; serviceIds: string[] }) => {
      // First delete all existing
      const { error: deleteError } = await supabase
        .from("barber_services")
        .delete()
        .eq("barber_id", barberId);

      if (deleteError) throw deleteError;

      // Then insert new ones
      if (serviceIds.length > 0) {
        const { error: insertError } = await supabase
          .from("barber_services")
          .insert(serviceIds.map(service_id => ({ barber_id: barberId, service_id })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["barber_services", variables.barberId] });
      queryClient.invalidateQueries({ queryKey: ["barber_service_ids", variables.barberId] });
      queryClient.invalidateQueries({ queryKey: ["all_barber_services"] });
    },
  });
}
