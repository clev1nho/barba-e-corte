import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useFinancialTransactions,
  useFinancialSummary,
  useCreateFinancialTransaction,
  useUpdateFinancialTransaction,
  useDeleteFinancialTransaction,
  TransactionType,
  FinancialTransaction,
} from "@/hooks/useFinancialTransactions";
import { useBarbers } from "@/hooks/useBarbers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Link2,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const receitaCategoryOptions = [
  "Serviço",
  "Produto",
  "Outros",
];

const despesaCategoryOptions = [
  "Aluguel",
  "Luz",
  "Água",
  "Internet",
  "Materiais",
  "Manutenção",
  "Marketing",
  "Produtos",
  "Impostos",
  "Outros",
];

const paymentMethodOptions = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "outro", label: "Outro" },
];

type PeriodFilter = "hoje" | "semana" | "mes" | "30dias" | "personalizado";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Financeiro = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("mes");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);

  // Form state
  const [formType, setFormType] = useState<TransactionType>("receita");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formCategory, setFormCategory] = useState("Serviço");
  const [formDescription, setFormDescription] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("pix");
  const [formBarberId, setFormBarberId] = useState<string>("");

  const { data: barbers } = useBarbers();
  const createTransaction = useCreateFinancialTransaction();
  const updateTransaction = useUpdateFinancialTransaction();
  const deleteTransaction = useDeleteFinancialTransaction();

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    switch (periodFilter) {
      case "hoje":
        return {
          start: format(startOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
          end: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
        };
      case "semana":
        return {
          start: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss"),
          end: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss"),
        };
      case "mes":
        return {
          start: format(startOfMonth(now), "yyyy-MM-dd'T'HH:mm:ss"),
          end: format(endOfMonth(now), "yyyy-MM-dd'T'HH:mm:ss"),
        };
      case "30dias":
        return {
          start: format(startOfDay(subDays(now, 30)), "yyyy-MM-dd'T'HH:mm:ss"),
          end: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
        };
      case "personalizado":
        return {
          start: customStartDate ? `${customStartDate}T00:00:00` : undefined,
          end: customEndDate ? `${customEndDate}T23:59:59` : undefined,
        };
      default:
        return { start: undefined, end: undefined };
    }
  };

  const dateRange = getDateRange();
  const { data: transactions, isLoading } = useFinancialTransactions(
    dateRange.start,
    dateRange.end
  );
  const { data: summary } = useFinancialSummary(dateRange.start, dateRange.end);

  const resetForm = () => {
    setFormType("receita");
    setFormAmount("");
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormCategory("Serviço");
    setFormDescription("");
    setFormPaymentMethod("pix");
    setFormBarberId("");
    setEditingTransaction(null);
  };

  const handleOpenDialog = (transaction?: FinancialTransaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormType(transaction.type);
      setFormAmount(transaction.amount.toString());
      setFormDate(format(new Date(transaction.date), "yyyy-MM-dd"));
      setFormCategory(transaction.category);
      setFormDescription(transaction.description || "");
      setFormPaymentMethod(transaction.payment_method || "pix");
      setFormBarberId(transaction.barber_id || "");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }

    try {
      const transactionData = {
        type: formType,
        category: formCategory,
        description: formDescription || null,
        amount,
        payment_method: formPaymentMethod,
        date: `${formDate}T12:00:00`,
        barber_id: formBarberId || null,
      };

      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          ...transactionData,
        });
        toast({ title: "Transação atualizada com sucesso" });
      } else {
        await createTransaction.mutateAsync(transactionData);
        toast({ title: "Transação criada com sucesso" });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao salvar transação",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast({ title: "Transação excluída com sucesso" });
    } catch (error) {
      toast({
        title: "Erro ao excluir transação",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Financeiro">
      <div className="space-y-6">
        {/* Period Filters */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: "hoje", label: "Hoje" },
              { value: "semana", label: "Esta semana" },
              { value: "mes", label: "Este mês" },
              { value: "30dias", label: "Últimos 30 dias" },
              { value: "personalizado", label: "Personalizado" },
            ].map((period) => (
              <Button
                key={period.value}
                variant={periodFilter === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodFilter(period.value as PeriodFilter)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {periodFilter === "personalizado" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="startDate">Data inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate">Data final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Receitas</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(summary?.totalReceitas || 0)}
            </p>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-sm text-muted-foreground">Despesas</span>
            </div>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(summary?.totalDespesas || 0)}
            </p>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Lucro</span>
            </div>
            <p
              className={`text-xl font-bold ${
                (summary?.lucro || 0) >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatCurrency(summary?.lucro || 0)}
            </p>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Atendimentos</span>
            </div>
            <p className="text-xl font-bold text-blue-400">
              {summary?.atendimentosPagos || 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Movimentações
          </h2>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "Editar" : "Nova"} movimentação
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={formType} 
                      onValueChange={(v) => {
                        const newType = v as TransactionType;
                        setFormType(newType);
                        // Reset category when type changes
                        setFormCategory(newType === "receita" ? "Serviço" : "Aluguel");
                      }}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(formType === "receita" ? receitaCategoryOptions : despesaCategoryOptions).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição da movimentação..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Forma de pagamento</Label>
                  <Select value={formPaymentMethod} onValueChange={setFormPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="barber">Profissional (opcional)</Label>
                  <Select 
                    value={formBarberId || "none"} 
                    onValueChange={(v) => setFormBarberId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger id="barber">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {barbers?.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createTransaction.isPending || updateTransaction.isPending}
                  >
                    {editingTransaction ? "Salvar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma movimentação no período selecionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions?.map((transaction) => (
                <div key={transaction.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            transaction.type === "receita"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transaction.type === "receita" ? "Receita" : "Despesa"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.category}
                        </span>
                        {transaction.appointment_id && (
                          <span title="Vinculado a agendamento">
                            <Link2 className="w-3 h-3 text-primary" />
                          </span>
                        )}
                      </div>

                      <p className="font-medium">{transaction.description || "-"}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {transaction.payment_method && (
                          <span>
                            {paymentMethodOptions.find(
                              (m) => m.value === transaction.payment_method
                            )?.label || transaction.payment_method}
                          </span>
                        )}
                        {transaction.barbers?.name && (
                          <span>{transaction.barbers.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "receita"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.type === "despesa" && "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(transaction)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A transação será
                            permanentemente excluída.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(transaction.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
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
      </div>
    </AdminLayout>
  );
};

export default Financeiro;
