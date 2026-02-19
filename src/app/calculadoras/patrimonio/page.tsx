"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import {
  PATRIMONIO_THRESHOLD_UVT,
  PATRIMONIO_BRACKETS,
  PATRIMONIO_VIVIENDA_EXCLUSION_UVT
} from "@/config/tax-data-ganancias";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function PatrimonioPage() {
  const [patrimonioBruto, setPatrimonioBruto] = useState(0);
  const [deudas, setDeudas] = useState(0);
  const [valorVivienda, setValorVivienda] = useState(0);
  const [otrasExclusiones, setOtrasExclusiones] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const results = useMemo(() => {
    const patrimonioLiquido = Math.max(0, patrimonioBruto - deudas);

    // Aplicación exclusión vivienda (Max 12.000 UVT)
    const exclusionViviendaEfectiva = Math.min(valorVivienda, PATRIMONIO_VIVIENDA_EXCLUSION_UVT * uvt);

    const baseGravableCOP = Math.max(0, patrimonioLiquido - exclusionViviendaEfectiva - otrasExclusiones);
    const baseGravableUVT = baseGravableCOP / uvt;

    let impuestoUVT = 0;
    if (baseGravableUVT >= PATRIMONIO_THRESHOLD_UVT) {
      for (let i = PATRIMONIO_BRACKETS.length - 1; i >= 0; i--) {
        const bracket = PATRIMONIO_BRACKETS[i];
        if (baseGravableUVT > bracket.from) {
          impuestoUVT = (baseGravableUVT - bracket.from) * bracket.rate + bracket.base;
          break;
        }
      }
    }

    return {
      patrimonioLiquido,
      exclusionViviendaEfectiva,
      baseGravableCOP,
      baseGravableUVT,
      impuesto: impuestoUVT * uvt,
      aplica: baseGravableUVT >= PATRIMONIO_THRESHOLD_UVT
    };
  }, [patrimonioBruto, deudas, valorVivienda, otrasExclusiones, uvt]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 heading-serif text-3xl">Impuesto al Patrimonio</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">Perfeccionado con exclusión de vivienda (12.000 UVT).</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Activos y Pasivos</h2>
            <div className="space-y-4">
              <CurrencyInput id="p-bruto" label="Patrimonio Bruto Total" value={patrimonioBruto} onChange={setPatrimonioBruto} />
              <CurrencyInput id="deudas" label="Total Deudas" value={deudas} onChange={setDeudas} />
              <div className="pt-4 border-t border-border">
                <h3 className="mb-3 text-sm font-medium">Exclusiones de Ley</h3>
                <div className="space-y-4">
                  <CurrencyInput id="v-vivienda" label="Valor Vivienda de Habitación" value={valorVivienda} onChange={setValorVivienda} />
                  <CurrencyInput id="o-exclusiones" label="Otras Exclusiones (Art. 295-3)" value={otrasExclusiones} onChange={setOtrasExclusiones} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results && (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Resumen de Liquidación</h2>
                <CalculatorResult items={[
                  { label: "Base Gravable", value: formatCOP(results.baseGravableCOP) },
                  { label: "Base en UVT", value: results.baseGravableUVT.toLocaleString(undefined, {maximumFractionDigits: 0}) },
                  { label: "Impuesto", value: formatCOP(results.impuesto) },
                ]} />
              </div>

              {results.exclusionViviendaEfectiva > 0 && (
                <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 flex gap-3 text-sm">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p>Estás ahorrando el impuesto sobre <strong>{formatCOP(results.exclusionViviendaEfectiva)}</strong> por concepto de vivienda de habitación.</p>
                </div>
              )}

              {!results.aplica && patrimonioBruto > 0 && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border/60 text-center text-sm">
                  La base gravable es inferior al umbral de {PATRIMONIO_THRESHOLD_UVT.toLocaleString()} UVT. No se genera impuesto.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["292-2", "295-3", "296-3"]} />
      </div>
    </div>
  );
}
