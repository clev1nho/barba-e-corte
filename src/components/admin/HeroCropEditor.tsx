import { useState, useRef, useCallback, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Aspect ratios for preview
  const previewHeight = aspectRatio === "desktop" ? 200 : 280;
  const previewWidth = aspectRatio === "desktop" ? 400 : 200;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      onImageChange(data.publicUrl);
      onCropChange(50, 50); // Reset crop to center
      toast.success("Imagem enviada!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    onCropChange(50, 50);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!imageUrl) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialCrop({ x: cropX, y: cropY });
    },
    [imageUrl, cropX, cropY]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Convert pixel movement to percentage (inverted for natural feel)
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      const percentX = (deltaX / containerWidth) * 100;
      const percentY = (deltaY / containerHeight) * 100;

      // Invert: dragging right moves image left (shows more right side)
      const newX = Math.max(0, Math.min(100, initialCrop.x - percentX));
      const newY = Math.max(0, Math.min(100, initialCrop.y - percentY));

      onCropChange(Math.round(newX), Math.round(newY));
    },
    [isDragging, dragStart, initialCrop, onCropChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleReset = () => {
    onCropChange(50, 50);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {!imageUrl ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
            id={`hero-upload-${aspectRatio}`}
            disabled={uploading}
          />
          <label
            htmlFor={`hero-upload-${aspectRatio}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? "Enviando..." : "Clique para enviar"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG ou WebP (máx. 5MB)
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Crop Editor */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg border-2 border-primary cursor-move select-none"
            style={{
              width: previewWidth,
              height: previewHeight,
              maxWidth: "100%",
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url('${imageUrl}')`,
                backgroundPosition: `${cropX}% ${cropY}%`,
              }}
            />

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical lines */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
              {/* Horizontal lines */}
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            </div>

            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center">
                <Move className="w-4 h-4 text-white/80" />
              </div>
            </div>

            {/* Dark overlay for better visibility */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Drag indicator */}
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Move className="w-3 h-3" />
            Arraste para ajustar o enquadramento
          </p>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Centralizar
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

          {/* Position indicator */}
          <p className="text-xs text-muted-foreground">
            Posição: {cropX}% x {cropY}%
          </p>
        </div>
      )}
    </div>
  );
}
