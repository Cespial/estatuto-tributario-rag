"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RETENCION_CONCEPTOS,
  RETENCION_SALARIOS_BRACKETS,
} from "@/config/tax-data";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

const CONCEPTO_OPTIONS = RETENCION_CONCEPTOS.map((c) => ({
  value: c.id,
  label: c.concepto,
}));

function calcSalaryRetention(baseUVT: number): number {
  for (const bracket of RETENCION_SALARIOS_BRACKETS) {
    if (baseUVT > bracket.from && baseUVT <= bracket.to) {
      return (baseUVT - bracket.from) * bracket.rate + bracket.base;
    }
  }
  const last = RETENCION_SALARIOS_BRACKETS[RETENCION_SALARIOS_BRACKETS.length - 1];
  return (baseUVT - last.from) * last.rate + last.base;
}

export default function RetencionPage() {
  const [conceptoId, setConceptoId] = useState<string>(RETENCION_CONCEPTOS[0].id);
  const [monto, setMonto] = useState(0);
  const [deduccionesSS, setDeduccionesSS] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const concepto = RETENCION_CONCEPTOS.find((c) => c.id === conceptoId)!;
  const isSalarios = conceptoId === "salarios";

  const result = useMemo(() => {
    if (monto <= 0) return null;

    if (isSalarios) {
      const netoCOP = monto - deduccionesSS;
      const netoUVT = netoCOP / uvt;
      const retencionUVT = calcSalaryRetention(netoUVT);
      const retencionCOP = retencionUVT * uvt;
      return {
        aplica: retencionUVT > 0,
        baseMinCOP: 0,
        tarifa: netoUVT > 0 ? retencionCOP / netoCOP : 0,
        retencion: retencionCOP,
        neto: monto - retencionCOP,
        isSalarios: true,
      };
    }

    const baseMinCOP = concepto.baseUVT * uvt;
    const aplica = baseMinCOP === 0 || monto >= baseMinCOP;
    const tarifa = concepto.tarifa ?? 0;
    const retencion = aplica ? monto * tarifa : 0;

    return {
      aplica,
      baseMinCOP,
      tarifa,
      retencion,
      neto: monto - retencion,
      isSalarios: false,
    };
  }, [monto, deduccionesSS, uvt, concepto, isSalarios]);

  const resultItems = result
    ? [
        {
          label: "Aplica retencion",
          value: result.aplica ? "Si" : "No",
          sublabel: !result.aplica && result.baseMinCOP > 0
            ? `Base minima: ${formatCOP(result.baseMinCOP)}`
            : undefined,
        },
        {
          label: "Tarifa efectiva",
          value: (result.tarifa * 100).toFixed(2) + "%",
        },
        {
          label: "Valor retenido",
          value: formatCOP(result.retencion),
        },
        {
          label: "Valor neto a pagar",
          value: formatCOP(result.neto),
        },
      ]
    : [];

  const relatedArticles = [...new Set(RETENCION_CONCEPTOS.map((c) => c.art))];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Retencion en la Fuente</h1>

      <div className="mb-6 space-y-4">
        <SelectInput
          id="ret-concepto"
          label="Concepto"
          value={conceptoId}
          onChange={(v) => { setConceptoId(v); setMonto(0); setDeduccionesSS(0); }}
          options={CONCEPTO_OPTIONS}
        />
        <CurrencyInput
          id="ret-monto"
          label={isSalarios ? "Ingreso mensual bruto" : "Monto del pago"}
          value={monto}
          onChange={setMonto}
        />
        {isSalarios && (
          <CurrencyInput
            id="ret-ss"
            label="Deducciones seguridad social (salud + pension)"
            value={deduccionesSS}
            onChange={setDeduccionesSS}
          />
        )}
      </div>

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      {/* Tabla progresiva salarios */}
      {isSalarios && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Tabla progresiva Art. 383</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                  <th className="px-4 py-2 text-left">Desde (UVT)</th>
                  <th className="px-4 py-2 text-left">Hasta (UVT)</th>
                  <th className="px-4 py-2 text-right">Tarifa</th>
                </tr>
              </thead>
              <tbody>
                {RETENCION_SALARIOS_BRACKETS.map((b, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{b.from}</td>
                    <td className="px-4 py-2">{b.to === Infinity ? "En adelante" : b.to}</td>
                    <td className="px-4 py-2 text-right">{(b.rate * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CalculatorSources articles={relatedArticles} />
    </>
  );
}
