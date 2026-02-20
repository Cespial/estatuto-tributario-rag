"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarDeadlineItem } from "@/types/calendar";
import { clsx } from "clsx";

interface CalendarMonthGridProps {
  monthDate: Date;
  items: CalendarDeadlineItem[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canPrevMonth: boolean;
  canNextMonth: boolean;
}

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
}

export function CalendarMonthGrid({
  monthDate,
  items,
  onPrevMonth,
  onNextMonth,
  canPrevMonth,
  canNextMonth,
}: CalendarMonthGridProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const itemsByDay = new Map<number, CalendarDeadlineItem[]>();
  for (const item of items) {
    const [itemYear, itemMonth, itemDay] = item.fecha.split("-").map(Number);
    if (itemYear === year && itemMonth === month + 1) {
      const current = itemsByDay.get(itemDay) ?? [];
      current.push(item);
      itemsByDay.set(itemDay, current);
    }
  }

  const totalCells = Math.ceil((firstWeekDay + totalDays) / 7) * 7;
  const dayCells = Array.from({ length: totalCells }, (_, index) => {
    const day = index - firstWeekDay + 1;
    return day > 0 && day <= totalDays ? day : null;
  });

  return (
    <section className="hidden rounded-lg border border-border/60 bg-card p-5 shadow-sm md:block">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="heading-serif text-xl capitalize text-foreground">
          {formatMonthLabel(monthDate)}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            disabled={!canPrevMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canNextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {dayCells.map((day, idx) => {
          const events = day ? itemsByDay.get(day) ?? [] : [];
          return (
            <div
              key={`${day ?? "empty"}-${idx}`}
              className={clsx(
                "group relative min-h-[120px] rounded-md border border-border/60 p-2 transition-all",
                day ? "bg-background hover:border-foreground/40 hover:shadow-sm" : "bg-muted/20"
              )}
            >
              {day && (
                <>
                  <div className="mb-1 text-right text-xs font-semibold text-foreground">{day}</div>
                  
                  {/* Tooltip Popup */}
                  {events.length > 0 && (
                    <div className="invisible absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg bg-foreground p-3 text-background shadow-xl group-hover:visible">
                      <p className="mb-2 text-xs font-bold border-b border-background/20 pb-1">
                        Vencimientos {day} de {formatMonthLabel(monthDate)}
                      </p>
                      <ul className="space-y-2">
                        {events.map((e) => (
                          <li key={e.id} className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-medium leading-tight">
                              <span className={clsx("h-1.5 w-1.5 rounded-full bg-background", e.tipoPuntoClassName)} />
                              <span className="text-[10px] uppercase tracking-wide opacity-80">{e.etiquetaTipo}</span>
                            </div>
                            <p className="text-[11px] leading-snug">{e.obligacion}</p>
                            <p className="text-[9px] opacity-70">NIT termina en: {e.ultimoDigito}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-foreground" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="rounded border border-border/50 bg-muted/30 px-1.5 py-1 text-[11px] leading-tight"
                      >
                        <div className="flex items-center gap-1">
                          <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", event.tipoPuntoClassName)} />
                          <span className="truncate text-muted-foreground">{event.etiquetaTipo}</span>
                        </div>
                        <p className="mt-0.5 truncate text-foreground">{event.obligacion}</p>
                      </div>
                    ))}
                    {events.length > 3 && (
                      <p className="text-[11px] font-medium text-muted-foreground">
                        +{events.length - 3} más
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

