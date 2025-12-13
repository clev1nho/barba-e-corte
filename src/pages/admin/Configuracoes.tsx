import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useShopSettings, WorkingHours, DEFAULT_WORKING_HOURS } from "@/hooks/useShopSettings";
import { useUpdateShopSettings } from "@/hooks/useShopSettingsMutations";
import { Settings, MapPin, Phone, Clock, Save, Loader2, ImageIcon, Type, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { LogoUpload } from "@/components/admin/LogoUpload";

interface SettingsFormData {
  name: string;
  subtitle: string;
  whatsapp: string;
  address: string;
  open_time: string;
  close_time: string;
  allow_same_day: boolean;
  slot_interval_minutes: number;
  highlight_points: string[];
  working_hours: WorkingHours;
  logo_url: string;
  hero_secondary_text: string;
  about_description: string;
  pix_key_or_link: string;
  pix_message: string;
  pix_note: string;
}

const DAYS_OF_WEEK: { key: keyof WorkingHours; label: string }[] = [
  { key: "segunda", label: "Segunda-feira" },
  { key: "terça", label: "Terça-feira" },
  { key: "quarta", label: "Quarta-feira" },
  { key: "quinta", label: "Quinta-feira" },
  { key: "sexta", label: "Sexta-feira" },
  { key: "sábado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const Configuracoes = () => {
  const { data: settings, isLoading } = useShopSettings();
  const updateSettings = useUpdateShopSettings();

  const [formData, setFormData] = useState<SettingsFormData>({
    name: "",
    subtitle: "",
    whatsapp: "",
    address: "",
    open_time: "09:00",
    close_time: "19:00",
    allow_same_day: true,
    slot_interval_minutes: 30,
    highlight_points: [],
    working_hours: DEFAULT_WORKING_HOURS,
    logo_url: "",
    hero_secondary_text: "Agendamento online, rápido e sem precisar mandar mensagem.",
    about_description: "Nossa barbearia oferece uma experiência única em cuidados masculinos. Combinamos técnicas tradicionais com tendências modernas para entregar cortes impecáveis e atendimento de primeira classe.",
    pix_key_or_link: "",
    pix_message: "Envie o sinal e depois marque o checkbox para confirmar.",
    pix_note: "",
  });

  const [highlightText, setHighlightText] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        subtitle: settings.subtitle || "",
        whatsapp: settings.whatsapp || "",
        address: settings.address || "",
        open_time: settings.open_time || "09:00",
        close_time: settings.close_time || "19:00",
        allow_same_day: settings.allow_same_day ?? true,
        slot_interval_minutes: settings.slot_interval_minutes || 30,
        highlight_points: settings.highlight_points || [],
        working_hours: settings.working_hours || DEFAULT_WORKING_HOURS,
        logo_url: settings.logo_url || "",
        hero_secondary_text: settings.hero_secondary_text ?? "Agendamento online, rápido e sem precisar mandar mensagem.",
        about_description: settings.about_description ?? "Nossa barbearia oferece uma experiência única em cuidados masculinos. Combinamos técnicas tradicionais com tendências modernas para entregar cortes impecáveis e atendimento de primeira classe.",
        pix_key_or_link: settings.pix_key_or_link || "",
        pix_message: settings.pix_message || "Envie o sinal e depois marque o checkbox para confirmar.",
        pix_note: settings.pix_note || "",
      });
      setHighlightText((settings.highlight_points || []).join("\n"));
    }
  }, [settings]);

  const updateDaySchedule = (day: keyof WorkingHours, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "Nome da barbearia é obrigatório", variant: "destructive" });
      return;
    }

    const highlights = highlightText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    updateSettings.mutate(
      {
        id: settings?.id,
        ...formData,
        highlight_points: highlights,
        hero_secondary_text: formData.hero_secondary_text.trim() || null,
        about_description: formData.about_description.trim() || null,
        pix_key_or_link: formData.pix_key_or_link.trim() || null,
        pix_message: formData.pix_message.trim() || null,
        pix_note: formData.pix_note.trim() || null,
      },
      {
        onSuccess: () => {
          toast({ title: "Configurações salvas com sucesso" });
        },
        onError: (error) => {
          console.error("Erro ao salvar configurações:", error);
          toast({ title: "Erro ao salvar configurações", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visual Identity */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Identidade Visual
          </h2>
          <p className="text-sm text-muted-foreground">
            A logo será exibida na página inicial e em todo o site.
          </p>
          <LogoUpload
            currentLogoUrl={formData.logo_url}
            onLogoChange={(url) => setFormData({ ...formData, logo_url: url })}
          />
        </div>

        {/* Texts */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Textos do Site
          </h2>

          <div className="space-y-2">
            <Label htmlFor="hero_secondary_text">Texto secundário do topo (abaixo do subtítulo)</Label>
            <Input
              id="hero_secondary_text"
              value={formData.hero_secondary_text}
              onChange={(e) => setFormData({ ...formData, hero_secondary_text: e.target.value })}
              placeholder="Ex: Agendamento online, rápido e sem precisar mandar mensagem."
            />
            <p className="text-xs text-muted-foreground">
              Deixe vazio para não exibir este texto.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_description">Texto da seção "Sobre a Barbearia"</Label>
            <Textarea
              id="about_description"
              value={formData.about_description}
              onChange={(e) => setFormData({ ...formData, about_description: e.target.value })}
              placeholder="Descreva sua barbearia..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Deixe vazio para não exibir este texto.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Informações Básicas
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Barbearia *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da sua barbearia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo / Slogan</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Ex: Cortes de alto nível"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Contato
          </h2>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="5511999999999"
            />
            <p className="text-xs text-muted-foreground">
              Formato: código do país + DDD + número (sem espaços ou traços)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, número, bairro..."
              rows={2}
            />
          </div>
        </div>

        {/* Schedule Per Day */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horário de Funcionamento por Dia
          </h2>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map(({ key, label }) => (
              <div key={key} className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Fechado</span>
                    <Switch
                      checked={formData.working_hours[key].closed}
                      onCheckedChange={(checked) => updateDaySchedule(key, "closed", checked)}
                    />
                  </div>
                </div>
                
                {!formData.working_hours[key].closed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Abertura</Label>
                      <Input
                        type="time"
                        value={formData.working_hours[key].open || "09:00"}
                        onChange={(e) => updateDaySchedule(key, "open", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fechamento</Label>
                      <Input
                        type="time"
                        value={formData.working_hours[key].close || "19:00"}
                        onChange={(e) => updateDaySchedule(key, "close", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Label htmlFor="slot_interval">Intervalo entre horários (min)</Label>
            <Input
              id="slot_interval"
              type="number"
              min={5}
              max={120}
              value={formData.slot_interval_minutes}
              onChange={(e) =>
                setFormData({ ...formData, slot_interval_minutes: parseInt(e.target.value) || 30 })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_same_day">Permitir agendamento no mesmo dia</Label>
              <p className="text-xs text-muted-foreground">
                Se desativado, clientes só podem agendar a partir de amanhã
              </p>
            </div>
            <Switch
              id="allow_same_day"
              checked={formData.allow_same_day}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_same_day: checked })}
            />
          </div>
        </div>

        {/* Highlights */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">Destaques da Barbearia</h2>
          <p className="text-sm text-muted-foreground">
            Um destaque por linha. Estes itens aparecem na página inicial.
          </p>
          <Textarea
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
            placeholder="Cortes masculinos premium&#10;Agendamento online 24h&#10;Profissionais experientes"
            rows={4}
          />
        </div>

        {/* PIX Configuration */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Pagamento via Pix (Sinal)
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure o Pix para receber o sinal antes de confirmar agendamentos.
          </p>

          <div className="space-y-2">
            <Label htmlFor="pix_key_or_link">Chave ou Link do Pix</Label>
            <Input
              id="pix_key_or_link"
              value={formData.pix_key_or_link}
              onChange={(e) => setFormData({ ...formData, pix_key_or_link: e.target.value })}
              placeholder="Ex: 00020126580014br.gov.bcb.pix... ou sua chave"
            />
            <p className="text-xs text-muted-foreground">
              Cole aqui o código Pix "copia e cola" ou a chave Pix.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix_message">Mensagem do Pix</Label>
            <Textarea
              id="pix_message"
              value={formData.pix_message}
              onChange={(e) => setFormData({ ...formData, pix_message: e.target.value })}
              placeholder="Envie o sinal e depois marque o checkbox para confirmar."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix_note">Observação (opcional)</Label>
            <Input
              id="pix_note"
              value={formData.pix_note}
              onChange={(e) => setFormData({ ...formData, pix_note: e.target.value })}
              placeholder="Ex: Após o pagamento, aguarde confirmação no WhatsApp."
            />
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full gap-2" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Configurações
        </Button>
      </form>
    </AdminLayout>
  );
};

export default Configuracoes;
