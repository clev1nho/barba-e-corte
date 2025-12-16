import { useState } from "react";
import { useBarbers } from "@/hooks/useBarbers";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useCommissionRates, useUpsertCommissionRate } from "@/hooks/useCommissionRates";
import { useBarberCommissions } from "@/hooks/useBarberCommissions";
import { useShopSettings } from "@/hooks/useShopSettings";
import { useUpdateShopSettings } from "@/hooks/useShopSettingsMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { Percent, Users, Settings, Loader2 } from "lucide-react";

interface PaymentMethodFees {
  pix: number;
  cash: number;
  debit: number;
  credit: number;
}

interface CommissionsSectionProps {
  startDate?: string;
  endDate?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function CommissionsSection({ startDate, endDate }: CommissionsSectionProps) {
  const { data: barbers } = useBarbers();
  const { data: categories } = useServiceCategories();
  const { data: commissionRates } = useCommissionRates();
  const { data: calculatedCommissions, isLoading: commissionsLoading } = useBarberCommissions(
    startDate,
    endDate
  );
  const { data: shopSettings } = useShopSettings();
  const updateSettings = useUpdateShopSettings();
  const upsertRate = useUpsertCommissionRate();

  // Local state for fees
  const [fees, setFees] = useState<PaymentMethodFees>({
    pix: 0,
    cash: 0,
    debit: 0,
    credit: 0,
  });
  const [feesLoaded, setFeesLoaded] = useState(false);

  // Load fees from shop settings
  if (shopSettings && !feesLoaded) {
    const savedFees = shopSettings.payment_method_fees as PaymentMethodFees | null;
    if (savedFees) {
      setFees({
        pix: savedFees.pix ?? 0,
        cash: savedFees.cash ?? 0,
        debit: savedFees.debit ?? 0,
        credit: savedFees.credit ?? 0,
      });
    }
    setFeesLoaded(true);
  }

  // Get commission rate for a barber/category
  const getRate = (barberId: string, categoryId: string): number => {
    const rate = commissionRates?.find(
      (r) => r.barber_id === barberId && r.category_id === categoryId
    );
    return rate?.commission_percent ?? 0;
  };

  // Get calculated commission for a barber
  const getCalculatedCommission = (barberId: string) => {
    return calculatedCommissions?.find((c) => c.barber_id === barberId);
  };

  // Save fees
  const handleSaveFees = async () => {
    if (!shopSettings?.id) {
      toast({ title: "Configurações não carregadas", variant: "destructive" });
      return;
    }

    // Validate fees
    for (const key of ["pix", "cash", "debit", "credit"] as const) {
      if (fees[key] < 0 || fees[key] > 100) {
        toast({ title: `Taxa de ${key} deve estar entre 0 e 100%`, variant: "destructive" });
        return;
      }
    }

    try {
      await updateSettings.mutateAsync({
        id: shopSettings.id,
        name: shopSettings.name,
        payment_method_fees: fees,
      });
      toast({ title: "Taxas salvas com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao salvar taxas", variant: "destructive" });
    }
  };

  // Save commission rate
  const handleSaveRate = async (barberId: string, categoryId: string, percent: number) => {
    if (percent < 0 || percent > 100) {
      toast({ title: "Comissão deve estar entre 0 e 100%", variant: "destructive" });
      return;
    }

    try {
      await upsertRate.mutateAsync({
        barber_id: barberId,
        category_id: categoryId,
        commission_percent: percent,
      });
      toast({ title: "Comissão salva" });
    } catch (error) {
      toast({ title: "Erro ao salvar comissão", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Fees Section */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          Taxas por forma de pagamento
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure as taxas que serão descontadas da comissão do barbeiro por forma de pagamento.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="fee-pix">PIX (%)</Label>
            <Input
              id="fee-pix"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={fees.pix}
              onChange={(e) => setFees({ ...fees, pix: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="fee-cash">Dinheiro (%)</Label>
            <Input
              id="fee-cash"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={fees.cash}
              onChange={(e) => setFees({ ...fees, cash: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="fee-debit">Débito (%)</Label>
            <Input
              id="fee-debit"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={fees.debit}
              onChange={(e) => setFees({ ...fees, debit: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="fee-credit">Crédito (%)</Label>
            <Input
              id="fee-credit"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={fees.credit}
              onChange={(e) => setFees({ ...fees, credit: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <Button
          onClick={handleSaveFees}
          disabled={updateSettings.isPending}
          size="sm"
        >
          {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar taxas
        </Button>
      </div>

      {/* Commissions per Barber Section */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          Comissões por barbeiro
        </h3>

        {commissionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : barbers?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Nenhum barbeiro cadastrado.
          </p>
        ) : (
          <div className="space-y-4">
            {barbers?.map((barber) => {
              const calculated = getCalculatedCommission(barber.id);
              return (
                <div key={barber.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{barber.name}</h4>
                      {calculated && (
                        <p className="text-sm text-muted-foreground">
                          Comissão no período:{" "}
                          <span className="font-semibold text-green-400">
                            {formatCurrency(calculated.commission_net)}
                          </span>
                          {calculated.commission_gross !== calculated.commission_net && (
                            <span className="text-xs ml-1">
                              (bruto: {formatCurrency(calculated.commission_gross)})
                            </span>
                          )}
                        </p>
                      )}
                      {!calculated && (
                        <p className="text-sm text-muted-foreground">
                          Sem comissões no período
                        </p>
                      )}
                    </div>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="config" className="border-none">
                      <AccordionTrigger className="py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          Configurar comissões por categoria
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {categories?.map((category) => {
                            const currentRate = getRate(barber.id, category.id);
                            return (
                              <div
                                key={category.id}
                                className="flex items-center gap-3"
                              >
                                <span className="text-sm flex-1">{category.name}</span>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-20 h-8 text-sm"
                                    defaultValue={currentRate}
                                    onBlur={(e) => {
                                      const newValue = parseFloat(e.target.value) || 0;
                                      if (newValue !== currentRate) {
                                        handleSaveRate(barber.id, category.id, newValue);
                                      }
                                    }}
                                  />
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                              </div>
                            );
                          })}
                          {(!categories || categories.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma categoria de serviço cadastrada.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Breakdown by category (if has commissions) */}
                  {calculated && calculated.breakdown.length > 0 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="breakdown" className="border-none">
                        <AccordionTrigger className="py-2 text-sm text-muted-foreground">
                          Ver detalhes por categoria
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {calculated.breakdown.map((cat) => (
                              <div
                                key={cat.category_id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{cat.category_name}</span>
                                <span className="text-green-400">
                                  {formatCurrency(cat.net)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
