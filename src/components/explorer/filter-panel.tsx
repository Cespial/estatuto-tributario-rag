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
  { value: "Titulo Preliminar", label: "Título Preliminar" },
  { value: "Libro I - Renta", label: "I - Renta" },
  { value: "Libro II - Retencion", label: "II - Retención" },
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
      <div className="flex items-center gap-1.5">
        <label htmlFor="filter-libro" className="text-xs font-medium text-muted-foreground">
          Libro
        </label>
        <select
          id="filter-libro"
          value={filters.libro}
          onChange={(e) => onChange({ ...filters, libro: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        >
          {LIBROS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div className="flex items-center gap-1.5">
        <label htmlFor="filter-estado" className="text-xs font-medium text-muted-foreground">
          Estado
        </label>
        <select
          id="filter-estado"
          value={filters.estado}
          onChange={(e) => onChange({ ...filters, estado: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        >
          {ESTADOS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Toggle buttons */}
      <button
        onClick={() =>
          onChange({
            ...filters,
            hasMods: filters.hasMods === true ? null : true,
          })
        }
        className={clsx(
          "rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
          filters.hasMods === true
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted"
        )}
        aria-pressed={filters.hasMods === true}
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
          "rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
          filters.hasNormas === true
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted"
        )}
        aria-pressed={filters.hasNormas === true}
      >
        Con normas
      </button>
    </div>
  );
}
