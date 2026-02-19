"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { RetencionConcepto } from "@/config/retencion-tabla-data";
import { QuickCalculator } from "./QuickCalculator";
import { RetentionConceptTooltip } from "./retention-concept-tooltip";
import { clsx } from "clsx";

type SortKey = "concepto" | "baseMinUVT" | "tarifa" | "articulo";
type SortDirection = "asc" | "desc";

interface RetentionTableProps {
  concepts: RetencionConcepto[];
  uvtValue: number;
  selectedId?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RetentionTable({ concepts, uvtValue, selectedId }: RetentionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("concepto");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    const next = [...concepts];
    next.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return next;
  }, [concepts, sortDirection, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur">
            <tr>
              <th className="sticky left-0 z-20 bg-muted/90 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                <button onClick={() => toggleSort("concepto")} className="inline-flex items-center gap-1">
                  Concepto
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                <button onClick={() => toggleSort("baseMinUVT")} className="inline-flex items-center gap-1">
                  Base Min (UVT)
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                Base Min ($)
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                <button onClick={() => toggleSort("tarifa")} className="inline-flex items-center gap-1">
                  Tarifa
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                <button onClick={() => toggleSort("articulo")} className="inline-flex items-center gap-1">
                  Artículo
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                Nota / contexto
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((item) => (
              <tr
                key={item.id}
                id={`concepto-${item.id}`}
                className={clsx(
                  "transition-colors hover:bg-muted/30",
                  selectedId === item.id && "bg-amber-50/80 dark:bg-amber-950/20"
                )}
              >
                <td className="sticky left-0 z-[1] bg-card px-4 py-3 align-top hover:bg-muted/30">
                  <p className="font-medium">{item.concepto}</p>
                  {item.descripcion && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.descripcion}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {item.baseMinUVT > 0 ? item.baseMinUVT : "0"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {item.baseMinUVT > 0 ? formatCurrency(item.baseMinUVT * uvtValue) : "$ 0"}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-foreground">
                  {(item.tarifa * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/articulo/${item.articulo}`}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/70 hover:underline"
                  >
                    {item.articulo}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="line-clamp-2 max-w-[220px]">
                      {item.notas || item.tooltip || "-"}
                    </span>
                    <RetentionConceptTooltip text={item.tooltip || item.notas} />
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <QuickCalculator
                      concepto={item.concepto}
                      tarifa={item.tarifa}
                      baseMinUVT={item.baseMinUVT}
                      uvtValue={uvtValue}
                      linkCalculadora={item.linkCalculadora}
                    />
                    <Link
                      href={item.linkCalculadora || "/calculadoras/retencion"}
                      className="text-[11px] text-muted-foreground underline hover:text-foreground"
                    >
                      Calculadora completa
                    </Link>
                    <Link
                      href={`/asistente?prompt=${encodeURIComponent(
                        `¿Qué validaciones debo revisar para aplicar el concepto "${item.concepto}" del Art. ${item.articulo}?`
                      )}`}
                      className="text-[11px] text-muted-foreground underline hover:text-foreground"
                    >
                      Consultar al asistente
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
