import { Globe } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Language } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  const current = LANGUAGES.find((l) => l.value === lang)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-foreground/70 hover:text-foreground">
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.value}
            onClick={() => setLang(l.value)}
            className={`gap-2 ${lang === l.value ? "bg-primary/10 text-primary" : ""}`}
          >
            <span>{l.flag}</span>
            <span className="text-sm">{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
