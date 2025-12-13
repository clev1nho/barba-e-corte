import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Move, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroCropEditorProps {
  label: string;
  imageUrl: string | null;
  cropX: number;
  cropY: number;
  aspectRatio: "desktop" | "mobile";
  onImageChange: (url: string | null) => void;
  onCropChange: (x: number, y: number) => void;
}

export function HeroCropEditor({
  label,
  imageUrl,
  cropX,
  cropY,
  aspectRatio,
  onImageChange,
  onCropChange,
}: HeroCropEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState({ x: cropX, y: cropY });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewAspectClass =
    aspectRatio === "desktop" ? "aspect-[16/6]" : "aspect-[9/16]";

  const handleUpload = async (file?: File) => {
    const targetFile = file ?? fileInputRef.current?.files?.[0];
    if (!targetFile) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(targetFile.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    if (targetFile.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = targetFile.name.split(".").pop();
      const fileName = `hero-${aspectRatio}-${Date.now()}.${ext}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, targetFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);
      onImageChange(data.publicUrl);
      onCropChange(50, 50);
      toast.success("Imagem enviada!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    onCropChange(50, 50);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageUrl || !containerRef.current) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCrop({ x: cropX, y: cropY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const containerWidth = containerRef.current.offsetWidth || 1;
    const containerHeight = containerRef.current.offsetHeight || 1;

    const percentX = (deltaX / containerWidth) * 100;
    const percentY = (deltaY / containerHeight) * 100;

    const newX = Math.max(0, Math.min(100, initialCrop.x - percentX));
    const newY = Math.max(0, Math.min(100, initialCrop.y - percentY));

    onCropChange(Math.round(newX), Math.round(newY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if capture was not set
    }
  };

  const handleCentralize = () => {
    onCropChange(50, 50);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={uploading}
        onChange={() => handleUpload()}
      />

      {!imageUrl ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <button
            type="button"
            onClick={handleTriggerUpload}
            className="cursor-pointer flex flex-col items-center gap-2 w-full"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? "Enviando..." : "Clique para enviar"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG ou WebP (máx. 5MB)
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-lg border-2 border-primary ${previewAspectClass}`}
            style={{
              backgroundImage: imageUrl ? `url('${imageUrl}')` : undefined,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: `${cropX}% ${cropY}%`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center bg-black/20">
                <Move className="w-4 h-4 text-white/80" />
              </div>
            </div>

            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Move className="w-3 h-3" />
            Arraste para ajustar o enquadramento
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCentralize}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Centralizar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTriggerUpload}
              className="flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              Trocar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Remover
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Posição: {cropX}% x {cropY}%
          </p>
        </div>
      )}
    </div>
  );
}

