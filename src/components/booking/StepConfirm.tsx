import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, User, DollarSign, Loader2 } from "lucide-react";
import { BookingData } from "@/pages/Agendar";

interface StepConfirmProps {
  bookingData: BookingData;
  onConfirm: () => void;
  isLoading: boolean;
}

export function StepConfirm({ bookingData, onConfirm, isLoading }: StepConfirmProps) {
  const formattedDate = bookingData.date
    ? new Date(bookingData.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Confirme seu agendamento</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revise os dados antes de confirmar
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        {/* Service */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Serviço</p>
            <p className="font-semibold">{bookingData.service?.name}</p>
          </div>
        </div>

        {/* Barber */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Barbeiro</p>
            <p className="font-semibold">{bookingData.barber?.name}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-semibold capitalize">{formattedDate}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Horário</p>
            <p className="font-semibold">{bookingData.time}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="text-xl font-bold text-primary">
              R$ {bookingData.service?.price.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      {/* Client info */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-muted-foreground mb-2">Cliente</p>
        <p className="font-semibold">{bookingData.clientName}</p>
        <p className="text-sm text-muted-foreground">
          {bookingData.clientWhatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
        </p>
      </div>

      <Button
        onClick={onConfirm}
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirmando...
          </>
        ) : (
          "Confirmar agendamento"
        )}
      </Button>
    </div>
  );
}
