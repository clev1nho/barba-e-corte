import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone } from "lucide-react";

interface StepClientInfoProps {
  clientName: string;
  clientWhatsapp: string;
  onSubmit: (name: string, whatsapp: string) => void;
}

export function StepClientInfo({ clientName, clientWhatsapp, onSubmit }: StepClientInfoProps) {
  const [name, setName] = useState(clientName);
  const [whatsapp, setWhatsapp] = useState(clientWhatsapp);
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});

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
    const newErrors: { name?: string; whatsapp?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), whatsapp.replace(/\D/g, ""));
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="pl-10 h-12"
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
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

        <Button type="submit" size="lg" className="w-full mt-6">
          Continuar
        </Button>
      </form>
    </div>
  );
}
