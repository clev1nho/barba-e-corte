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
  const [birthDate, setBirthDate] = useState(clientBirthDate);
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

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value));
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
        birthDate,
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

        {/* Data de nascimento */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="pl-10 h-12"
              max={new Date().toISOString().split('T')[0]}
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
