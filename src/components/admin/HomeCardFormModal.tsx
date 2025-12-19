import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomeCardImageUpload } from "./HomeCardImageUpload";
import { HomeCard } from "@/hooks/useHomeCards";
import { Loader2, MessageCircle, Lock, Globe, Instagram, MessageSquare, Link2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HomeCardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: HomeCard | null; // null = criar novo
  onSave: (data: Omit<HomeCard, "id" | "created_at" | "updated_at">) => Promise<void>;
}

const ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "message", label: "Chat", Icon: MessageCircle },
  { key: "lock", label: "Cadeado", Icon: Lock },
  { key: "globe", label: "Site", Icon: Globe },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageSquare },
  { key: "link", label: "Link", Icon: Link2 },
];

export function HomeCardFormModal({
  open,
  onOpenChange,
  card,
  onSave,
}: HomeCardFormModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [iconKey, setIconKey] = useState("message");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setSubtitle(card.subtitle || "");
      setLinkUrl(card.link_url);
      setIconKey(card.icon_key);
      setImageUrl(card.image_url);
      setIsActive(card.is_active);
      setDisplayOrder(card.display_order);
    } else {
      setTitle("");
      setSubtitle("");
      setLinkUrl("");
      setIconKey("message");
      setImageUrl(null);
      setIsActive(true);
      setDisplayOrder(0);
    }
  }, [card, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }
    if (!linkUrl.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        link_url: linkUrl.trim(),
        icon_key: iconKey,
        image_url: imageUrl,
        is_active: isActive,
        display_order: displayOrder,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedIcon = ICON_OPTIONS.find((opt) => opt.key === iconKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? "Editar Card" : "Novo Card"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagem */}
          <div className="space-y-2">
            <Label>Imagem de Fundo</Label>
            <HomeCardImageUpload
              cardId={card?.id || `new-${Date.now()}`}
              currentImageUrl={imageUrl}
              onImageChange={setImageUrl}
            />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fale Conosco"
              required
            />
          </div>

          {/* Subtítulo */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Tire suas dúvidas"
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link *</Label>
            <Input
              id="linkUrl"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://... ou /pagina"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use https:// para links externos ou / para rotas internas
            </p>
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <Select value={iconKey} onValueChange={setIconKey}>
              <SelectTrigger>
                <SelectValue>
                  {selectedIcon && (
                    <span className="flex items-center gap-2">
                      <selectedIcon.Icon className="w-4 h-4" />
                      {selectedIcon.label}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    <span className="flex items-center gap-2">
                      <opt.Icon className="w-4 h-4" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
