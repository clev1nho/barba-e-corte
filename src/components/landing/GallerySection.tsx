import { useState } from "react";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Static gallery images (fallback)
const staticImages = [
  { id: "1", image_url: "/gallery/space-1.png", alt_text: "Sala de corte" },
  { id: "2", image_url: "/gallery/space-2.png", alt_text: "Recepção" },
  { id: "3", image_url: "/gallery/space-3.png", alt_text: "Sala de massagem" },
  { id: "4", image_url: "/gallery/space-4.png", alt_text: "Área externa" },
];

export function GallerySection() {
  const { data: dbImages } = useGalleryImages();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Use database images if available, otherwise use static
  const images = dbImages && dbImages.length > 0 ? dbImages : staticImages;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };
  
  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <section className="py-16 px-4" id="espaco">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Nosso Espaço</h2>
        <p className="text-muted-foreground text-center mb-8">
          Ambiente exclusivo e sofisticado para seu bem-estar
        </p>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={image.image_url}
                alt={image.alt_text || "Foto do espaço"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {selectedIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            
            <img
              src={images[selectedIndex].image_url}
              alt={images[selectedIndex].alt_text || "Foto do espaço"}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
