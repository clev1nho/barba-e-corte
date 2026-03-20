import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, Dictionary } from "./types";
import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";
import { categoryTranslations, serviceTranslations, shopSettingsOverrides } from "./catalog";

const STORAGE_KEY = "site_lang";

const dictionaries: Record<Language, Dictionary> = { pt, en, es };

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language?.toLowerCase() || "";
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("en")) return "en";
  return "pt";
}

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && dictionaries[stored]) return stored;
  return detectBrowserLanguage();
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Dictionary;
  translateCategory: (id: string, ptName: string) => string;
  translateService: (id: string, ptName: string) => string;
  translateServiceDescription: (id: string, ptDesc: string | null) => string | null;
  translateShopField: <K extends keyof typeof shopSettingsOverrides["en"]>(
    field: K,
    ptValue: any
  ) => any;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  // Persist on first load if not stored
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const t = dictionaries[lang];

  const translateCategory = (id: string, ptName: string): string => {
    if (lang === "pt") return ptName;
    return categoryTranslations[id]?.name?.[lang] || ptName;
  };

  const translateService = (id: string, ptName: string): string => {
    if (lang === "pt") return ptName;
    return serviceTranslations[id]?.name?.[lang] || ptName;
  };

  const translateServiceDescription = (id: string, ptDesc: string | null): string | null => {
    if (lang === "pt" || !ptDesc) return ptDesc;
    return serviceTranslations[id]?.description?.[lang] || ptDesc;
  };

  const translateShopField = (field: string, ptValue: any): any => {
    if (lang === "pt") return ptValue;
    const overrides = shopSettingsOverrides[lang];
    const override = (overrides as any)?.[field];
    return override !== undefined && override !== null ? override : ptValue;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateCategory, translateService, translateServiceDescription, translateShopField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
