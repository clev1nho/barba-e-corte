/**
 * Catalog of translations for dynamic content from the database.
 * 
 * HOW TO USE:
 * 1. Find the category or service ID in your database
 * 2. Add entries below with en/es translations
 * 3. PT text always comes from the database (fallback)
 * 
 * If a translation is missing for a given ID, the original PT text from the DB is shown.
 */

export interface TranslatedText {
  en?: string;
  es?: string;
}

/**
 * Category translations by category ID.
 * Example:
 * "uuid-of-category": { name: { en: "Haircuts", es: "Cortes de pelo" } }
 */
export const categoryTranslations: Record<string, { name: TranslatedText }> = {
  // Add your category translations here by ID:
  // "category-uuid-1": { name: { en: "Haircuts", es: "Cortes" } },
  // "category-uuid-2": { name: { en: "Beard", es: "Barba" } },
};

/**
 * Service translations by service ID.
 * Example:
 * "uuid-of-service": { 
 *   name: { en: "Classic Cut", es: "Corte Clásico" },
 *   description: { en: "Traditional haircut", es: "Corte tradicional" }
 * }
 */
export const serviceTranslations: Record<string, { 
  name: TranslatedText; 
  description?: TranslatedText;
}> = {
  // Add your service translations here by ID:
  // "service-uuid-1": { 
  //   name: { en: "Classic Cut", es: "Corte Clásico" },
  //   description: { en: "Traditional men's haircut", es: "Corte tradicional de caballero" }
  // },
};

/**
 * Shop settings overrides for EN/ES.
 * These override the DB values when the user selects EN or ES.
 * PT always uses the DB values directly.
 */
export const shopSettingsOverrides: Record<"en" | "es", {
  subtitle?: string;
  about_description?: string;
  services_section_title?: string;
  services_section_subtitle?: string;
  opening_hours?: string;
  pix_message?: string;
  highlight_points?: string[];
}> = {
  en: {
    // subtitle: "Top-level cuts and professional service",
    // about_description: "A barbershop dedicated to the modern man...",
    // services_section_title: "Our Services",
    // services_section_subtitle: "Specialized grooming for the modern man",
    // opening_hours: "Mon-Fri: 9am-7pm | Sat: 9am-6pm",
    // pix_message: "Make the deposit via Pix to confirm your appointment.",
    // highlight_points: ["Avoid lines", "Choose your barber", "Get confirmation", "Professional experience"],
  },
  es: {
    // subtitle: "Cortes de alto nivel y atención profesional",
    // about_description: "Una barbería dedicada al hombre moderno...",
    // services_section_title: "Nuestros Servicios",
    // services_section_subtitle: "Cuidados especializados para el hombre moderno",
    // opening_hours: "Lun-Vie: 9am-7pm | Sáb: 9am-6pm",
    // pix_message: "Realiza la seña por Pix para confirmar tu reserva.",
    // highlight_points: ["Evita filas", "Elige tu barbero", "Recibe confirmación", "Experiencia profesional"],
  },
};
