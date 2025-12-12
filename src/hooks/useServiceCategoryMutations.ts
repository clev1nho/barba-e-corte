import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdateCategoryData {
  id: string;
  name?: string;
  display_order?: number;
  icon_image_url?: string | null;
  home_enabled?: boolean;
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCategoryData) => {
      const { data: result, error } = await supabase
        .from("service_categories")
        .update(data)
        .eq("id", id)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
    },
  });
}

interface CreateCategoryData {
  name: string;
  display_order?: number;
  icon_image_url?: string | null;
  home_enabled?: boolean;
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const { data: result, error } = await supabase
        .from("service_categories")
        .insert(data)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
    },
  });
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
    },
  });
}
