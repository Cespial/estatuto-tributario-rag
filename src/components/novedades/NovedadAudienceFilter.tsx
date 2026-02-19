"use client";

import { clsx } from "clsx";
import type { NovedadAudiencia } from "@/config/novedades-data";

export type AudienceFilterValue = "todos" | NovedadAudiencia;

interface NovedadAudienceFilterProps {
  value: AudienceFilterValue;
  onChange: (value: AudienceFilterValue) => void;
}

const OPTIONS: Array<{ value: AudienceFilterValue; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "personas_naturales", label: "Personas naturales" },
  { value: "personas_juridicas", label: "Jurídicas" },
  { value: "grandes_contribuyentes", label: "Grandes contribuyentes" },
  { value: "independientes", label: "Independientes" },
  { value: "empleadores", label: "Empleadores" },
  { value: "facturadores_electronicos", label: "Facturación electrónica" },
];

export function NovedadAudienceFilter({ value, onChange }: NovedadAudienceFilterProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
        ¿Quién se ve afectado?
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === option.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

