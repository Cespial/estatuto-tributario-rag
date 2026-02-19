"use client";

import { clsx } from "clsx";

interface TimeRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ key: string; label: string; description?: string }>;
}

export function TimeRangeFilter({
  value,
  onChange,
  options,
}: TimeRangeFilterProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-2">
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={clsx(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              value === option.key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
