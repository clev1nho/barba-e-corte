import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopSettings } from "@/hooks/useShopSettings";
import { Barber } from "@/hooks/useBarbers";

interface StepDateProps {
  settings: ShopSettings | null;
  barbers: Barber[];
  selectedBarber: Barber | null;
  anyBarber: boolean;
  selected: string;
  onSelect: (date: string) => void;
}

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DAY_MAP: Record<string, number> = {
  domingo: 0, segunda: 1, terça: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StepDate({ settings, barbers, selectedBarber, anyBarber, selected, onSelect }: StepDateProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allowSameDay = settings?.allow_same_day ?? true;

  const getAvailableDaysOfWeek = (): Set<number> => {
    const days = new Set<number>();
    const barbersToCheck = anyBarber ? barbers : selectedBarber ? [selectedBarber] : [];

    barbersToCheck.forEach((barber) => {
      barber.days_of_week?.forEach((day) => {
        const dayNum = DAY_MAP[day.toLowerCase()];
        if (dayNum !== undefined) days.add(dayNum);
      });
    });

    return days;
  };

  const availableDays = getAvailableDaysOfWeek();

  const isDateAvailable = (date: Date): boolean => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    if (dateOnly < today) return false;
    if (dateOnly.getTime() === today.getTime() && !allowSameDay) return false;
    return availableDays.has(dateOnly.getDay());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(newDate);
    }
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-display tracking-tight">Escolha a data</h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between glass-card rounded-xl p-3">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-muted/50">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold text-sm">
          {MONTHS_PT[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-muted/50">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS_PT.map((day) => (
          <div key={day} className="text-center text-[10px] text-muted-foreground/60 py-2 uppercase tracking-wider font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = formatDate(date);
          const isAvailable = isDateAvailable(date);
          const isSelected = selected === dateStr;
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && onSelect(dateStr)}
              disabled={!isAvailable}
              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-220 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : isAvailable
                  ? "hover:bg-muted/50 text-foreground"
                  : "text-muted-foreground/20 cursor-not-allowed"
              } ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}`}
            >
              {isSelected ? (
                <Check className="w-4 h-4" />
              ) : (
                date.getDate()
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
