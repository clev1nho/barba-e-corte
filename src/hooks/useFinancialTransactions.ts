import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TransactionType = "receita" | "despesa";

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: number;
  payment_method: string | null;
  date: string;
  appointment_id: string | null;
  barber_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  barbers?: { name: string } | null;
}

export interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  lucro: number;
  atendimentosPagos: number;
}

export function useFinancialTransactions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["financial_transactions", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("financial_transactions")
        .select(`
          *,
          barbers(name)
        `)
        .order("date", { ascending: false });

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FinancialTransaction[];
    },
  });
}

export function useFinancialSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["financial_summary", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("financial_transactions")
        .select("type, amount, appointment_id");

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const summary: FinancialSummary = {
        totalReceitas: 0,
        totalDespesas: 0,
        lucro: 0,
        atendimentosPagos: 0,
      };

      data?.forEach((transaction) => {
        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "receita") {
          summary.totalReceitas += amount;
          if (transaction.appointment_id) {
            summary.atendimentosPagos += 1;
          }
        } else {
          summary.totalDespesas += amount;
        }
      });

      summary.lucro = summary.totalReceitas - summary.totalDespesas;

      return summary;
    },
  });
}

export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: {
      type: TransactionType;
      category: string;
      description?: string;
      amount: number;
      payment_method?: string;
      date: string;
      appointment_id?: string;
      barber_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financial_summary"] });
    },
  });
}

export function useUpdateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      type?: TransactionType;
      category?: string;
      description?: string;
      amount?: number;
      payment_method?: string;
      date?: string;
      barber_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financial_summary"] });
    },
  });
}

export function useDeleteFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financial_summary"] });
    },
  });
}

export function useCheckTransactionExists(appointmentId: string | null) {
  return useQuery({
    queryKey: ["financial_transaction_exists", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return false;
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("id")
        .eq("appointment_id", appointmentId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!appointmentId,
  });
}
