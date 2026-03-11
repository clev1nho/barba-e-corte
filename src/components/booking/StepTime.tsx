import { useQuery } from "@tanstack/react-query";
import { Check, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShopSettings, WorkingHours } from "@/hooks/useShopSettings";
import { Barber } from "@/hooks/useBarbers";

interface ServiceBase {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface StepTimeProps {
  settings: ShopSettings | null;
  barbers: Barber[];
  selectedBarber: Barber | null;
  anyBarber: boolean;
  selectedDate: string;
  service: ServiceBase | null;
  serviceDuration?: number;
  selected: string;
  onSelect: (time: string, barber?: Barber) => void;
}

const DAY_MAP: Record<string, number> = {
  domingo: 0, segunda: 1, terça: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6
};

const DAY_KEY_MAP: Record<number, keyof WorkingHours> = {
  0: "domingo",
  1: "segunda", 
  2: "terça",
  3: "quarta",
  4: "quinta",
  5: "sexta",
  6: "sábado"
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function StepTime({
  settings,
  barbers,
  selectedBarber,
  anyBarber,
  selectedDate,
  service,
  serviceDuration,
  selected,
  onSelect,
}: StepTimeProps) {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments-for-date", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("barber_id, time, duration_minutes, status")
        .eq("date", selectedDate)
        .in("status", ["Pendente", "Confirmado"]);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  const generateTimeSlots = () => {
    if (!settings || !service) {
      return { slots: [], error: null };
    }

    const selectedDayOfWeek = new Date(selectedDate + "T12:00:00").getDay();
    const dayKey = DAY_KEY_MAP[selectedDayOfWeek];
    
    const workingHours = settings.working_hours;
    const daySchedule = workingHours?.[dayKey];
    
    if (!daySchedule || daySchedule.closed) {
      return { slots: [], error: "A barbearia está fechada neste dia." };
    }

    if (!daySchedule.open || !daySchedule.close) {
      return { slots: [], error: "Horário de funcionamento não configurado para este dia." };
    }

    const shopOpen = timeToMinutes(daySchedule.open);
    const shopClose = timeToMinutes(daySchedule.close);
    const interval = settings.slot_interval_minutes || 30;
    const totalDuration = serviceDuration || service.duration_minutes;

    const barbersToCheck = anyBarber ? barbers : selectedBarber ? [selectedBarber] : [];
    
    if (barbersToCheck.length === 0) {
      return { slots: [], error: "Nenhum barbeiro disponível." };
    }

    const availableBarbers = barbersToCheck.filter((barber) => {
      return barber.days_of_week?.some(
        (day) => DAY_MAP[day.toLowerCase()] === selectedDayOfWeek
      );
    });

    if (availableBarbers.length === 0) {
      return { slots: [], error: "Nenhum barbeiro trabalha neste dia." };
    }

    const slots: { time: string; barber: Barber }[] = [];

    for (const barber of availableBarbers) {
      const barberStart = timeToMinutes(barber.start_time || "09:00");
      const barberEnd = timeToMinutes(barber.end_time || "19:00");

      const startTime = Math.max(shopOpen, barberStart);
      const endTime = Math.min(shopClose, barberEnd);

      for (let time = startTime; time + totalDuration <= endTime; time += interval) {
        const timeStr = minutesToTime(time);

        const hasConflict = appointments?.some((apt) => {
          if (apt.barber_id !== barber.id) return false;

          const aptStart = timeToMinutes(apt.time);
          const aptEnd = aptStart + (apt.duration_minutes || 30);
          const slotStart = time;
          const slotEnd = time + totalDuration;

          return slotStart < aptEnd && slotEnd > aptStart;
        });

        if (!hasConflict) {
          const now = new Date();
          const slotDate = new Date(selectedDate + "T12:00:00");
          slotDate.setHours(Math.floor(time / 60), time % 60, 0, 0);

          if (slotDate > now) {
            slots.push({ time: timeStr, barber });
          }
        }
      }
    }

    if (anyBarber) {
      const uniqueSlots = new Map<string, { time: string; barber: Barber }>();
      slots.forEach((slot) => {
        if (!uniqueSlots.has(slot.time)) {
          uniqueSlots.set(slot.time, slot);
        }
      });
      return {
        slots: Array.from(uniqueSlots.values()).sort((a, b) =>
          timeToMinutes(a.time) - timeToMinutes(b.time)
        ),
        error: null
      };
    }

    return {
      slots: slots.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
      error: null
    };
  };

  const { slots: timeSlots, error: slotsError } = generateTimeSlots();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-6 font-display tracking-tight">Escolha o horário</h2>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight">Escolha o horário</h2>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {slotsError ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <AlertCircle className="w-12 h-12 text-amber-500/70 mx-auto mb-4" />
          <p className="text-muted-foreground">{slotsError}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente escolher outra data.
          </p>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum horário disponível para esta data.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os horários já estão ocupados ou já passaram. Tente outra data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {timeSlots.map(({ time, barber }) => (
            <button
              key={`${time}-${barber.id}`}
              onClick={() => onSelect(time, anyBarber ? barber : undefined)}
              className={`h-14 rounded-xl font-semibold transition-all duration-220 text-sm ${
                selected === time
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/40 hover:bg-muted/60 text-foreground border border-border/30 hover:border-primary/15"
              }`}
            >
              {selected === time ? (
                <Check className="w-5 h-5 mx-auto" />
              ) : (
                time
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
