"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

const RATE_OPTIONS = [
  { value: "0.19", label: "19% (General)" },
  { value: "0.05", label: "5% (Reducido)" },
];

export default function IVAPage() {
  const [mode, setMode] = useState<"calculo" | "extraccion">("calculo");
  const [monto, setMonto] = useState(0);
  const [rateStr, setRateStr] = useState("0.19");

  const rate = Number(rateStr);

  const result =
    mode === "calculo"
      ? { base: monto, iva: monto * rate, total: monto * (1 + rate) }
      : { base: monto / (1 + rate), iva: monto - monto / (1 + rate), total: monto };

  const resultItems =
    monto > 0
      ? [
          { label: "Base gravable", value: formatCOP(result.base) },
          { label: `IVA (${(rate * 100).toFixed(0)}%)`, value: formatCOP(result.iva) },
          { label: "Total", value: formatCOP(result.total) },
        ]
      : [];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Referencia IVA</h1>

      <div className="mb-6 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => { setMode("calculo"); setMonto(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              mode === "calculo" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            Calcular IVA
          </button>
          <button
            onClick={() => { setMode("extraccion"); setMonto(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              mode === "extraccion" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            Extraer IVA
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput
            id="iva-monto"
            label={mode === "calculo" ? "Base gravable" : "Total con IVA"}
            value={monto}
            onChange={setMonto}
          />
          <SelectInput id="iva-rate" label="Tarifa IVA" value={rateStr} onChange={setRateStr} options={RATE_OPTIONS} />
        </div>
      </div>

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      {/* Educational section */}
      <div className="mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Exento vs Excluido</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Excluido (Art. 424)</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              No causa IVA. El productor/prestador NO puede descontar el IVA pagado en insumos.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>- Alimentos basicos (canasta familiar)</li>
              <li>- Servicios medicos y educativos</li>
              <li>- Transporte publico</li>
              <li>- Servicios publicos (estratos 1-2)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Exento (Art. 477)</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Tarifa 0%, pero el productor SI puede solicitar devolucion del IVA pagado en insumos.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>- Exportaciones de bienes</li>
              <li>- Carne, leche, huevos frescos</li>
              <li>- Cuadernos escolares</li>
              <li>- Servicios turisticos para no residentes</li>
            </ul>
          </div>
        </div>
      </div>

      <CalculatorSources articles={["468", "477", "424"]} />
    </>
  );
}
