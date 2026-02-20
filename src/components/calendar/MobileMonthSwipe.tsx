"use client";

import { useState } from "react";
import type { CalendarDeadlineItem } from "@/types/calendar";
import { clsx } from "clsx";
import { DeadlineStatusBadge } from "@/components/calendar/DeadlineStatusBadge";

interface MobileMonthSwipeProps {
  months: Date[];
  getItemsForMonth: (month: Date) => CalendarDeadlineItem[];
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
}

export function MobileMonthSwipe({ months, getItemsForMonth }: MobileMonthSwipeProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIdx = Math.round(scrollLeft / width);
    if (newIdx !== activeIdx) setActiveIdx(newIdx);
  };

  return (
    <section className="md:hidden">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
          Vista móvil por mes
        </div>
        <div className="flex gap-1">
          {months.map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === activeIdx ? "bg-foreground w-3" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
      <div 
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 no-scrollbar"
        onScroll={handleScroll}
      >
        {months.map((month) => {
          const items = getItemsForMonth(month);
          return (
            <article
              key={monthKey(month)}
              className="w-[90%] shrink-0 snap-center rounded-lg border border-border/60 bg-card p-4 shadow-sm"
            >
              <h3 className="heading-serif mb-3 text-lg capitalize text-foreground">{formatMonth(month)}</h3>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin vencimientos con tus filtros.</p>
              ) : (
                <div className="space-y-2">
                  {items.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className={clsx("rounded-md border border-border/50 bg-muted/20 p-2.5")}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{item.fecha}</span>
                        <DeadlineStatusBadge status={item.status} />
                      </div>
                      <p className="text-sm font-medium text-foreground">{item.obligacion}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        NIT {item.ultimoDigito} • {item.periodo}
                      </p>
                    </div>
                  ))}
                  {items.length > 10 && (
                    <p className="text-xs font-medium text-muted-foreground">
                      +{items.length - 10} vencimientos más en este mes
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

