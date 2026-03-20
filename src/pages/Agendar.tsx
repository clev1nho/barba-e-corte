import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepServiceMulti } from "@/components/booking/StepServiceMulti";
import { StepBarber } from "@/components/booking/StepBarber";
import { StepDate } from "@/components/booking/StepDate";
import { StepTime } from "@/components/booking/StepTime";
import { StepClientInfoExpanded } from "@/components/booking/StepClientInfoExpanded";
import { StepConfirm } from "@/components/booking/StepConfirm";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { ServiceWithCategory } from "@/hooks/useServicesWithCategories";
import { useBarbers, Barber } from "@/hooks/useBarbers";
import { useShopSettings } from "@/hooks/useShopSettings";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/i18n/LanguageSelector";

export interface BookingData {
  services: ServiceWithCategory[];
  barber: Barber | null;
  anyBarber: boolean;
  date: string;
  time: string;
  clientName: string;
  clientWhatsapp: string;
  clientEmail: string;
  clientBirthDate: string;
  referralSource: string;
  totalDuration: number;
  totalPrice: number;
  totalDeposit: number;
}

const initialData: BookingData = {
  services: [],
  barber: null,
  anyBarber: false,
  date: "",
  time: "",
  clientName: "",
  clientWhatsapp: "",
  clientEmail: "",
  clientBirthDate: "",
  referralSource: "",
  totalDuration: 0,
  totalPrice: 0,
  totalDeposit: 0,
};

const Agendar = () => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialData);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const { data: barbers, isLoading: loadingBarbers } = useBarbers();
  const { data: settings } = useShopSettings();
  const createAppointment = useCreateAppointment();
  const { t } = useLanguage();

  const totalSteps = 6;

  const updateData = (updates: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    if (bookingData.services.length === 0 || !bookingData.barber) return;

    try {
      const result = await createAppointment.mutateAsync({
        service_id: bookingData.services[0].id,
        service_ids: bookingData.services.map(s => s.id),
        barber_id: bookingData.barber.id,
        date: bookingData.date,
        time: bookingData.time,
        duration_minutes: bookingData.totalDuration,
        client_name: bookingData.clientName,
        client_whatsapp: bookingData.clientWhatsapp,
        client_email: bookingData.clientEmail,
        client_birth_date: bookingData.clientBirthDate,
        referral_source: bookingData.referralSource,
        total_price: bookingData.totalPrice,
        total_deposit: bookingData.totalDeposit,
      });
      
      if (result?.appointmentId) {
        setAppointmentId(result.appointmentId);
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    }
  };

  const handleWhatsAppRedirected = async () => {
    if (appointmentId) {
      try {
        await supabase
          .from("appointments")
          .update({ whatsapp_redirected_at: new Date().toISOString() })
          .eq("id", appointmentId);
      } catch (error) {
        console.error("Erro ao registrar redirecionamento WhatsApp:", error);
      }
    }
  };

  const legacyBookingData = {
    service: bookingData.services[0] || null,
    barber: bookingData.barber,
    anyBarber: bookingData.anyBarber,
    date: bookingData.date,
    time: bookingData.time,
    clientName: bookingData.clientName,
    clientWhatsapp: bookingData.clientWhatsapp,
  };

  if (isSuccess) {
    return (
      <BookingSuccess
        bookingData={legacyBookingData}
        settings={settings ?? null}
        appointmentId={appointmentId ?? undefined}
        onWhatsAppRedirected={handleWhatsAppRedirected}
        allServices={bookingData.services}
        totalPrice={bookingData.totalPrice}
        totalDuration={bookingData.totalDuration}
      />
    );
  }

  const STEP_LABELS = t.booking_step_labels;

  return (
    <main className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          {step === 1 ? (
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="font-semibold font-display text-lg tracking-tight">{t.booking_title}</h1>
            <p className="text-xs text-muted-foreground">
              {t.booking_step_of.replace("{step}", String(step)).replace("{total}", String(totalSteps))}
            </p>
          </div>
          <LanguageSelector />
        </div>

        {/* Premium step indicators */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isCompleted = stepNum < step;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`h-1 w-full rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-primary" : isActive ? "bg-primary/70" : "bg-muted"
                    }`}
                  />
                  <span className={`text-[9px] font-medium transition-colors ${
                    isActive ? "text-primary" : isCompleted ? "text-foreground/60" : "text-muted-foreground/50"
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {step === 1 && (
          <StepBarber
            barbers={barbers ?? []}
            isLoading={loadingBarbers}
            selected={bookingData.barber}
            anyBarber={bookingData.anyBarber}
            onSelect={(barber, anyBarber) => {
              updateData({ barber, anyBarber, services: [] });
              nextStep();
            }}
          />
        )}

        {step === 2 && (
          <StepServiceMulti
            selectedServices={bookingData.services}
            barberId={bookingData.barber?.id}
            onSelect={(services) => {
              const totalDuration = services.reduce((sum, s) => sum + s.duration_minutes, 0);
              const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
              const totalDeposit = services.reduce((sum, s) => sum + (s.deposit_amount || 0), 0);
              updateData({ services, totalDuration, totalPrice, totalDeposit });
            }}
            onContinue={nextStep}
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
            service={bookingData.services[0] || null}
            serviceDuration={bookingData.totalDuration}
            selected={bookingData.time}
            onSelect={(time, barber) => {
              updateData({ time, barber: barber || bookingData.barber });
              nextStep();
            }}
          />
        )}

        {step === 5 && (
          <StepClientInfoExpanded
            clientName={bookingData.clientName}
            clientWhatsapp={bookingData.clientWhatsapp}
            clientEmail={bookingData.clientEmail}
            clientBirthDate={bookingData.clientBirthDate}
            referralSource={bookingData.referralSource}
            onSubmit={(data) => {
              updateData({
                clientName: data.name,
                clientWhatsapp: data.whatsapp,
                clientEmail: data.email,
                clientBirthDate: data.birthDate,
                referralSource: data.referralSource,
              });
              nextStep();
            }}
          />
        )}

        {step === 6 && (
          <StepConfirm
            bookingData={legacyBookingData}
            allServices={bookingData.services}
            totalPrice={bookingData.totalPrice}
            totalDuration={bookingData.totalDuration}
            totalDeposit={bookingData.totalDeposit}
            onConfirm={handleConfirm}
            isLoading={createAppointment.isPending}
          />
        )}
      </div>
    </main>
  );
};

export default Agendar;
