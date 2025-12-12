import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Scissors } from "lucide-react";

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

  const isLoading = loadingCategories || loadingSettings;

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Nossos Serviços</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full mb-3" />
                <div className="h-5 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter only home_enabled categories
  const enabledCategories = (categories as ExtendedCategory[] | undefined)?.filter(
    (cat) => cat.home_enabled !== false
  ) || [];

  if (!enabledCategories.length) return null;

  const sectionTitle = settings?.services_section_title || "Nossos Serviços";
  const sectionSubtitle = settings?.services_section_subtitle || "Cuidados especializados para o homem moderno";

  return (
    <section className="py-16 px-4" id="servicos">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">{sectionTitle}</h2>
        {sectionSubtitle && (
          <p className="text-muted-foreground text-center mb-8">
            {sectionSubtitle}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {enabledCategories.map((category, index) => (
            <div
              key={category.id}
              className="glass-card rounded-xl p-5 text-center transition-all hover:bg-primary/10 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {category.icon_image_url ? (
                <img
                  src={category.icon_image_url}
                  alt={category.name}
                  className="w-16 h-16 object-contain rounded-md mb-3 mx-auto"
                />
              ) : (
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary mb-3">
                  <Scissors className="w-8 h-8" />
                </div>
              )}
              <h3 className="font-semibold text-sm">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
