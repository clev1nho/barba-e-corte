import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBarbers, Barber } from "@/hooks/useBarbers";
import { useCreateBarber, useUpdateBarber, useDeleteBarber } from "@/hooks/useBarberMutations";
import { useBarberServices, useUpdateBarberServices } from "@/hooks/useBarberServices";
import { Plus, Pencil, Trash2, Users, Clock, Calendar, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarberPhotoUpload } from "@/components/admin/BarberPhotoUpload";
import { BarberServicesSelect } from "@/components/admin/BarberServicesSelect";
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

const daysOfWeek = [
  { id: "segunda", label: "Segunda" },
  { id: "terça", label: "Terça" },
  { id: "quarta", label: "Quarta" },
  { id: "quinta", label: "Quinta" },
  { id: "sexta", label: "Sexta" },
  { id: "sábado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

interface BarberFormData {
  name: string;
  bio: string;
  photo_url: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  active: boolean;
  service_ids: string[];
}

const emptyForm: BarberFormData = {
  name: "",
  bio: "",
  photo_url: "",
  start_time: "09:00",
  end_time: "19:00",
  days_of_week: ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
  active: true,
  service_ids: [],
};

const Barbeiros = () => {
  const { data: barbers, isLoading } = useBarbers(false);
  const createBarber = useCreateBarber();
  const updateBarber = useUpdateBarber();
  const deleteBarber = useDeleteBarber();
  const updateBarberServices = useUpdateBarberServices();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState<BarberFormData>(emptyForm);

  // Load barber services when editing
  const { data: barberServices } = useBarberServices(editingBarber?.id);

  useEffect(() => {
    if (editingBarber && barberServices) {
      setFormData(prev => ({
        ...prev,
        service_ids: barberServices.map(bs => bs.service_id),
      }));
    }
  }, [barberServices, editingBarber]);

  const openCreateDialog = () => {
    setEditingBarber(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      bio: barber.bio || "",
      photo_url: barber.photo_url || "",
      start_time: barber.start_time || "09:00",
      end_time: barber.end_time || "19:00",
      days_of_week: barber.days_of_week || [],
      active: barber.active ?? true,
      service_ids: [], // Will be loaded by useEffect
    });
    setIsDialogOpen(true);
  };

  const toggleDay = (day: string) => {
    const newDays = formData.days_of_week.includes(day)
      ? formData.days_of_week.filter((d) => d !== day)
      : [...formData.days_of_week, day];
    setFormData({ ...formData, days_of_week: newDays });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingBarber) {
      const { service_ids, ...barberData } = formData;
      updateBarber.mutate(
        { id: editingBarber.id, ...barberData },
        {
          onSuccess: async () => {
            // Update barber services
            await updateBarberServices.mutateAsync({
              barberId: editingBarber.id,
              serviceIds: service_ids,
            });
            toast({ title: "Barbeiro atualizado com sucesso" });
            setIsDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro ao atualizar barbeiro", variant: "destructive" });
          },
        }
      );
    } else {
      const { service_ids, ...barberData } = formData;
      createBarber.mutate(barberData, {
        onSuccess: async (data: any) => {
          // If we have service_ids, update them after creation
          if (service_ids.length > 0 && data?.id) {
            await updateBarberServices.mutateAsync({
              barberId: data.id,
              serviceIds: service_ids,
            });
          }
          toast({ title: "Barbeiro criado com sucesso" });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Erro ao criar barbeiro", variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteBarber.mutate(id, {
      onSuccess: () => {
        toast({ title: "Barbeiro excluído com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir barbeiro", variant: "destructive" });
      },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminLayout title="Barbeiros">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {barbers?.length || 0} barbeiro(s) cadastrado(s)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Barbeiro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="barber-dialog-description">
              <DialogHeader>
                <DialogTitle>
                  {editingBarber ? "Editar Barbeiro" : "Novo Barbeiro"}
                </DialogTitle>
                <p id="barber-dialog-description" className="text-sm text-muted-foreground">
                  {editingBarber ? "Atualize os dados do barbeiro" : "Preencha os dados do novo barbeiro"}
                </p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do barbeiro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Descrição do barbeiro..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Foto</Label>
                  <BarberPhotoUpload
                    currentPhotoUrl={formData.photo_url}
                    barberName={formData.name}
                    onPhotoChange={(url) => setFormData({ ...formData, photo_url: url })}
                    disabled={createBarber.isPending || updateBarber.isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Início</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">Término</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dias de trabalho</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.id}
                          checked={formData.days_of_week.includes(day.id)}
                          onCheckedChange={() => toggleDay(day.id)}
                        />
                        <Label htmlFor={day.id} className="text-sm font-normal cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Selection */}
                <BarberServicesSelect
                  selectedServiceIds={formData.service_ids}
                  onChange={(ids) => setFormData({ ...formData, service_ids: ids })}
                  disabled={createBarber.isPending || updateBarber.isPending}
                />

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
                  <Button type="submit" className="flex-1" disabled={createBarber.isPending || updateBarber.isPending}>
                    {editingBarber ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Barbers List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-12 bg-muted rounded-full w-12 mb-2" />
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : barbers?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum barbeiro cadastrado</p>
            <Button onClick={openCreateDialog} className="mt-4">
              Cadastrar primeiro barbeiro
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {barbers?.map((barber) => (
              <div
                key={barber.id}
                className={`glass-card rounded-xl p-4 ${!barber.active ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarImage src={barber.photo_url || undefined} alt={barber.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getInitials(barber.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{barber.name}</h3>
                      {!barber.active && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativo</span>
                      )}
                    </div>
                    {barber.bio && (
                      <p className="text-sm text-muted-foreground mb-2">{barber.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {barber.start_time} - {barber.end_time}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {barber.days_of_week?.length || 0} dias
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(barber)}>
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
                          <AlertDialogTitle>Excluir barbeiro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O barbeiro "{barber.name}" será permanentemente excluído.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(barber.id)}
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

export default Barbeiros;
