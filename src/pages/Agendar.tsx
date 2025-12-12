import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepService } from "@/components/booking/StepService";
import { StepBarber } from "@/components/booking/StepBarber";
import { StepDate } from "@/components/booking/StepDate";
import { StepTime } from "@/components/booking/StepTime";
import { StepClientInfo } from "@/components/booking/StepClientInfo";
import { StepConfirm } from "@/components/booking/StepConfirm";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { useServices, Service } from "@/hooks/useServices";
import { useBarbers, Barber } from "@/hooks/useBarbers";
import { useShopSettings } from "@/hooks/useShopSettings";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";

export interface BookingData {
  service: Service | null;
  barber: Barber | null;
  anyBarber: boolean;
  date: string;
  time: string;
  clientName: string;
  clientWhatsapp: string;
}

const initialData: BookingData = {
  service: null,
  barber: null,
  anyBarber: false,
  date: "",
  time: "",
  clientName: "",
  clientWhatsapp: "",
};

const Agendar = () => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialData);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const { data: services, isLoading: loadingServices } = useServices();
  const { data: barbers, isLoading: loadingBarbers } = useBarbers();
  const { data: settings } = useShopSettings();
  const createAppointment = useCreateAppointment();

  const totalSteps = 6;

  const updateData = (updates: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    if (!bookingData.service || !bookingData.barber) return;

    try {
      const result = await createAppointment.mutateAsync({
        service_id: bookingData.service.id,
        barber_id: bookingData.barber.id,
        date: bookingData.date,
        time: bookingData.time,
        duration_minutes: bookingData.service.duration_minutes,
        client_name: bookingData.clientName,
        client_whatsapp: bookingData.clientWhatsapp,
      });
      
      // Store the appointment ID for display and tracking
      if (result?.appointmentId) {
        setAppointmentId(result.appointmentId);
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    }
  };

  // Track when WhatsApp redirect happens
  const handleWhatsAppRedirected = async () => {
    if (appointmentId) {
      try {
        // Update the appointment to track WhatsApp redirect
        await supabase
          .from("appointments")
          .update({ whatsapp_redirected_at: new Date().toISOString() })
          .eq("id", appointmentId);
      } catch (error) {
        console.error("Erro ao registrar redirecionamento WhatsApp:", error);
      }
    }
  };

  if (isSuccess) {
    return (
      <BookingSuccess
        bookingData={bookingData}
        settings={settings ?? null}
        appointmentId={appointmentId ?? undefined}
        onWhatsAppRedirected={handleWhatsAppRedirected}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          {step === 1 ? (
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="icon" onClick={prevStep}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="font-semibold">Agendar horário</h1>
            <p className="text-xs text-muted-foreground">
              Passo {step} de {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {step === 1 && (
          <StepService
            services={services ?? []}
            isLoading={loadingServices}
            selected={bookingData.service}
            onSelect={(service) => {
              updateData({ service });
              nextStep();
            }}
          />
        )}

        {step === 2 && (
          <StepBarber
            barbers={barbers ?? []}
            isLoading={loadingBarbers}
            selected={bookingData.barber}
            anyBarber={bookingData.anyBarber}
            onSelect={(barber, anyBarber) => {
              updateData({ barber, anyBarber });
              nextStep();
            }}
          />
        )}

        {step === 3 && (
          <StepDate
            settings={settings ?? null}
            barbers={barbers ?? []}
            selectedBarber={bookingData.barber}
            anyBarber={bookingData.anyBarber}
            selected={bookingData.date}
            onSelect={(date) => {
              updateData({ date, time: "" });
              nextStep();
            }}
          />
        )}

        {step === 4 && (
          <StepTime
            settings={settings ?? null}
            barbers={barbers ?? []}
            selectedBarber={bookingData.barber}
            anyBarber={bookingData.anyBarber}
            selectedDate={bookingData.date}
            service={bookingData.service}
            selected={bookingData.time}
            onSelect={(time, barber) => {
              updateData({ time, barber: barber || bookingData.barber });
              nextStep();
            }}
          />
        )}

        {step === 5 && (
          <StepClientInfo
            clientName={bookingData.clientName}
            clientWhatsapp={bookingData.clientWhatsapp}
            onSubmit={(clientName, clientWhatsapp) => {
              updateData({ clientName, clientWhatsapp });
              nextStep();
            }}
          />
        )}

        {step === 6 && (
          <StepConfirm
            bookingData={bookingData}
            onConfirm={handleConfirm}
            isLoading={createAppointment.isPending}
          />
        )}
      </div>
    </main>
  );
};

export default Agendar;
