"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR, GMF_RATE, GMF_EXEMPT_UVT } from "@/config/tax-data";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function GMFPage() {
  const [monto, setMonto] = useState(0);
  const [cuentaExenta, setCuentaExenta] = useState(false);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const montoExento = cuentaExenta ? GMF_EXEMPT_UVT * uvt : 0;
  const montoGravado = Math.max(0, monto - montoExento);
  const gmf = montoGravado * GMF_RATE;

  const resultItems =
    monto > 0
      ? [
          { label: "Monto transacciones", value: formatCOP(monto) },
          ...(cuentaExenta
            ? [{ label: "Monto exento (350 UVT)", value: formatCOP(montoExento) }]
            : []),
          { label: "Monto gravado", value: formatCOP(montoGravado) },
          { label: "GMF a pagar (4×1000)", value: formatCOP(gmf) },
          { label: "Tasa efectiva", value: monto > 0 ? ((gmf / monto) * 100).toFixed(3) + "%" : "0%" },
        ]
      : [];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-6 heading-serif text-3xl">GMF (4×1000)</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">Calcula el Gravamen a los Movimientos Financieros.</p>

      <div className="mb-6 space-y-4">
        <CurrencyInput
          id="gmf-monto"
          label="Monto de transacciones mensuales"
          value={monto}
          onChange={setMonto}
        />
        <ToggleInput
          label="Tiene cuenta exenta de GMF"
          pressed={cuentaExenta}
          onToggle={setCuentaExenta}
        />
      </div>

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      <div className="mb-6 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold tracking-tight">Sobre el GMF</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>El Gravamen a los Movimientos Financieros es del 4 por mil (0.4%).</li>
          <li>Cada persona natural puede marcar una cuenta como exenta hasta 350 UVT mensuales ({formatCOP(GMF_EXEMPT_UVT * uvt)} en {CURRENT_UVT_YEAR}).</li>
          <li>Aplica a retiros, transferencias, cheques y movimientos contables.</li>
        </ul>
      </div>

      <CalculatorSources articles={["871", "879"]} />
    </>
  );
}
