import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppointmentStatus = 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado' | 'Não compareceu';

export interface Appointment {
  id: string;
  service_id: string | null;
  barber_id: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  client_name: string;
  client_whatsapp: string;
  status: AppointmentStatus | null;
  notes: string | null;
  created_at: string | null;
  services?: { name: string; price: number } | null;
  barbers?: { name: string } | null;
}

// Dashboard: fetch all appointments for a date (no barber filter)
export function useDashboardAppointments(date?: string) {
  return useQuery({
    queryKey: ["dashboard-appointments", date],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          services(name, price),
          barbers(name)
        `)
        .order("time", { ascending: true });

      if (date) {
        query = query.eq("date", date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
  });
}

// Agenda: fetch appointments filtered by barber (requires barberId)
export function useAppointments(date?: string, barberId?: string) {
  return useQuery({
    queryKey: ["appointments", date, barberId],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          services(name, price),
          barbers(name)
        `)
        .order("time", { ascending: true });

      if (date) {
        query = query.eq("date", date);
      }

      if (barberId) {
        query = query.eq("barber_id", barberId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!barberId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      service_id: string;
      barber_id: string;
      date: string;
      time: string;
      duration_minutes: number;
      client_name: string;
      client_whatsapp: string;
      honeypot?: string; // Hidden field for bot detection
    }) => {
      // Use the rate-limited edge function instead of direct insert
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: appointment
      });

      if (error) {
        throw new Error(error.message || "Erro ao criar agendamento");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status?: AppointmentStatus; notes?: string }) => {
      const updates: Record<string, unknown> = {};
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
