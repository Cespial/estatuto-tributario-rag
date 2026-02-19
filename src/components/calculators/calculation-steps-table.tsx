"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export interface CalculationStepRow {
  id: string;
  label: string;
  value: string;
  explanation?: string;
  tone?: "default" | "muted" | "subtotal" | "total" | "warning";
}

interface CalculationStepsTableProps {
  title: string;
  rows: CalculationStepRow[];
  valueColumnTitle?: string;
}

export function CalculationStepsTable({
  title,
  rows,
  valueColumnTitle = "Valor",
}: CalculationStepsTableProps) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggleRow = (rowId: string) => {
    setOpenRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  return (
    <div className="mb-6 rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="heading-serif text-lg">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
              <th className="px-4 py-3 text-left">Concepto</th>
              <th className="px-4 py-3 text-right">{valueColumnTitle}</th>
              <th className="px-4 py-3 text-right">Explicacion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isOpen = !!openRows[row.id];
              return (
                <Fragment key={row.id}>
                  <tr
                    className={clsx(
                      "border-b border-border last:border-0",
                      row.tone === "muted" && "bg-muted/20 text-muted-foreground",
                      row.tone === "subtotal" && "bg-muted/30 font-semibold",
                      row.tone === "total" && "bg-muted/40 font-bold text-foreground",
                      row.tone === "warning" && "bg-muted/40",
                    )}
                  >
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-right font-mono">{row.value}</td>
                    <td className="px-4 py-3 text-right">
                      {row.explanation ? (
                        <button
                          type="button"
                          onClick={() => toggleRow(row.id)}
                          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {isOpen ? "Ocultar" : "Ver"} explicacion
                          <ChevronDown className={clsx("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                  {row.explanation && isOpen && (
                    <tr className="border-b border-border bg-muted/20 text-sm text-muted-foreground">
                      <td colSpan={3} className="px-4 py-3 leading-relaxed">
                        {row.explanation}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
