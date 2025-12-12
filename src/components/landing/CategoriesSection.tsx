import { useServiceCategories, ServiceCategory } from "@/hooks/useServiceCategories";
import { Scissors, Zap, FlameKindling, Sparkles, Hand } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  "Barbearia": <Scissors className="w-8 h-8" />,
  "DEPILAÇÃO COM MÁQUINA": <Zap className="w-8 h-8" />,
  "DEPILAÇÃO COM CERA": <FlameKindling className="w-8 h-8" />,
  "Massagens": <Hand className="w-8 h-8" />,
  "ESFOLIAÇÃO": <Sparkles className="w-8 h-8" />,
};

export function CategoriesSection() {
  const { data: categories, isLoading } = useServiceCategories();

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

  if (!categories?.length) return null;

  return (
    <section className="py-16 px-4" id="servicos">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Nossos Serviços</h2>
        <p className="text-muted-foreground text-center mb-8">
          Cuidados especializados para o homem moderno
        </p>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="glass-card rounded-xl p-5 text-center transition-all hover:bg-primary/10 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary mb-3">
                {categoryIcons[category.name] || <Scissors className="w-8 h-8" />}
              </div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
