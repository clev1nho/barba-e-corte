import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, Calendar } from "lucide-react";

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
  { value: "outros", label: "Outros" },
];

// Convert DD/MM/YYYY to YYYY-MM-DD for database
function toISODate(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Convert YYYY-MM-DD to DD/MM/YYYY for display
function fromISODate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

// Validate DD/MM/YYYY format
function isValidDate(dateStr: string): { valid: boolean; error?: string } {
  if (dateStr.length !== 10) {
    return { valid: false, error: "Data incompleta" };
  }
  
  const parts = dateStr.split("/");
  if (parts.length !== 3) {
    return { valid: false, error: "Formato inválido" };
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { valid: false, error: "Data inválida" };
  }
  
  if (month < 1 || month > 12) {
    return { valid: false, error: "Mês inválido (1-12)" };
  }
  
  if (day < 1 || day > 31) {
    return { valid: false, error: "Dia inválido" };
  }
  
  // Check days per month
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Leap year check
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }
  
  if (day > daysInMonth[month - 1]) {
    return { valid: false, error: `${month === 2 ? "Fevereiro" : "Este mês"} não tem ${day} dias` };
  }
  
  if (year < 1900 || year > new Date().getFullYear()) {
    return { valid: false, error: "Ano inválido" };
  }
  
  // Check if date is in the future
  const date = new Date(year, month - 1, day);
  if (date > new Date()) {
    return { valid: false, error: "Data não pode ser futura" };
  }
  
  return { valid: true };
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
    // Remove non-digits
    const numbers = value.replace(/\D/g, "");
    
    // Auto-insert slashes
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
    
    // Clear error on change
    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    const phoneNumbers = whatsapp.replace(/\D/g, "");
    if (!phoneNumbers) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (phoneNumbers.length < 10) {
      newErrors.whatsapp = "WhatsApp inválido";
    }

    if (!email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    } else {
      const dateValidation = isValidDate(birthDate);
      if (!dateValidation.valid) {
        newErrors.birthDate = dateValidation.error || "Data inválida";
      }
    }

    if (!referral) {
      newErrors.referral = "Por favor, selecione como conheceu a barbearia";
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
        birthDate: toISODate(birthDate), // Convert to ISO for database
        referralSource: referral,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Seus dados</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Para confirmar seu agendamento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="pl-10 h-12"
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={handleWhatsappChange}
              placeholder="(00) 00000-0000"
              className="pl-10 h-12"
              maxLength={16}
            />
          </div>
          {errors.whatsapp && (
            <p className="text-sm text-destructive">{errors.whatsapp}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="pl-10 h-12"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Data de nascimento - Masked input */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="birthDate"
              type="text"
              inputMode="numeric"
              value={birthDate}
              onChange={handleBirthDateChange}
              placeholder="DD/MM/AAAA"
              className="pl-10 h-12"
              maxLength={10}
            />
          </div>
          {errors.birthDate && (
            <p className="text-sm text-destructive">{errors.birthDate}</p>
          )}
        </div>

        {/* Como conheceu */}
        <div className="space-y-2">
          <Label htmlFor="referral">Como conheceu a barbearia? *</Label>
          <Select value={referral} onValueChange={setReferral}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {referralOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.referral && (
            <p className="text-sm text-destructive">{errors.referral}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full mt-6">
          Continuar
        </Button>
      </form>
    </div>
  );
}
