import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateBarberData {
  name: string;
  bio?: string;
  photo_url?: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  active: boolean;
}

interface UpdateBarberData extends CreateBarberData {
  id: string;
}

export function useCreateBarber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBarberData) => {
      console.log("Creating barber with data:", data);
      const { data: result, error } = await supabase.from("barbers").insert([data]).select();
      if (error) {
        console.error("Error creating barber:", error);
        throw error;
      }
      console.log("Barber created successfully:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
  });
}

export function useUpdateBarber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBarberData) => {
      console.log("Updating barber:", id, data);
      const { data: result, error } = await supabase.from("barbers").update(data).eq("id", id).select();
      if (error) {
        console.error("Error updating barber:", error);
        throw error;
      }
      console.log("Barber updated successfully:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
  });
}

export function useDeleteBarber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("barbers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
  });
}
