import { useState } from "react";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const staticImages = [
  { id: "1", image_url: "/gallery/space-1.png", alt_text: "Sala de corte" },
  { id: "2", image_url: "/gallery/space-2.png", alt_text: "Recepção" },
  { id: "3", image_url: "/gallery/space-3.png", alt_text: "Sala de massagem" },
  { id: "4", image_url: "/gallery/space-4.png", alt_text: "Área externa" },
];

export function GallerySection() {
  const { data: dbImages } = useGalleryImages();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const ref = useScrollReveal();

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
    <section className="section-premium" id="espaco" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="premium-divider reveal-on-scroll" />
        <h2 className="section-heading reveal-on-scroll">Nosso Espaço</h2>
        <p className="section-subheading reveal-on-scroll">
          Ambiente exclusivo e sofisticado para seu bem-estar
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/30 transition-all duration-220 hover:border-primary/25 hover:shadow-[var(--shadow-lift)] reveal-on-scroll"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || "Foto do espaço"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {selectedIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-background/97 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground transition-colors duration-220"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 p-2 text-foreground/50 hover:text-foreground transition-colors duration-220"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            
            <img
              src={images[selectedIndex].image_url}
              alt={images[selectedIndex].alt_text || "Foto do espaço"}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 p-2 text-foreground/50 hover:text-foreground transition-colors duration-220"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-foreground/50 text-sm font-sans">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
