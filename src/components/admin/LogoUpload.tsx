import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LogoUploadProps {
  currentLogoUrl: string | null | undefined;
  onLogoChange: (url: string) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function LogoUpload({ currentLogoUrl, onLogoChange, disabled }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Use JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho máximo é ${MAX_SIZE_MB}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setImageError(false);

    try {
      // Create local preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Generate unique filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `shop/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);
      onLogoChange(publicUrl);

      toast({ title: "Logo enviada com sucesso" });
    } catch (error) {
      console.error("Error uploading logo:", error);
      setPreviewUrl(currentLogoUrl || null);
      toast({
        title: "Erro ao enviar logo",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setImageError(false);
    onLogoChange("");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
          {previewUrl && !imageError ? (
            <img
              src={previewUrl}
              alt="Logo da barbearia"
              className="w-full h-full object-contain p-2"
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-10 h-10" />
              <span className="text-xs">Sem logo</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload controls */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {previewUrl ? "Trocar logo" : "Enviar logo"}
              </>
            )}
          </Button>

          {previewUrl && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={disabled}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Remover
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG ou WebP • Máx. {MAX_SIZE_MB}MB
        </p>
      </div>
    </div>
  );
}
