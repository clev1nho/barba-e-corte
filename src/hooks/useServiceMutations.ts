import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateServiceData {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  deposit_amount?: number;
  active: boolean;
  category_id?: string | null;
}

interface UpdateServiceData extends CreateServiceData {
  id: string;
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceData) => {
      const { error } = await supabase.from("services").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services_with_categories"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateServiceData) => {
      const { error } = await supabase.from("services").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services_with_categories"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services_with_categories"] });
    },
  });
}
