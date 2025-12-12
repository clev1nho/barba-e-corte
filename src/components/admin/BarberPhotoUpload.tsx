import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BarberPhotoUploadProps {
  currentPhotoUrl: string;
  barberName: string;
  onPhotoChange: (url: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function BarberPhotoUpload({
  currentPhotoUrl,
  barberName,
  onPhotoChange,
  disabled,
}: BarberPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas JPG, PNG e WebP são permitidos.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 3MB.",
        variant: "destructive",
      });
      return;
    }

    // Create local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to Supabase
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `barbers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("barbers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("barbers")
        .getPublicUrl(filePath);

      onPhotoChange(urlData.publicUrl);
      setPreviewUrl(urlData.publicUrl);
      
      toast({ title: "Foto enviada com sucesso" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar foto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      // Revert preview on error
      setPreviewUrl(currentPhotoUrl);
    } finally {
      setIsUploading(false);
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl("");
    onPhotoChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20 border-2 border-primary">
          <AvatarImage src={previewUrl || undefined} alt={barberName || "Barbeiro"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {barberName ? getInitials(barberName) : <ImageIcon className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
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
                {previewUrl ? "Trocar foto" : "Enviar foto"}
              </>
            )}
          </Button>

          {previewUrl && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              disabled={disabled}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Remover foto
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        JPG, PNG ou WebP. Máximo 3MB.
      </p>
    </div>
  );
}
