import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Move, RotateCcw, Loader2 } from "lucide-react";
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
  const [removing, setRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState({ x: cropX, y: cropY });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewAspectClass =
    aspectRatio === "desktop" ? "aspect-[16/6]" : "aspect-[9/16]";

  const deviceLabel = aspectRatio === "desktop" ? "Desktop" : "Mobile";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `hero-${aspectRatio}-${Date.now()}.${ext}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);
      
      // Update state and reset crop
      onImageChange(data.publicUrl);
      onCropChange(50, 50);
      
      toast.success(`Imagem atualizada (${deviceLabel})`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      // Clear input to allow re-selecting same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemoving(true);
    try {
      // Update state to remove image
      onImageChange(null);
      onCropChange(50, 50);
      
      toast.success(`Imagem removida (${deviceLabel})`);
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Erro ao remover imagem.");
    } finally {
      setRemoving(false);
    }
  };

  const handleTriggerUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleCentralize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCropChange(50, 50);
    toast.success("Posição centralizada");
  };

  const DRAG_THRESHOLD = 5;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageUrl || !containerRef.current) return;

    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCrop({ x: cropX, y: cropY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Only start actual dragging after threshold
    if (!hasMoved && Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) {
      return;
    }

    if (!hasMoved) {
      setHasMoved(true);
    }

    e.preventDefault();

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
    setHasMoved(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if capture was not set
    }
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
        onChange={handleFileChange}
      />

      {!imageUrl ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <button
            type="button"
            onClick={handleTriggerUpload}
            disabled={uploading}
            className="cursor-pointer flex flex-col items-center gap-2 w-full disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
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
          {/* Preview with drag - separate from buttons */}
          <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-lg border-2 border-primary ${previewAspectClass} touch-none`}
            style={{
              backgroundImage: `url('${imageUrl}')`,
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
            {/* Grid overlay - pointer-events none */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            </div>

            {/* Center indicator - pointer-events none */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center bg-black/20">
                <Move className="w-4 h-4 text-white/80" />
              </div>
            </div>

            {/* Dark overlay - pointer-events none */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            {/* Dragging indicator */}
            {isDragging && hasMoved && (
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Move className="w-3 h-3" />
            Arraste para ajustar o enquadramento
          </p>

          {/* Buttons - completely outside drag area */}
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
              disabled={uploading}
              className="flex items-center gap-1"
            >
              {uploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              Trocar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center gap-1"
            >
              {removing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <X className="w-3 h-3" />
              )}
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
