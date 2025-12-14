import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useServicesWithCategories, ServiceWithCategory } from "@/hooks/useServicesWithCategories";
import { useServiceCategories, ServiceCategory } from "@/hooks/useServiceCategories";
import { useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServiceMutations";
import { useCreateServiceCategory, useUpdateServiceCategory, useDeleteServiceCategory } from "@/hooks/useServiceCategoryMutations";
import { Plus, Pencil, Trash2, Scissors, Clock, DollarSign, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";

interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  active: boolean;
  category_id: string | null;
}

interface CategoryFormData {
  name: string;
  display_order: number;
  home_enabled: boolean;
}

const emptyServiceForm: ServiceFormData = {
  name: "",
  description: "",
  duration_minutes: 30,
  price: 0,
  deposit_amount: 0,
  active: true,
  category_id: null,
};

const emptyCategoryForm: CategoryFormData = {
  name: "",
  display_order: 0,
  home_enabled: true,
};

const Servicos = () => {
  const { data: services, isLoading: loadingServices } = useServicesWithCategories(false);
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();

  // Service dialog state
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceWithCategory | null>(null);
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>(emptyServiceForm);

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(emptyCategoryForm);

  // Accordion state for categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Service handlers
  const openCreateServiceDialog = () => {
    setEditingService(null);
    setServiceFormData(emptyServiceForm);
    setIsServiceDialogOpen(true);
  };

  const openEditServiceDialog = (service: ServiceWithCategory) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      price: service.price,
      deposit_amount: service.deposit_amount ?? 0,
      active: service.active ?? true,
      category_id: service.category_id,
    });
    setIsServiceDialogOpen(true);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceFormData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    const data = {
      ...serviceFormData,
      category_id: serviceFormData.category_id === "none" ? null : serviceFormData.category_id,
    };

    if (editingService) {
      updateService.mutate(
        { id: editingService.id, ...data },
        {
          onSuccess: () => {
            toast({ title: "Serviço atualizado com sucesso" });
            setIsServiceDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro ao atualizar serviço", variant: "destructive" });
          },
        }
      );
    } else {
      createService.mutate(data, {
        onSuccess: () => {
          toast({ title: "Serviço criado com sucesso" });
          setIsServiceDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Erro ao criar serviço", variant: "destructive" });
        },
      });
    }
  };

  const handleDeleteService = (id: string) => {
    deleteService.mutate(id, {
      onSuccess: () => {
        toast({ title: "Serviço excluído com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir serviço", variant: "destructive" });
      },
    });
  };

  // Category handlers
  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    const nextOrder = categories?.length ? Math.max(...categories.map(c => c.display_order ?? 0)) + 1 : 0;
    setCategoryFormData({ ...emptyCategoryForm, display_order: nextOrder });
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      display_order: category.display_order ?? 0,
      home_enabled: category.home_enabled ?? true,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryFormData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, ...categoryFormData },
        {
          onSuccess: () => {
            toast({ title: "Categoria atualizada com sucesso" });
            setIsCategoryDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro ao atualizar categoria", variant: "destructive" });
          },
        }
      );
    } else {
      createCategory.mutate(categoryFormData, {
        onSuccess: () => {
          toast({ title: "Categoria criada com sucesso" });
          setIsCategoryDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Erro ao criar categoria", variant: "destructive" });
        },
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => {
        toast({ title: "Categoria excluída com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir categoria", variant: "destructive" });
      },
    });
  };

  // Group services by category
  const groupedServices = () => {
    if (!services) return [];
    
    const groups: { category: ServiceCategory | null; services: ServiceWithCategory[] }[] = [];
    const sortedCategories = [...(categories || [])].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
    
    // Add categorized services
    sortedCategories.forEach(cat => {
      const catServices = services.filter(s => s.category_id === cat.id);
      if (catServices.length > 0 || true) { // Show all categories even if empty
        groups.push({ category: cat, services: catServices });
      }
    });
    
    // Add uncategorized services
    const uncategorized = services.filter(s => !s.category_id);
    if (uncategorized.length > 0) {
      groups.push({ category: null, services: uncategorized });
    }
    
    return groups;
  };

  return (
    <AdminLayout title="Serviços">
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {services?.length || 0} serviço(s) cadastrado(s)
            </p>
            <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateServiceDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Editar Serviço" : "Novo Serviço"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={serviceFormData.name}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                      placeholder="Ex: Corte Masculino"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={serviceFormData.category_id || "none"} 
                      onValueChange={(value) => setServiceFormData({ ...serviceFormData, category_id: value === "none" ? null : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={serviceFormData.description}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                      placeholder="Descrição do serviço..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (min)</Label>
                      <Input
                        id="duration"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={serviceFormData.duration_minutes === 0 ? "" : serviceFormData.duration_minutes.toString()}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d+$/.test(value)) {
                            setServiceFormData({ ...serviceFormData, duration_minutes: value === "" ? 0 : parseInt(value, 10) });
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (isNaN(value) || value < 5) {
                            setServiceFormData({ ...serviceFormData, duration_minutes: 5 });
                          }
                        }}
                        placeholder="30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="text"
                        inputMode="decimal"
                        value={serviceFormData.price === 0 ? "" : serviceFormData.price.toString()}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setServiceFormData({ ...serviceFormData, price: value === "" ? 0 : parseFloat(value) || 0 });
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit_amount">Sinal (R$)</Label>
                    <Input
                      id="deposit_amount"
                      type="text"
                      inputMode="decimal"
                      value={serviceFormData.deposit_amount === 0 ? "" : serviceFormData.deposit_amount.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setServiceFormData({ ...serviceFormData, deposit_amount: value === "" ? 0 : parseFloat(value) || 0 });
                        }
                      }}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">Valor do sinal obrigatório via Pix. Deixe 0 para não exigir.</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Ativo</Label>
                    <Switch
                      id="active"
                      checked={serviceFormData.active}
                      onCheckedChange={(checked) => setServiceFormData({ ...serviceFormData, active: checked })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={createService.isPending || updateService.isPending}>
                      {editingService ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services List - Grouped by Category */}
          {loadingServices || loadingCategories ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : services?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
              <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum serviço cadastrado</p>
              <Button onClick={openCreateServiceDialog} className="mt-4">
                Criar primeiro serviço
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedServices().map((group) => {
                const categoryId = group.category?.id || "uncategorized";
                const categoryName = group.category?.name || "Sem categoria";
                const isExpanded = expandedCategories[categoryId] ?? true;

                return (
                  <div key={categoryId} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{categoryName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({group.services.length})
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border">
                        {group.services.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">Nenhum serviço nesta categoria</p>
                        ) : (
                          group.services.map((service) => (
                            <div
                              key={service.id}
                              className={`p-4 border-b border-border/50 last:border-b-0 ${!service.active ? "opacity-60" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{service.name}</h3>
                                    {!service.active && (
                                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativo</span>
                                    )}
                                  </div>
                                  {service.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm flex-wrap">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      {service.duration_minutes} min
                                    </span>
                                    <span className="flex items-center gap-1 text-primary font-semibold">
                                      <DollarSign className="w-4 h-4" />
                                      R$ {service.price.toFixed(2)}
                                    </span>
                                    {(service.deposit_amount ?? 0) > 0 && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        Sinal: R$ {(service.deposit_amount ?? 0).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => openEditServiceDialog(service)}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta ação não pode ser desfeita. O serviço "{service.name}" será permanentemente excluído.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteService(service.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {categories?.length || 0} categoria(s) cadastrada(s)
            </p>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateCategoryDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Nome *</Label>
                    <Input
                      id="cat-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="Ex: Barbearia, Massagens"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cat-order">Ordem de exibição</Label>
                    <Input
                      id="cat-order"
                      type="number"
                      value={categoryFormData.display_order}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Menor número = aparece primeiro</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="cat-enabled">Exibir na home</Label>
                    <Switch
                      id="cat-enabled"
                      checked={categoryFormData.home_enabled}
                      onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, home_enabled: checked })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={createCategory.isPending || updateCategory.isPending}>
                      {editingCategory ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories List */}
          {loadingCategories ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : categories?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma categoria cadastrada</p>
              <Button onClick={openCreateCategoryDialog} className="mt-4">
                Criar primeira categoria
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[...(categories || [])].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)).map((category) => {
                const servicesCount = services?.filter(s => s.category_id === category.id).length || 0;
                
                return (
                  <div
                    key={category.id}
                    className={`glass-card rounded-xl p-4 ${!category.home_enabled ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FolderOpen className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          {!category.home_enabled && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Oculto na home</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Ordem: {category.display_order}
                          </span>
                          <span className="text-muted-foreground">
                            {servicesCount} serviço(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditCategoryDialog(category)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                              <AlertDialogDescription>
                                A categoria "{category.name}" será excluída. Os serviços vinculados ficarão sem categoria e aparecerão em "Outros" no agendamento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
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
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Servicos;