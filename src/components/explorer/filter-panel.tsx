"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { ET_BOOKS } from "@/lib/constants/et-books";

export interface ExplorerFilters {
  libro: string;
  estado: string;
  hasMods: boolean | null;
  hasNormas: boolean | null;
  law: string;
  modYear: number | null;
}

interface FacetCount {
  key: string;
  label: string;
  count: number;
}

interface ExplorerFacets {
  libros: FacetCount[];
  estados: FacetCount[];
  mod_years: Array<{ year: number; count: number }>;
  laws: Array<{ key: string; label: string; count: number }>;
}

interface FilterPanelProps {
  filters: ExplorerFilters;
  facets: ExplorerFacets | null;
  onChange: (filters: ExplorerFilters) => void;
}

const ESTADO_LABELS: Record<string, string> = {
  vigente: "Vigente",
  modificado: "Modificado",
  derogado: "Derogado",
};

export function FilterPanel({ filters, facets, onChange }: FilterPanelProps) {
  const updateFilters = (partial: Partial<ExplorerFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const lawOptions = (facets?.laws || []).slice(0, 80);
  const activeFilterLabels: Array<{ key: string; label: string }> = [];

  if (filters.libro) {
    activeFilterLabels.push({ key: "libro", label: filters.libro });
  }
  if (filters.estado) {
    activeFilterLabels.push({
      key: "estado",
      label: `Estado: ${ESTADO_LABELS[filters.estado] || filters.estado}`,
    });
  }
  if (filters.modYear) {
    activeFilterLabels.push({
      key: "modYear",
      label: `Modificado ${filters.modYear}`,
    });
  }
  if (filters.law) {
    activeFilterLabels.push({
      key: "law",
      label: `Ley: ${filters.law}`,
    });
  }
  if (filters.hasMods === true) {
    activeFilterLabels.push({ key: "hasMods", label: "Con modificaciones" });
  }
  if (filters.hasNormas === true) {
    activeFilterLabels.push({ key: "hasNormas", label: "Con normas" });
  }

  const clearFilter = (key: string) => {
    switch (key) {
      case "libro":
        updateFilters({ libro: "" });
        break;
      case "estado":
        updateFilters({ estado: "" });
        break;
      case "modYear":
        updateFilters({ modYear: null });
        break;
      case "law":
        updateFilters({ law: "" });
        break;
      case "hasMods":
        updateFilters({ hasMods: null });
        break;
      case "hasNormas":
        updateFilters({ hasNormas: null });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
              Libros del ET
            </p>
            {activeFilterLabels.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {activeFilterLabels.length}
              </span>
            )}
          </div>
          <button
            onClick={() =>
              onChange({
                libro: "",
                estado: "",
                hasMods: null,
                hasNormas: null,
                law: "",
                modYear: null,
              })
            }
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => updateFilters({ libro: "" })}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !filters.libro
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          {ET_BOOKS.map((book) => {
            const count =
              facets?.libros.find((entry) => entry.key === book.value)?.count || 0;
            const selected = filters.libro === book.value;
            return (
              <button
                key={book.key}
                onClick={() =>
                  updateFilters({ libro: selected ? "" : book.value })
                }
                className={clsx(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {book.shortLabel}{" "}
                <span className={clsx(selected ? "text-background/80" : "text-muted-foreground/80")}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <select
          value={filters.estado}
          onChange={(e) => updateFilters({ estado: e.target.value })}
          className="h-10 rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <option value="">Estado: Todos</option>
          {(facets?.estados || []).map((estado) => (
            <option key={estado.key} value={estado.key}>
              {ESTADO_LABELS[estado.key] || estado.label} ({estado.count})
            </option>
          ))}
        </select>

        <select
          value={filters.modYear ?? ""}
          onChange={(e) =>
            updateFilters({
              modYear: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="h-10 rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <option value="">Año de modificación</option>
          {(facets?.mod_years || []).map((entry) => (
            <option key={entry.year} value={entry.year}>
              {entry.year} ({entry.count})
            </option>
          ))}
        </select>

        <select
          value={filters.law}
          onChange={(e) => updateFilters({ law: e.target.value })}
          className="h-10 rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <option value="">Modificado por Ley / Decreto</option>
          {lawOptions.map((law) => (
            <option key={law.key} value={law.label}>
              {law.label} ({law.count})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              updateFilters({ hasMods: filters.hasMods === true ? null : true })
            }
            className={clsx(
              "h-10 flex-1 rounded border px-3 text-sm transition-colors",
              filters.hasMods === true
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-pressed={filters.hasMods === true}
          >
            Con modificaciones
          </button>
          <button
            onClick={() =>
              updateFilters({
                hasNormas: filters.hasNormas === true ? null : true,
              })
            }
            className={clsx(
              "h-10 flex-1 rounded border px-3 text-sm transition-colors",
              filters.hasNormas === true
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-pressed={filters.hasNormas === true}
          >
            Con normas
          </button>
        </div>
      </div>

      {activeFilterLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterLabels.map((filter) => (
            <button
              key={filter.key}
              onClick={() => clearFilter(filter.key)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {filter.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
