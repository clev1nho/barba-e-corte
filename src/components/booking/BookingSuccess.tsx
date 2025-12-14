import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Home, Calendar, AlertCircle } from "lucide-react";
import { ShopSettings } from "@/hooks/useShopSettings";
import { ServiceWithCategory } from "@/hooks/useServicesWithCategories";
import { Barber } from "@/hooks/useBarbers";
import { normalizeWhatsAppNumber, buildWhatsAppUrl, openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

interface LegacyBookingData {
  service: ServiceWithCategory | null;
  barber: Barber | null;
  anyBarber: boolean;
  date: string;
  time: string;
  clientName: string;
  clientWhatsapp: string;
}

interface BookingSuccessProps {
  bookingData: LegacyBookingData;
  settings: ShopSettings | null;
  appointmentId?: string;
  onWhatsAppRedirected?: () => void;
  allServices?: ServiceWithCategory[];
  totalPrice?: number;
  totalDuration?: number;
}

export function BookingSuccess({
  bookingData, 
  settings, 
  appointmentId,
  onWhatsAppRedirected,
  allServices,
  totalPrice: propTotalPrice,
  totalDuration: propTotalDuration
}: BookingSuccessProps) {
  const hasRedirected = useRef(false);

  const services = allServices && allServices.length > 0 ? allServices : (bookingData.service ? [bookingData.service] : []);
  const displayPrice = propTotalPrice ?? services.reduce((sum, s) => sum + s.price, 0);

  const formattedDate = bookingData.date
    ? new Date(bookingData.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  const shortDate = bookingData.date
    ? new Date(bookingData.date + "T12:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  // Normalize phone number using the helper
  const normalizedPhone = normalizeWhatsAppNumber(settings?.whatsapp);
  const hasWhatsApp = normalizedPhone !== null;

  const servicesText = services.map(s => s.name).join(", ");
  
  // Build message (NOT encoded yet - the helper will encode it)
  const whatsappMessage = 
    `👤 Nome: ${bookingData.clientName}\n` +
    `✂️ Serviço${services.length > 1 ? 's' : ''}: ${servicesText}\n` +
    `💈 Barbeiro: ${bookingData.barber?.name}\n` +
    `📅 Data: ${shortDate}\n` +
    `⏰ Horário: ${bookingData.time}\n\n` +
    `Para confirmar, envie aqui no WhatsApp a foto do comprovante do sinal.\n` +
    `O valor do sinal será abatido do valor total.`;

  const handleOpenWhatsApp = () => {
    if (!settings?.whatsapp || !settings.whatsapp.trim()) {
      toast.error("WhatsApp não configurado no painel admin.");
      return;
    }
    
    if (!normalizedPhone) {
      toast.error("Número do WhatsApp inválido. Use DDI+DDD+número.");
      return;
    }
    
    const url = buildWhatsAppUrl(normalizedPhone, whatsappMessage);
    openWhatsApp(url);
  };

  useEffect(() => {
    if (!hasRedirected.current && hasWhatsApp && normalizedPhone) {
      hasRedirected.current = true;
      
      const timer = setTimeout(() => {
        onWhatsAppRedirected?.();
        const url = buildWhatsAppUrl(normalizedPhone, whatsappMessage);
        openWhatsApp(url);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [normalizedPhone, hasWhatsApp, whatsappMessage, onWhatsAppRedirected]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
            <CheckCircle className="w-14 h-14 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Agendamento realizado!
        </h1>
        <p className="text-muted-foreground mb-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Seu horário está confirmado
        </p>
        <p className="text-sm text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          Abrindo WhatsApp para confirmação...
        </p>

        <div className="glass-card rounded-2xl p-5 mb-8 text-left animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Data e horário</p>
                <p className="font-semibold capitalize">
                  {formattedDate} às {bookingData.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-primary flex-shrink-0 flex items-center justify-center">
                ✂️
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {services.length > 1 ? "Serviços" : "Serviço"}
                </p>
                {services.map(s => (
                  <p key={s.id} className="font-semibold">{s.name}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-primary flex-shrink-0 flex items-center justify-center">
                💈
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Barbeiro</p>
                <p className="font-semibold">{bookingData.barber?.name}</p>
              </div>
            </div>

            {appointmentId && (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-primary flex-shrink-0 flex items-center justify-center">
                  🔖
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Código</p>
                  <p className="font-semibold font-mono">{appointmentId.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Valor total</p>
              <p className="text-xl font-bold text-primary">
                R$ {displayPrice.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {hasWhatsApp ? (
            <Button 
              variant="default" 
              size="lg" 
              className="w-full"
              onClick={handleOpenWhatsApp}
            >
              <MessageCircle className="w-5 h-5" />
              Confirmar no WhatsApp
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>WhatsApp não configurado no admin.</span>
            </div>
          )}

          <Link to="/">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="w-5 h-5" />
              Voltar para o início
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
