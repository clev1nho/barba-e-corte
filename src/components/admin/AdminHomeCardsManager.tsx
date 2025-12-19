import { useState } from "react";
import {
  useHomeCards,
  useCreateHomeCard,
  useUpdateHomeCard,
  useDeleteHomeCard,
  HomeCard,
} from "@/hooks/useHomeCards";
import { HomeCardFormModal } from "./HomeCardFormModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  LayoutGrid,
  Pencil,
  MessageCircle,
  Lock,
  Globe,
  Instagram,
  MessageSquare,
  Link2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ICON_MAP: Record<string, LucideIcon> = {
  message: MessageCircle,
  lock: Lock,
  globe: Globe,
  instagram: Instagram,
  whatsapp: MessageSquare,
  link: Link2,
};

export function AdminHomeCardsManager() {
  const { data: cards, isLoading } = useHomeCards();
  const createCard = useCreateHomeCard();
  const updateCard = useUpdateHomeCard();
  const deleteCard = useDeleteHomeCard();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomeCard | null>(null);

  const handleCreate = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleEdit = (card: HomeCard) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<HomeCard, "id" | "created_at" | "updated_at">) => {
    if (editingCard) {
      await updateCard.mutateAsync({ id: editingCard.id, ...data });
      toast({ title: "Card atualizado" });
    } else {
      // Verificar limite de 4 cards ativos
      const activeCount = cards?.filter((c) => c.is_active).length || 0;
      if (data.is_active && activeCount >= 4) {
        toast({
          title: "Limite atingido",
          description: "Já existem 4 cards ativos. Desative um para ativar este.",
          variant: "destructive",
        });
        return;
      }

      // Calcular display_order
      const maxOrder = cards?.length
        ? Math.max(...cards.map((c) => c.display_order))
        : -1;
      await createCard.mutateAsync({ ...data, display_order: maxOrder + 1 });
    }
  };

  const handleToggleActive = async (card: HomeCard) => {
    // Se está ativando, verificar limite
    if (!card.is_active) {
      const activeCount = cards?.filter((c) => c.is_active).length || 0;
      if (activeCount >= 4) {
        toast({
          title: "Limite atingido",
          description: "Já existem 4 cards ativos. Desative um primeiro.",
          variant: "destructive",
        });
        return;
      }
    }
    await updateCard.mutateAsync({ id: card.id, is_active: !card.is_active });
  };

  const handleMoveUp = async (index: number) => {
    if (!cards || index === 0) return;
    const current = cards[index];
    const prev = cards[index - 1];

    await updateCard.mutateAsync({ id: current.id, display_order: prev.display_order });
    await updateCard.mutateAsync({ id: prev.id, display_order: current.display_order });
  };

  const handleMoveDown = async (index: number) => {
    if (!cards || index === cards.length - 1) return;
    const current = cards[index];
    const next = cards[index + 1];

    await updateCard.mutateAsync({ id: current.id, display_order: next.display_order });
    await updateCard.mutateAsync({ id: next.id, display_order: current.display_order });
  };

  const handleDelete = async (id: string) => {
    await deleteCard.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = cards?.filter((c) => c.is_active).length || 0;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          Cards da Home
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        A Home exibe no máximo 4 cards ativos, por ordem. ({activeCount}/4 ativos)
      </p>

      {!cards?.length ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum card cadastrado.
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card, index) => {
            const IconComponent = ICON_MAP[card.icon_key] || MessageCircle;

            return (
              <div
                key={card.id}
                className={`border rounded-lg p-3 space-y-3 ${
                  card.is_active ? "border-primary/50" : "border-border opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Preview da imagem */}
                  <div className="w-16 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{card.title}</p>
                    {card.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {card.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Ordenação */}
                  <div className="flex flex-col gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === cards.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={card.is_active}
                      onCheckedChange={() => handleToggleActive(card)}
                    />
                    <span className="text-sm text-muted-foreground">Ativo</span>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(card)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover card?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(card.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HomeCardFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        card={editingCard}
        onSave={handleSave}
      />
    </div>
  );
}
