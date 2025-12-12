import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Home, Calendar } from "lucide-react";
import { BookingData } from "@/pages/Agendar";
import { ShopSettings } from "@/hooks/useShopSettings";

interface BookingSuccessProps {
  bookingData: BookingData;
  settings: ShopSettings | null;
  appointmentId?: string;
  onWhatsAppRedirected?: () => void;
}

// Fixed WhatsApp number for the barbershop
const WHATSAPP_NUMBER = "5531985145431";

export function BookingSuccess({ 
  bookingData, 
  settings, 
  appointmentId,
  onWhatsAppRedirected 
}: BookingSuccessProps) {
  const hasRedirected = useRef(false);

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

  const whatsappMessage = encodeURIComponent(
    `Olá, acabei de fazer um agendamento pelo aplicativo.\n\n` +
    `👤 Nome: ${bookingData.clientName}\n` +
    `✂️ Serviço: ${bookingData.service?.name}\n` +
    `💈 Barbeiro: ${bookingData.barber?.name}\n` +
    `📅 Data: ${shortDate}\n` +
    `🕐 Horário: ${bookingData.time}\n` +
    (appointmentId ? `🔖 Código: ${appointmentId.slice(0, 8).toUpperCase()}\n` : "") +
    `\nPoderia confirmar pra mim, por favor?`
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  // Auto-redirect to WhatsApp after success
  useEffect(() => {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      
      // Small delay to show success screen before redirect
      const timer = setTimeout(() => {
        onWhatsAppRedirected?.();
        window.open(whatsappLink, "_blank");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [whatsappLink, onWhatsAppRedirected]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
            <CheckCircle className="w-14 h-14 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Agendamento realizado!
        </h1>
        <p className="text-muted-foreground mb-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Seu horário está confirmado
        </p>
        <p className="text-sm text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          Abrindo WhatsApp para confirmação...
        </p>

        {/* Summary card */}
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

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-primary flex-shrink-0 flex items-center justify-center">
                ✂️
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serviço</p>
                <p className="font-semibold">{bookingData.service?.name}</p>
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
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-xl font-bold text-primary">
                R$ {bookingData.service?.price.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="default" size="lg" className="w-full">
              <MessageCircle className="w-5 h-5" />
              Confirmar no WhatsApp
            </Button>
          </a>

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
