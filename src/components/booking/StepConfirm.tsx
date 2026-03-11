import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Scissors, User, DollarSign, Loader2, Copy, Check, QrCode, AlertCircle } from "lucide-react";
import { useShopSettings } from "@/hooks/useShopSettings";
import { toast } from "@/hooks/use-toast";
import { ServiceWithCategory } from "@/hooks/useServicesWithCategories";
import { Barber } from "@/hooks/useBarbers";

interface LegacyBookingData {
  service: ServiceWithCategory | null;
  barber: Barber | null;
  anyBarber: boolean;
  date: string;
  time: string;
  clientName: string;
  clientWhatsapp: string;
}

interface StepConfirmProps {
  bookingData: LegacyBookingData;
  allServices?: ServiceWithCategory[];
  totalPrice?: number;
  totalDuration?: number;
  totalDeposit?: number;
  onConfirm: () => void;
  isLoading: boolean;
}

export function StepConfirm({ 
  bookingData, 
  allServices,
  totalPrice: propTotalPrice,
  totalDuration: propTotalDuration,
  totalDeposit: propTotalDeposit,
  onConfirm, 
  isLoading 
}: StepConfirmProps) {
  const { data: settings } = useShopSettings();
  const [paidConfirmed, setPaidConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const services = allServices && allServices.length > 0 ? allServices : (bookingData.service ? [bookingData.service] : []);
  const displayPrice = propTotalPrice ?? services.reduce((sum, s) => sum + s.price, 0);
  const displayDuration = propTotalDuration ?? services.reduce((sum, s) => sum + s.duration_minutes, 0);
  const depositAmount = propTotalDeposit ?? services.reduce((sum, s) => sum + ((s as any).deposit_amount || 0), 0);
  
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

  const confirmDisabled = isLoading || (hasDeposit && pixConfigured && !paidConfirmed);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight">Confirme seu agendamento</h2>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          Revise os dados antes de confirmar
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4 border-primary/8">
        {/* Services */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/10">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {services.length > 1 ? "Serviços" : "Serviço"}
            </p>
            <div className="space-y-1">
              {services.map(s => (
                <p key={s.id} className="font-semibold text-sm">{s.name}</p>
              ))}
            </div>
            {services.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                Tempo total: {displayDuration} min
              </p>
            )}
          </div>
        </div>

        {/* Barber */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Barbeiro</p>
            <p className="font-semibold text-sm">{bookingData.barber?.name}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Data</p>
            <p className="font-semibold capitalize text-sm">{formattedDate}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Horário</p>
            <p className="font-semibold text-sm">{bookingData.time}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/30">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/10">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Valor total</p>
            <p className="text-2xl font-bold text-primary">
              R$ {displayPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      {/* Client info */}
      <div className="glass-card rounded-2xl p-5 border-primary/5">
        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">Cliente</p>
        <p className="font-semibold text-sm">{bookingData.clientName}</p>
        <p className="text-sm text-muted-foreground">
          {bookingData.clientWhatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
        </p>
      </div>

      {/* PIX Deposit Section */}
      {hasDeposit && (
        <div className="glass-card rounded-2xl p-5 border-2 border-primary/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary text-sm">Sinal obrigatório via Pix</h3>
              <p className="text-sm text-muted-foreground">
                Para confirmar este agendamento, é necessário pagar o sinal antes.
              </p>
            </div>
          </div>

          <div className="bg-primary/8 rounded-xl p-4 border border-primary/15">
            <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-medium">Valor do sinal:</p>
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
                  className="flex-1 gap-2 border-primary/20"
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

              <div className="flex items-start gap-3 pt-2 border-t border-border/30">
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
            <div className="flex items-start gap-3 bg-destructive/8 rounded-xl p-4 border border-destructive/15">
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
        variant="gold"
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
