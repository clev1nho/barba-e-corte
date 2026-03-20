import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Scissors } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t, translateShopField, translateCategory } = useLanguage();

  const isLoading = loadingCategories || loadingSettings;

  if (isLoading) {
    return (
      <section className="section-premium">
        <div className="max-w-lg mx-auto">
          <div className="premium-divider" />
          <h2 className="section-heading">{t.services_default_title}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="w-14 h-14 bg-muted rounded-full mb-3 mx-auto" />
                <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
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

  const sectionTitle = translateShopField("services_section_title", settings?.services_section_title) || t.services_default_title;
  const sectionSubtitle = translateShopField("services_section_subtitle", settings?.services_section_subtitle) || t.services_default_subtitle;

  return (
    <section className="section-premium" id="servicos">
      <div className="max-w-lg mx-auto">
        <div className="premium-divider" />
        <h2 className="section-heading">{sectionTitle}</h2>
        {sectionSubtitle && (
          <p className="section-subheading">{sectionSubtitle}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {enabledCategories.map((category, index) => (
            <div
              key={category.id}
              className="glass-card-hover rounded-2xl p-5 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {category.icon_image_url ? (
                <img
                  src={category.icon_image_url}
                  alt={translateCategory(category.id, category.name)}
                  className="w-16 h-16 object-contain rounded-lg mb-3 mx-auto"
                />
              ) : (
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 text-primary mb-3">
                  <Scissors className="w-7 h-7" />
                </div>
              )}
              <h3 className="font-semibold text-sm font-sans">{translateCategory(category.id, category.name)}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
