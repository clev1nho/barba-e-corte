import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseAppointmentsRealtimeOptions {
  selectedDate: string; // formato yyyy-MM-dd
  enabled?: boolean;
}

export const useAppointmentsRealtime = ({ 
  selectedDate, 
  enabled = true 
}: UseAppointmentsRealtimeOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      // Verificar se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Realtime: usuário não autenticado, ignorando subscribe");
        return;
      }

      console.log("Realtime: criando subscribe para appointments");

      channel = supabase
        .channel('appointments-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments'
          },
          async (payload) => {
            console.log("Realtime: novo agendamento recebido", payload);
            const newAppointment = payload.new as {
              id: string;
              date: string;
              time: string;
              client_name: string;
            };

            // Buscar nome do serviço para notificação
            let serviceName = "Serviço";
            try {
              const { data: apt } = await supabase
                .from("appointments")
                .select("services:service_id(name)")
                .eq("id", newAppointment.id)
                .single();
              if (apt?.services?.name) {
                serviceName = apt.services.name;
              }
            } catch {
              // Ignora erro, usa nome padrão
            }

            // Se o agendamento é para a data selecionada, refetch
            if (newAppointment.date === selectedDate) {
              queryClient.invalidateQueries({ queryKey: ["appointments"] });
            }

            // Notificar sempre (dados não sensíveis)
            toast({
              title: "Novo agendamento!",
              description: `${newAppointment.client_name} - ${newAppointment.time} - ${serviceName}`,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments'
          },
          (payload) => {
            console.log("Realtime: agendamento atualizado", payload);
            // Sempre invalida cache para refletir mudança de status
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
          }
        )
        .subscribe((status) => {
          console.log("Realtime: status do subscribe:", status);
        });
    };

    setupRealtime();

    // Cleanup: remover channel ao desmontar
    return () => {
      if (channel) {
        console.log("Realtime: removendo subscribe");
        supabase.removeChannel(channel);
      }
    };
  }, [selectedDate, enabled, queryClient]);
};
