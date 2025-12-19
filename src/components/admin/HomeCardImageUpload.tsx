import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, Trash2, Loader2, ImageIcon } from "lucide-react";

interface HomeCardImageUploadProps {
  cardId: string;
  currentImageUrl: string | null;
  onImageChange: (url: string | null) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export function HomeCardImageUpload({
  cardId,
  currentImageUrl,
  onImageChange,
}: HomeCardImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Use JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho máximo é ${MAX_SIZE_MB}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${cardId}-${Date.now()}.${fileExt}`;
      const filePath = `home-cards/${fileName}`;

      // Upload to gallery bucket (já existe e é público)
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      onImageChange(publicUrl);

      toast({ title: "Imagem atualizada com sucesso" });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    setUploading(true);
    try {
      const urlParts = currentImageUrl.split("/gallery/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split("?")[0];
        await supabase.storage.from("gallery").remove([filePath]);
      }

      onImageChange(null);
      toast({ title: "Imagem removida" });
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast({
        title: "Erro ao remover imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview */}
      <div className="w-full aspect-video rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt="Preview do card"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Nenhuma imagem</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {currentImageUrl ? "Trocar" : "Upload"}
        </Button>

        {currentImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
