"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

const YEAR_OPTIONS = Object.keys(UVT_VALUES)
  .sort((a, b) => Number(b) - Number(a))
  .map((y) => ({ value: y, label: y }));

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function UVTPage() {
  const [amount, setAmount] = useState(0);
  const [year, setYear] = useState(String(CURRENT_UVT_YEAR));
  const [direction, setDirection] = useState<"cop-to-uvt" | "uvt-to-cop">("uvt-to-cop");

  const uvtValue = UVT_VALUES[Number(year)] ?? UVT_VALUES[CURRENT_UVT_YEAR];

  const result =
    direction === "uvt-to-cop"
      ? { uvt: amount, cop: amount * uvtValue }
      : { uvt: amount / uvtValue, cop: amount };

  const resultItems =
    amount > 0
      ? direction === "uvt-to-cop"
          ? [
              { label: "UVT", value: amount.toLocaleString("es-CO") },
              { label: "Pesos colombianos", value: formatCOP(result.cop) },
              { label: `Valor UVT ${year}`, value: formatCOP(uvtValue) },
            ]
          : [
              { label: "Pesos colombianos", value: formatCOP(amount) },
              { label: "UVT", value: result.uvt.toLocaleString("es-CO", { maximumFractionDigits: 2 }) },
              { label: `Valor UVT ${year}`, value: formatCOP(uvtValue) },
            ]
      : [];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-6 heading-serif text-3xl">Conversor UVT ↔ COP</h1>

      <div className="mb-6 space-y-4">
        {/* Direction toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => { setDirection("uvt-to-cop"); setAmount(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              direction === "uvt-to-cop" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            UVT → COP
          </button>
          <button
            onClick={() => { setDirection("cop-to-uvt"); setAmount(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              direction === "cop-to-uvt" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            COP → UVT
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput
            id="uvt-amount"
            label={direction === "uvt-to-cop" ? "Cantidad en UVT" : "Monto en pesos"}
            value={amount}
            onChange={setAmount}
            prefix={direction === "uvt-to-cop" ? "" : "$"}
            placeholder="0"
          />
          <SelectInput id="uvt-year" label="Ano gravable" value={year} onChange={setYear} options={YEAR_OPTIONS} />
        </div>
      </div>

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      {/* Historical table */}
      <div className="mb-6">
        <h2 className="mb-4 heading-serif text-lg">Historico UVT</h2>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                <th className="px-4 py-3 text-left">Ano</th>
                <th className="px-4 py-3 text-right">Valor UVT</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(UVT_VALUES)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([y, v]) => (
                  <tr key={y} className={clsx("border-b border-border last:border-0", y === year && "bg-muted/50")}>
                    <td className="px-4 py-3">{y}</td>
                    <td className="px-4 py-3 text-right">{formatCOP(v)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <CalculatorSources articles={["868"]} />
    </>
  );
}
