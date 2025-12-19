import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface HomeCard {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string;
  icon_key: string;
  display_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// Busca todos os cards (para admin - inclui inativos via RLS de owner)
export function useHomeCards() {
  return useQuery({
    queryKey: ["home-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_cards")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HomeCard[];
    },
  });
}

// Busca apenas cards ativos (para público - limitado a 4)
export function useActiveHomeCards() {
  return useQuery({
    queryKey: ["home-cards-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_cards")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data as HomeCard[];
    },
  });
}

export function useCreateHomeCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<HomeCard, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("home_cards")
        .insert(card)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-cards"] });
      queryClient.invalidateQueries({ queryKey: ["home-cards-active"] });
      toast({ title: "Card criado com sucesso" });
    },
    onError: (error) => {
      console.error("Erro ao criar card:", error);
      toast({ title: "Erro ao criar card", variant: "destructive" });
    },
  });
}

export function useUpdateHomeCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HomeCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("home_cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-cards"] });
      queryClient.invalidateQueries({ queryKey: ["home-cards-active"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar card:", error);
      toast({ title: "Erro ao atualizar card", variant: "destructive" });
    },
  });
}

export function useDeleteHomeCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-cards"] });
      queryClient.invalidateQueries({ queryKey: ["home-cards-active"] });
      toast({ title: "Card removido" });
    },
    onError: (error) => {
      console.error("Erro ao remover card:", error);
      toast({ title: "Erro ao remover card", variant: "destructive" });
    },
  });
}
