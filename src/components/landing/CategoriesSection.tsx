import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Scissors } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ExtendedCategory {
  id: string;
  name: string;
  display_order: number;
  icon_image_url?: string | null;
  home_enabled?: boolean;
}

export function CategoriesSection() {
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: settings, isLoading: loadingSettings } = useShopSettings();
  const ref = useScrollReveal();

  const isLoading = loadingCategories || loadingSettings;

  if (isLoading) {
    return (
      <section className="section-premium">
        <div className="max-w-lg mx-auto">
          <div className="premium-divider" />
          <h2 className="section-heading">Nossos Serviços</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="w-14 h-14 bg-muted/40 rounded-full mb-3 mx-auto" />
                <div className="h-4 bg-muted/40 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const enabledCategories = (categories as ExtendedCategory[] | undefined)?.filter(
    (cat) => cat.home_enabled !== false
  ) || [];

  if (!enabledCategories.length) return null;

  const sectionTitle = settings?.services_section_title || "Nossos Serviços";
  const sectionSubtitle = settings?.services_section_subtitle || "Cuidados especializados para o homem moderno";

  return (
    <section className="section-premium" id="servicos" ref={ref}>
      <div className="max-w-lg mx-auto">
        <div className="premium-divider reveal-on-scroll" />
        <h2 className="section-heading reveal-on-scroll">{sectionTitle}</h2>
        {sectionSubtitle && (
          <p className="section-subheading reveal-on-scroll">{sectionSubtitle}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {enabledCategories.map((category, index) => (
            <div
              key={category.id}
              className="glass-card-hover rounded-2xl p-5 text-center reveal-on-scroll"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              {category.icon_image_url ? (
                <img
                  src={category.icon_image_url}
                  alt={category.name}
                  className="w-16 h-16 object-contain rounded-lg mb-3 mx-auto"
                />
              ) : (
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-3 border border-primary/10">
                  <Scissors className="w-7 h-7" />
                </div>
              )}
              <h3 className="font-semibold text-sm font-sans">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
