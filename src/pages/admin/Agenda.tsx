import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAppointments, useUpdateAppointmentStatus, useDeleteAppointment, AppointmentStatus, Appointment } from "@/hooks/useAppointments";
import { useCreateFinancialTransaction } from "@/hooks/useFinancialTransactions";
import { useBarbers } from "@/hooks/useBarbers";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, Scissors, Phone, Trash2, ChevronLeft, ChevronRight, DollarSign, Users, X, Mail, Cake, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const STORAGE_KEY = "agenda_selected_barber";

const statusOptions: AppointmentStatus[] = ["Pendente", "Confirmado", "Concluído", "Cancelado", "Não compareceu"];

const statusColors: Record<AppointmentStatus, string> = {
  Pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Confirmado: "bg-green-500/20 text-green-400 border-green-500/30",
  Concluído: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Cancelado: "bg-red-500/20 text-red-400 border-red-500/30",
  "Não compareceu": "bg-muted text-muted-foreground border-muted",
};

const paymentMethodOptions = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "outro", label: "Outro" },
];

const Agenda = () => {
  const { isStaff, isAdminOrOwner, hasAdminAccess, loading: authLoading } = useAdminAuth();
  const { data: barbers, isLoading: barbersLoading } = useBarbers(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("pix");
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<string | null>(null);
  
  // Initialize barber selection from localStorage for both owner and staff
  useEffect(() => {
    if (authLoading || barbersLoading) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && barbers?.some(b => b.id === saved)) {
      setSelectedBarberId(saved);
    }
  }, [authLoading, barbersLoading, barbers]);

  // Save selection to localStorage for both owner and staff
  useEffect(() => {
    if (hasAdminAccess && selectedBarberId) {
      localStorage.setItem(STORAGE_KEY, selectedBarberId);
    }
  }, [hasAdminAccess, selectedBarberId]);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { data: appointments, isLoading } = useAppointments(dateString, selectedBarberId || undefined);
  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppointment = useDeleteAppointment();
  const createFinancialTransaction = useCreateFinancialTransaction();

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarberId(barberId);
  };

  const handleClearSelection = () => {
    setSelectedBarberId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    if (newStatus === "Concluído") {
      const { data: existingTransaction } = await supabase
        .from("financial_transactions")
        .select("id")
        .eq("appointment_id", appointment.id)
        .maybeSingle();

      if (existingTransaction) {
        updateStatus.mutate({ id: appointment.id, status: newStatus });
        return;
      }

      setPendingAppointment(appointment);
      setPaymentDialogOpen(true);
      return;
    }

    updateStatus.mutate({ id: appointment.id, status: newStatus });
  };

  const handleConfirmPayment = async () => {
    if (!pendingAppointment) return;

    try {
      await updateStatus.mutateAsync({ id: pendingAppointment.id, status: "Concluído" });

      const serviceName = pendingAppointment.services?.name || "Serviço";
      const servicePrice = pendingAppointment.services?.price || 0;

      await createFinancialTransaction.mutateAsync({
        type: "receita",
        category: "Serviço",
        description: `Serviço: ${serviceName}`,
        amount: servicePrice,
        payment_method: selectedPaymentMethod,
        date: `${pendingAppointment.date}T${pendingAppointment.time}:00`,
        appointment_id: pendingAppointment.id,
        barber_id: pendingAppointment.barber_id || undefined,
      });

      toast({ title: "Atendimento concluído e receita registrada" });
    } catch (error) {
      toast({ title: "Erro ao registrar receita", variant: "destructive" });
    } finally {
      setPaymentDialogOpen(false);
      setPendingAppointment(null);
      setSelectedPaymentMethod("pix");
    }
  };

  const handleDelete = (id: string) => {
    deleteAppointment.mutate(id, {
      onSuccess: () => {
        toast({ title: "Agendamento excluído com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir agendamento", variant: "destructive" });
      },
    });
  };

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  const selectedBarber = barbers?.find(b => b.id === selectedBarberId);

  return (
    <AdminLayout title="Agenda">
      <div className="space-y-6">
        {/* Barber Filter - For both Owner and Staff */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Filtrar por barbeiro</h3>
          </div>

          {barbersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !barbers || barbers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum barbeiro cadastrado. Cadastre um barbeiro primeiro.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <Select
                value={selectedBarberId || ""}
                onValueChange={handleBarberSelect}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name} {!barber.active && "(Inativo)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedBarberId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSelection}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* No barber selected state */}
        {!selectedBarberId && (
          <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">Selecione um barbeiro</p>
            <p className="text-sm">Escolha um barbeiro acima para ver a agenda</p>
          </div>
        )}

        {/* Main Content - Only show when barber is selected */}
        {selectedBarberId && (
          <>
            {/* Date Navigation */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="text-center">
                  <p className="text-lg font-semibold capitalize">
                    {format(selectedDate, "EEEE", { locale: ptBR })}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>

                <Button variant="ghost" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoje
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{appointments?.length || 0}</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-green-400">
                  {appointments?.filter(a => a.status === "Confirmado").length || 0}
                </p>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Agendamentos
              </h2>

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
                <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento para esta data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments?.map((apt) => (
                    <div key={apt.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="font-bold text-xl">{apt.time}</span>
                        </div>
                        {isAdminOrOwner ? (
                          <Select
                            value={apt.status || "Pendente"}
                            onValueChange={(value) => handleStatusChange(apt, value as AppointmentStatus)}
                          >
                            <SelectTrigger className={`w-auto h-8 text-xs border ${statusColors[apt.status || "Pendente"]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded border ${statusColors[apt.status || "Pendente"]}`}>
                            {apt.status || "Pendente"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{apt.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-muted-foreground" />
                          <span>{apt.services?.name || "Serviço"}</span>
                        </div>
                        
                        {/* Owner-only: Full client details in expandable section */}
                        {isAdminOrOwner && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <button
                              onClick={() => setExpandedAppointmentId(
                                expandedAppointmentId === apt.id ? null : apt.id
                              )}
                              className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              {expandedAppointmentId === apt.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              Ver dados do cliente
                            </button>
                            
                            {expandedAppointmentId === apt.id && (
                              <div className="mt-3 space-y-2 bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{apt.client_whatsapp || "Não informado"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span>{apt.client_email || "Não informado"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Cake className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {apt.client_birth_date 
                                      ? new Date(apt.client_birth_date).toLocaleDateString("pt-BR")
                                      : "Não informado"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                  <span>{apt.referral_source || "Não informado"}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end mt-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O agendamento de {apt.client_name} será permanentemente excluído.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(apt.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Registrar pagamento
            </DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento para concluir o atendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pendingAppointment && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="font-medium">{pendingAppointment.client_name}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingAppointment.services?.name}
                </p>
                <p className="text-lg font-bold text-green-400">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(pendingAppointment.services?.price || 0)}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="paymentMethod">Forma de pagamento</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger id="paymentMethod" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPaymentDialogOpen(false);
                  setPendingAppointment(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmPayment}
                disabled={createFinancialTransaction.isPending}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Agenda;