import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";

interface HeroBackgroundUploadProps {
  label: string;
  currentUrl: string | null;
  position: string;
  onUrlChange: (url: string | null) => void;
  onPositionChange: (position: string) => void;
  bucketFolder: string;
}

const POSITION_OPTIONS = [
  { value: "center", label: "Centro" },
  { value: "top", label: "Topo" },
  { value: "bottom", label: "Base" },
  { value: "left", label: "Esquerda" },
  { value: "right", label: "Direita" },
  { value: "top center", label: "Topo Centro" },
  { value: "bottom center", label: "Base Centro" },
];

export function HeroBackgroundUpload({
  label,
  currentUrl,
  position,
  onUrlChange,
  onPositionChange,
  bucketFolder,
}: HeroBackgroundUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use apenas JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB for background images)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${bucketFolder}-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      onUrlChange(urlData.publicUrl);
      toast({ title: "Imagem enviada com sucesso" });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onUrlChange(null);
  };

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Preview */}
      <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-full object-cover"
            style={{ objectPosition: position }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Upload / Remove buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={uploading}
          onClick={() => document.getElementById(`upload-${bucketFolder}`)?.click()}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-1" />
          )}
          {currentUrl ? "Trocar" : "Enviar"}
        </Button>

        {currentUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        )}

        <input
          id={`upload-${bucketFolder}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Position Select */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Enquadramento</Label>
        <Select value={position} onValueChange={onPositionChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
