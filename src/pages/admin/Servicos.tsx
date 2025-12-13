import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useServices, Service } from "@/hooks/useServices";
import { useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServiceMutations";
import { Plus, Pencil, Trash2, Scissors, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
}

const emptyForm: ServiceFormData = {
  name: "",
  description: "",
  duration_minutes: 30,
  price: 0,
  deposit_amount: 0,
  active: true,
};

const Servicos = () => {
  const { data: services, isLoading } = useServices(false);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(emptyForm);

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      price: service.price,
      deposit_amount: (service as any).deposit_amount ?? 0,
      active: service.active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingService) {
      updateService.mutate(
        { id: editingService.id, ...formData },
        {
          onSuccess: () => {
            toast({ title: "Serviço atualizado com sucesso" });
            setIsDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro ao atualizar serviço", variant: "destructive" });
          },
        }
      );
    } else {
      createService.mutate(formData, {
        onSuccess: () => {
          toast({ title: "Serviço criado com sucesso" });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Erro ao criar serviço", variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteService.mutate(id, {
      onSuccess: () => {
        toast({ title: "Serviço excluído com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir serviço", variant: "destructive" });
      },
    });
  };

  return (
    <AdminLayout title="Serviços">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {services?.length || 0} serviço(s) cadastrado(s)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Corte Masculino"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      value={formData.duration_minutes === 0 ? "" : formData.duration_minutes.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setFormData({ ...formData, duration_minutes: value === "" ? 0 : parseInt(value, 10) });
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (isNaN(value) || value < 5) {
                          setFormData({ ...formData, duration_minutes: 5 });
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
                      value={formData.price === 0 ? "" : formData.price.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setFormData({ ...formData, price: value === "" ? 0 : parseFloat(value) || 0 });
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
                    value={formData.deposit_amount === 0 ? "" : formData.deposit_amount.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setFormData({ ...formData, deposit_amount: value === "" ? 0 : parseFloat(value) || 0 });
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
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
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

        {/* Services List */}
        {isLoading ? (
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
            <Button onClick={openCreateDialog} className="mt-4">
              Criar primeiro serviço
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services?.map((service) => (
              <div
                key={service.id}
                className={`glass-card rounded-xl p-4 ${!service.active ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
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
                      {(service as any).deposit_amount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Sinal: R$ {((service as any).deposit_amount as number).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
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
                            onClick={() => handleDelete(service.id)}
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
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Servicos;
