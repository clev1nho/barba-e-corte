import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface StepClientInfoExpandedProps {
  clientName: string;
  clientWhatsapp: string;
  clientEmail: string;
  clientBirthDate: string;
  referralSource: string;
  onSubmit: (data: {
    name: string;
    whatsapp: string;
    email: string;
    birthDate: string;
    referralSource: string;
  }) => void;
}

const referralOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter" },
  { value: "outros", label: "outros_placeholder" }, // will be replaced
];

function toISODate(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function fromISODate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function StepClientInfoExpanded({ 
  clientName, 
  clientWhatsapp, 
  clientEmail,
  clientBirthDate,
  referralSource,
  onSubmit 
}: StepClientInfoExpandedProps) {
  const [name, setName] = useState(clientName);
  const [whatsapp, setWhatsapp] = useState(clientWhatsapp);
  const [email, setEmail] = useState(clientEmail);
  const [birthDate, setBirthDate] = useState(fromISODate(clientBirthDate));
  const [referral, setReferral] = useState(referralSource);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useLanguage();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatBirthDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthDate(e.target.value);
    setBirthDate(formatted);
    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t.val_name_required;
    } else if (name.trim().length < 3) {
      newErrors.name = t.val_name_min;
    }

    const phoneNumbers = whatsapp.replace(/\D/g, "");
    if (!phoneNumbers) {
      newErrors.whatsapp = t.val_whatsapp_required;
    } else if (phoneNumbers.length < 10) {
      newErrors.whatsapp = t.val_whatsapp_invalid;
    }

    if (!email.trim()) {
      newErrors.email = t.val_email_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t.val_email_invalid;
    }

    if (!birthDate) {
      newErrors.birthDate = t.val_birthdate_required;
    } else {
      // Validate DD/MM/YYYY
      if (birthDate.length !== 10) {
        newErrors.birthDate = t.val_birthdate_incomplete;
      } else {
        const parts = birthDate.split("/");
        if (parts.length !== 3) {
          newErrors.birthDate = t.val_birthdate_invalid_format;
        } else {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            newErrors.birthDate = t.val_birthdate_invalid;
          } else if (month < 1 || month > 12) {
            newErrors.birthDate = t.val_birthdate_month;
          } else if (day < 1 || day > 31) {
            newErrors.birthDate = t.val_birthdate_day;
          } else {
            const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
              daysInMonth[1] = 29;
            }
            if (day > daysInMonth[month - 1]) {
              newErrors.birthDate = t.val_birthdate_day_overflow;
            } else if (year < 1900 || year > new Date().getFullYear()) {
              newErrors.birthDate = t.val_birthdate_year;
            } else {
              const date = new Date(year, month - 1, day);
              if (date > new Date()) {
                newErrors.birthDate = t.val_birthdate_future;
              }
            }
          }
        }
      }
    }

    if (!referral) {
      newErrors.referral = t.val_referral_required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: name.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        email: email.trim(),
        birthDate: toISODate(birthDate),
        referralSource: referral,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t.step_client_title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.step_client_subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.step_client_name_label} *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.step_client_name_placeholder}
              className="pl-10 h-12"
            />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">{t.step_client_whatsapp_label} *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={handleWhatsappChange}
              placeholder={t.step_client_whatsapp_placeholder}
              className="pl-10 h-12"
              maxLength={16}
            />
          </div>
          {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.step_client_email_label} *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.step_client_email_placeholder}
              className="pl-10 h-12"
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">{t.step_client_birthdate_label} *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="birthDate"
              type="text"
              inputMode="numeric"
              value={birthDate}
              onChange={handleBirthDateChange}
              placeholder={t.step_client_birthdate_placeholder}
              className="pl-10 h-12"
              maxLength={10}
            />
          </div>
          {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral">{t.step_client_referral_label} *</Label>
          <Select value={referral} onValueChange={setReferral}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={t.step_client_referral_placeholder} />
            </SelectTrigger>
            <SelectContent>
              {referralOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === "outros" ? t.referral_outros : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.referral && <p className="text-sm text-destructive">{errors.referral}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full mt-6">
          {t.step_client_continue}
        </Button>
      </form>
    </div>
  );
}
