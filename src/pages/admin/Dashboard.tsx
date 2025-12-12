import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAppointments, useUpdateAppointmentStatus, AppointmentStatus } from "@/hooks/useAppointments";
import { Calendar, Clock, User, Scissors } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const statusOptions: AppointmentStatus[] = ["Pendente", "Confirmado", "Concluído", "Cancelado", "Não compareceu"];

const statusColors: Record<AppointmentStatus, string> = {
  Pendente: "bg-yellow-500/20 text-yellow-500",
  Confirmado: "bg-green-500/20 text-green-500",
  Concluído: "bg-blue-500/20 text-blue-500",
  Cancelado: "bg-red-500/20 text-red-500",
  "Não compareceu": "bg-gray-500/20 text-gray-500",
};

const Dashboard = () => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: appointments, isLoading } = useAppointments(selectedDate);
  const updateStatus = useUpdateAppointmentStatus();

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateStatus.mutate({ id, status });
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Date filter */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-primary" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>

        {/* Stats */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Agendamentos do dia</p>
          <p className="text-3xl font-bold text-primary">{appointments?.length || 0}</p>
        </div>

        {/* Appointments list */}
        <div className="space-y-3">
          <h2 className="font-semibold">Agenda</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : appointments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para esta data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments?.map((apt) => (
                <div key={apt.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-bold text-lg">{apt.time}</span>
                    </div>
                    <Select
                      value={apt.status || "Pendente"}
                      onValueChange={(value) => handleStatusChange(apt.id, value as AppointmentStatus)}
                    >
                      <SelectTrigger className={`w-auto h-8 text-xs ${statusColors[apt.status || "Pendente"]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{apt.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-muted-foreground" />
                      <span>{apt.services?.name || "Serviço"}</span>
                    </div>
                    <p className="text-muted-foreground">Barbeiro: {apt.barbers?.name || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
