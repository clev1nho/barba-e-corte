import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Scissors, User, DollarSign, Loader2, Copy, Check, QrCode, AlertCircle } from "lucide-react";
import { BookingData } from "@/pages/Agendar";
import { useShopSettings } from "@/hooks/useShopSettings";
import { toast } from "@/hooks/use-toast";

interface StepConfirmProps {
  bookingData: BookingData;
  onConfirm: () => void;
  isLoading: boolean;
}

export function StepConfirm({ bookingData, onConfirm, isLoading }: StepConfirmProps) {
  const { data: settings } = useShopSettings();
  const [paidConfirmed, setPaidConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const depositAmount = (bookingData.service as any)?.deposit_amount ?? 0;
  const hasDeposit = depositAmount > 0;
  const pixConfigured = !!settings?.pix_key_or_link;

  const formattedDate = bookingData.date
    ? new Date(bookingData.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const handleCopyPix = async () => {
    if (!settings?.pix_key_or_link) return;
    try {
      await navigator.clipboard.writeText(settings.pix_key_or_link);
      setCopied(true);
      toast({ title: "Pix copiado!" });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  // Button disabled if deposit required but not confirmed paid
  const confirmDisabled = isLoading || (hasDeposit && pixConfigured && !paidConfirmed);

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

      {/* PIX Deposit Section */}
      {hasDeposit && (
        <div className="glass-card rounded-2xl p-5 border-2 border-primary/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">Sinal obrigatório via Pix</h3>
              <p className="text-sm text-muted-foreground">
                Para confirmar este agendamento, é necessário pagar o sinal antes.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Valor do sinal:</p>
            <p className="text-2xl font-bold text-primary">
              R$ {depositAmount.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {pixConfigured ? (
            <>
              {settings?.pix_message && (
                <p className="text-sm">{settings.pix_message}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleCopyPix}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Pix
                    </>
                  )}
                </Button>
              </div>

              {settings?.pix_note && (
                <p className="text-xs text-muted-foreground">{settings.pix_note}</p>
              )}

              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <Checkbox
                  id="paidConfirmed"
                  checked={paidConfirmed}
                  onCheckedChange={(checked) => setPaidConfirmed(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="paidConfirmed" className="text-sm cursor-pointer">
                  Já paguei o sinal e quero confirmar meu agendamento
                </label>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 bg-destructive/10 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Pix ainda não configurado</p>
                <p className="text-xs text-muted-foreground">
                  Fale com a barbearia no WhatsApp para combinar o pagamento do sinal.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={onConfirm}
        disabled={confirmDisabled}
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