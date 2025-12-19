import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useShopSettings } from "@/hooks/useShopSettings";
import { useUpdateShopSettings } from "@/hooks/useShopSettingsMutations";
import {
  useUpdateServiceCategory,
  useCreateServiceCategory,
  useDeleteServiceCategory,
} from "@/hooks/useServiceCategoryMutations";
import { ServiceCategoryIconUpload } from "@/components/admin/ServiceCategoryIconUpload";
import { AdminHomeCardsManager } from "@/components/admin/AdminHomeCardsManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  LayoutGrid,
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
} from "lucide-react";
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

interface CategoryFormItem {
  id: string;
  name: string;
  display_order: number;
  icon_image_url: string | null;
  home_enabled: boolean;
  isNew?: boolean;
}

const CategoriasHome = () => {
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: settings, isLoading: loadingSettings } = useShopSettings();
  const updateSettings = useUpdateShopSettings();
  const updateCategory = useUpdateServiceCategory();
  const createCategory = useCreateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();

  const [sectionTitle, setSectionTitle] = useState("Nossos Serviços");
  const [sectionSubtitle, setSectionSubtitle] = useState(
    "Cuidados especializados para o homem moderno"
  );
  const [items, setItems] = useState<CategoryFormItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSectionTitle(settings.services_section_title || "Nossos Serviços");
      setSectionSubtitle(
        settings.services_section_subtitle ||
          "Cuidados especializados para o homem moderno"
      );
    }
  }, [settings]);

  useEffect(() => {
    if (categories) {
      setItems(
        categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          display_order: cat.display_order,
          icon_image_url: (cat as any).icon_image_url || null,
          home_enabled: (cat as any).home_enabled ?? true,
        }))
      );
    }
  }, [categories]);

  const handleAddCategory = () => {
    const newId = `new-${Date.now()}`;
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) : 0;
    setItems([
      ...items,
      {
        id: newId,
        name: "",
        display_order: maxOrder + 1,
        icon_image_url: null,
        home_enabled: true,
        isNew: true,
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof CategoryFormItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index].display_order;
    newItems[index].display_order = newItems[index - 1].display_order;
    newItems[index - 1].display_order = temp;
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index].display_order;
    newItems[index].display_order = newItems[index + 1].display_order;
    newItems[index + 1].display_order = temp;
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  const handleRemoveItem = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    try {
      await deleteCategory.mutateAsync(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Categoria removida" });
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      toast({ title: "Erro ao remover categoria", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    // Validate
    const emptyNames = items.filter((i) => !i.name.trim());
    if (emptyNames.length > 0) {
      toast({
        title: "Preencha o nome de todas as categorias",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Save section title/subtitle
      await updateSettings.mutateAsync({
        id: settings?.id,
        name: settings?.name || "Barbearia",
        services_section_title: sectionTitle.trim() || null,
        services_section_subtitle: sectionSubtitle.trim() || null,
      });

      // Save each category
      for (const item of items) {
        if (item.isNew) {
          await createCategory.mutateAsync({
            name: item.name,
            display_order: item.display_order,
            icon_image_url: item.icon_image_url,
            home_enabled: item.home_enabled,
          });
        } else {
          await updateCategory.mutateAsync({
            id: item.id,
            name: item.name,
            display_order: item.display_order,
            icon_image_url: item.icon_image_url,
            home_enabled: item.home_enabled,
          });
        }
      }

      toast({ title: "Alterações salvas com sucesso" });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({ title: "Erro ao salvar alterações", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loadingCategories || loadingSettings;

  if (isLoading) {
    return (
      <AdminLayout title="Categorias da Home">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categorias da Home">
      <div className="space-y-6">
        {/* Section Title/Subtitle */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Textos da Seção
          </h2>

          <div className="space-y-2">
            <Label htmlFor="sectionTitle">Título da Seção</Label>
            <Input
              id="sectionTitle"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Nossos Serviços"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectionSubtitle">Subtítulo da Seção</Label>
            <Input
              id="sectionSubtitle"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="Cuidados especializados para o homem moderno"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="glass-card rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Categorias
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Upload */}
                    <ServiceCategoryIconUpload
                      categoryId={item.id}
                      currentIconUrl={item.icon_image_url}
                      onIconChange={(url) =>
                        handleUpdateItem(item.id, "icon_image_url", url)
                      }
                    />

                    {/* Name Input */}
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Nome</Label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "name", e.target.value)
                        }
                        placeholder="Nome da categoria"
                      />
                    </div>

                    {/* Order buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === items.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom row: toggle + delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.home_enabled}
                        onCheckedChange={(checked) =>
                          handleUpdateItem(item.id, "home_enabled", checked)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        Exibir na Home
                      </span>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A categoria será removida
                            permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveItem(item.id, item.isNew)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Alterações
        </Button>

        {/* Home Cards Section */}
        <AdminHomeCardsManager />
      </div>
    </AdminLayout>
  );
};

export default CategoriasHome;
