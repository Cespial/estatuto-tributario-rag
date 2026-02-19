"use client";

import { clsx } from "clsx";

export type CalendarRangeFilter = "mes" | "trimestre" | "anio";

interface CalendarRangeTabsProps {
  value: CalendarRangeFilter;
  onChange: (value: CalendarRangeFilter) => void;
}

const OPTIONS: Array<{ value: CalendarRangeFilter; label: string }> = [
  { value: "mes", label: "Este mes" },
  { value: "trimestre", label: "Este trimestre" },
  { value: "anio", label: "Todo 2026" },
];

export function CalendarRangeTabs({ value, onChange }: CalendarRangeTabsProps) {
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "rounded px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            value === option.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

