import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Scissors, User, DollarSign, Loader2, Copy, Check, QrCode, AlertCircle } from "lucide-react";
import { useShopSettings } from "@/hooks/useShopSettings";
import { toast } from "@/hooks/use-toast";
import { ServiceWithCategory } from "@/hooks/useServicesWithCategories";
import { Barber } from "@/hooks/useBarbers";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t, lang, translateService, translateShopField } = useLanguage();

  const services = allServices && allServices.length > 0 ? allServices : (bookingData.service ? [bookingData.service] : []);
  const displayPrice = propTotalPrice ?? services.reduce((sum, s) => sum + s.price, 0);
  const displayDuration = propTotalDuration ?? services.reduce((sum, s) => sum + s.duration_minutes, 0);
  const depositAmount = propTotalDeposit ?? services.reduce((sum, s) => sum + ((s as any).deposit_amount || 0), 0);
  
  const hasDeposit = depositAmount > 0;
  const pixConfigured = !!settings?.pix_key_or_link;

  const dateLocale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";

  const formattedDate = bookingData.date
    ? new Date(bookingData.date + "T12:00:00").toLocaleDateString(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const pixMessage = translateShopField("pix_message", settings?.pix_message);

  const handleCopyPix = async () => {
    if (!settings?.pix_key_or_link) return;
    try {
      await navigator.clipboard.writeText(settings.pix_key_or_link);
      setCopied(true);
      toast({ title: t.step_confirm_pix_copied });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const confirmDisabled = isLoading || (hasDeposit && pixConfigured && !paidConfirmed);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t.step_confirm_title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.step_confirm_subtitle}</p>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {services.length > 1 ? t.step_confirm_services : t.step_confirm_service}
            </p>
            <div className="space-y-1">
              {services.map(s => (
                <p key={s.id} className="font-semibold">{translateService(s.id, s.name)}</p>
              ))}
            </div>
            {services.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t.step_confirm_total_time}: {displayDuration} {t.min_unit}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t.step_confirm_barber}</p>
            <p className="font-semibold">{bookingData.barber?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t.step_confirm_date}</p>
            <p className="font-semibold capitalize">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t.step_confirm_time}</p>
            <p className="font-semibold">{bookingData.time}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t.step_confirm_total}</p>
            <p className="text-xl font-bold text-primary">
              R$ {displayPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-muted-foreground mb-2">{t.step_confirm_client}</p>
        <p className="font-semibold">{bookingData.clientName}</p>
        <p className="text-sm text-muted-foreground">
          {bookingData.clientWhatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
        </p>
      </div>

      {hasDeposit && (
        <div className="glass-card rounded-2xl p-5 border-2 border-primary/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">{t.step_confirm_pix_title}</h3>
              <p className="text-sm text-muted-foreground">{t.step_confirm_pix_desc}</p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.step_confirm_pix_deposit_label}</p>
            <p className="text-2xl font-bold text-primary">
              R$ {depositAmount.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {pixConfigured ? (
            <>
              {pixMessage && <p className="text-sm">{pixMessage}</p>}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 gap-2" onClick={handleCopyPix}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t.step_confirm_pix_copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t.step_confirm_pix_copy}
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
                  {t.step_confirm_pix_checkbox}
                </label>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 bg-destructive/10 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">{t.step_confirm_pix_not_configured_title}</p>
                <p className="text-xs text-muted-foreground">{t.step_confirm_pix_not_configured_desc}</p>
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
            {t.step_confirm_loading}
          </>
        ) : (
          t.step_confirm_button
        )}
      </Button>
    </div>
  );
}
