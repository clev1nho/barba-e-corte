import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BarberCommissionResult {
  barber_id: string;
  barber_name: string;
  commission_gross: number;
  commission_net: number;
  breakdown: {
    category_id: string;
    category_name: string;
    gross: number;
    net: number;
  }[];
}

interface PaymentMethodFees {
  pix: number;
  cash: number;
  debit: number;
  credit: number;
  [key: string]: number;
}

// Map from financial_transactions payment_method values to shop_settings fee keys
const paymentMethodToFeeKey: Record<string, keyof PaymentMethodFees> = {
  pix: "pix",
  dinheiro: "cash",
  cartao_debito: "debit",
  cartao_credito: "credit",
  outro: "cash", // default to cash (0%) for "outro"
};

export function useBarberCommissions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["barber_commissions_calculated", startDate, endDate],
    queryFn: async () => {
      // 1. Get shop settings with payment_method_fees
      const { data: shopSettings, error: shopError } = await supabase
        .from("shop_settings")
        .select("payment_method_fees")
        .limit(1)
        .maybeSingle();

      if (shopError) throw shopError;

      const fees: PaymentMethodFees = (shopSettings?.payment_method_fees as PaymentMethodFees) || {
        pix: 0,
        cash: 0,
        debit: 0,
        credit: 0,
      };

      // 2. Get commission rates
      const { data: commissionRates, error: ratesError } = await supabase
        .from("barber_commission_rates")
        .select("*");

      if (ratesError) throw ratesError;

      // Build a map: barber_id -> category_id -> commission_percent
      const ratesMap: Record<string, Record<string, number>> = {};
      commissionRates?.forEach((rate) => {
        if (!ratesMap[rate.barber_id]) {
          ratesMap[rate.barber_id] = {};
        }
        ratesMap[rate.barber_id][rate.category_id] = Number(rate.commission_percent) || 0;
      });

      // 3. Get paid transactions with appointment_id in the date range
      let txQuery = supabase
        .from("financial_transactions")
        .select("*")
        .eq("type", "receita")
        .not("appointment_id", "is", null);

      if (startDate) {
        txQuery = txQuery.gte("date", startDate);
      }
      if (endDate) {
        txQuery = txQuery.lte("date", endDate);
      }

      const { data: transactions, error: txError } = await txQuery;

      if (txError) throw txError;

      if (!transactions || transactions.length === 0) {
        return [];
      }

      // 4. Get all appointments for the transactions
      const appointmentIds = transactions
        .map((tx) => tx.appointment_id)
        .filter((id): id is string => !!id);

      if (appointmentIds.length === 0) {
        return [];
      }

      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select("id, barber_id, service_ids, total_price")
        .in("id", appointmentIds);

      if (aptError) throw aptError;

      // Build appointment map
      const appointmentMap: Record<string, typeof appointments[0]> = {};
      appointments?.forEach((apt) => {
        appointmentMap[apt.id] = apt;
      });

      // 5. Get all services to map service_id -> category_id and price
      const allServiceIds = new Set<string>();
      appointments?.forEach((apt) => {
        if (apt.service_ids && Array.isArray(apt.service_ids)) {
          apt.service_ids.forEach((sid: string) => allServiceIds.add(sid));
        }
      });

      let serviceMap: Record<string, { category_id: string | null; price: number }> = {};
      if (allServiceIds.size > 0) {
        const { data: services, error: svcError } = await supabase
          .from("services")
          .select("id, category_id, price")
          .in("id", Array.from(allServiceIds));

        if (svcError) throw svcError;

        services?.forEach((svc) => {
          serviceMap[svc.id] = {
            category_id: svc.category_id,
            price: Number(svc.price) || 0,
          };
        });
      }

      // 6. Get all barbers
      const { data: barbers, error: barbersError } = await supabase
        .from("barbers")
        .select("id, name");

      if (barbersError) throw barbersError;

      const barberNameMap: Record<string, string> = {};
      barbers?.forEach((b) => {
        barberNameMap[b.id] = b.name;
      });

      // 7. Get all categories
      const { data: categories, error: catError } = await supabase
        .from("service_categories")
        .select("id, name");

      if (catError) throw catError;

      const categoryNameMap: Record<string, string> = {};
      categories?.forEach((c) => {
        categoryNameMap[c.id] = c.name;
      });

      // 8. Calculate commissions
      const barberCommissions: Record<
        string,
        {
          gross: number;
          net: number;
          breakdown: Record<string, { gross: number; net: number }>;
        }
      > = {};

      transactions.forEach((tx) => {
        const apt = tx.appointment_id ? appointmentMap[tx.appointment_id] : null;
        if (!apt || !apt.barber_id) return;

        const barberId = apt.barber_id;
        const paymentMethod = tx.payment_method || "pix";
        const feeKey = paymentMethodToFeeKey[paymentMethod] || "cash";
        const feePercent = fees[feeKey] || 0;

        // Initialize barber entry if needed
        if (!barberCommissions[barberId]) {
          barberCommissions[barberId] = { gross: 0, net: 0, breakdown: {} };
        }

        // Get services from appointment
        const serviceIds = apt.service_ids as string[] | null;
        if (!serviceIds || serviceIds.length === 0) {
          console.log(`Appointment ${apt.id} has no service_ids, skipping commission calculation`);
          return;
        }

        serviceIds.forEach((serviceId) => {
          const service = serviceMap[serviceId];
          if (!service) {
            console.log(`Service ${serviceId} not found, skipping`);
            return;
          }

          const categoryId = service.category_id;
          if (!categoryId) {
            console.log(`Service ${serviceId} has no category, skipping`);
            return;
          }

          const servicePrice = service.price;
          const commissionPercent = ratesMap[barberId]?.[categoryId] || 0;

          const commissionGross = servicePrice * (commissionPercent / 100);
          const commissionNet = commissionGross * (1 - feePercent / 100);

          barberCommissions[barberId].gross += commissionGross;
          barberCommissions[barberId].net += commissionNet;

          // Breakdown by category
          if (!barberCommissions[barberId].breakdown[categoryId]) {
            barberCommissions[barberId].breakdown[categoryId] = { gross: 0, net: 0 };
          }
          barberCommissions[barberId].breakdown[categoryId].gross += commissionGross;
          barberCommissions[barberId].breakdown[categoryId].net += commissionNet;
        });
      });

      // 9. Convert to result format
      const results: BarberCommissionResult[] = Object.entries(barberCommissions).map(
        ([barberId, data]) => ({
          barber_id: barberId,
          barber_name: barberNameMap[barberId] || "Desconhecido",
          commission_gross: data.gross,
          commission_net: data.net,
          breakdown: Object.entries(data.breakdown).map(([catId, catData]) => ({
            category_id: catId,
            category_name: categoryNameMap[catId] || "Sem categoria",
            gross: catData.gross,
            net: catData.net,
          })),
        })
      );

      return results;
    },
    enabled: true,
  });
}
