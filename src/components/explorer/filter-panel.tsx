"use client";

import { clsx } from "clsx";

interface Filters {
  libro: string;
  estado: string;
  hasMods: boolean | null;
  hasNormas: boolean | null;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const LIBROS = [
  { value: "", label: "Todos" },
  { value: "Titulo Preliminar", label: "Preliminar" },
  { value: "Libro I - Renta", label: "I - Renta" },
  { value: "Libro II - Retencion", label: "II - Retencion" },
  { value: "Libro III - IVA", label: "III - IVA" },
  { value: "Libro IV - Timbre", label: "IV - Timbre" },
  { value: "Libro V - Procedimiento", label: "V - Procedimiento" },
  { value: "Libro VI - GMF", label: "VI - GMF" },
];

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "vigente", label: "Vigente" },
  { value: "modificado", label: "Modificado" },
  { value: "derogado", label: "Derogado" },
];

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Libro */}
      <select
        value={filters.libro}
        onChange={(e) => onChange({ ...filters, libro: e.target.value })}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
      >
        {LIBROS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Estado */}
      <select
        value={filters.estado}
        onChange={(e) => onChange({ ...filters, estado: e.target.value })}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
      >
        {ESTADOS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Toggle buttons */}
      <button
        onClick={() =>
          onChange({
            ...filters,
            hasMods: filters.hasMods === true ? null : true,
          })
        }
        className={clsx(
          "rounded-md border px-3 py-1.5 text-sm transition-colors",
          filters.hasMods === true
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        Con modificaciones
      </button>
      <button
        onClick={() =>
          onChange({
            ...filters,
            hasNormas: filters.hasNormas === true ? null : true,
          })
        }
        className={clsx(
          "rounded-md border px-3 py-1.5 text-sm transition-colors",
          filters.hasNormas === true
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        Con normas
      </button>
    </div>
  );
}
