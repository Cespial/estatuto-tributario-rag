"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { UVT_VALUES, CURRENT_UVT_YEAR, RENTA_BRACKETS } from "@/config/tax-data";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function calcImpuestoRenta(rentaLiquidaUVT: number): number {
  if (rentaLiquidaUVT <= 0) return 0;
  for (let i = RENTA_BRACKETS.length - 1; i >= 0; i--) {
    const b = RENTA_BRACKETS[i];
    if (rentaLiquidaUVT > b.from) {
      return (rentaLiquidaUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

export default function ComparacionPatrimonialPage() {
  const [patrimonioActual, setPatrimonioActual] = useState(0);
  const [patrimonioAnterior, setPatrimonioAnterior] = useState(0);
  const [rentaLiquidaDeclarada, setRentaLiquidaDeclarada] = useState(0);
  const [gananciasOcasionales, setGananciasOcasionales] = useState(0);
  const [rentasExentas, setRentasExentas] = useState(0);
  const [ingresosNoGravados, setIngresosNoGravados] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const results = useMemo(() => {
    const incremento = Math.max(0, patrimonioActual - patrimonioAnterior);
    const justificacion = rentaLiquidaDeclarada + gananciasOcasionales + rentasExentas + ingresosNoGravados;
    const rentaNoJustificada = Math.max(0, incremento - justificacion);

    const rentaNoJustificadaUVT = rentaNoJustificada / uvt;
    const impuestoAdicional = calcImpuestoRenta(rentaNoJustificadaUVT) * uvt;

    return {
      incremento,
      justificacion,
      rentaNoJustificada,
      impuestoAdicional,
      esValido: rentaNoJustificada <= 0,
    };
  }, [patrimonioActual, patrimonioAnterior, rentaLiquidaDeclarada, gananciasOcasionales, rentasExentas, ingresosNoGravados, uvt]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Renta por Comparacion Patrimonial</h1>
        <p className="mt-2 mb-10 text-muted-foreground">
          Verifique si el incremento de su patrimonio esta debidamente justificado (Art. 236 - 239 ET).
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight border-b pb-2">Patrimonio</h3>
            <CurrencyInput id="pat-actual" label="Patrimonio Liquido Ano Actual" value={patrimonioActual} onChange={setPatrimonioActual} />
            <CurrencyInput id="pat-anterior" label="Patrimonio Liquido Ano Anterior" value={patrimonioAnterior} onChange={setPatrimonioAnterior} />
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight border-b pb-2">Rentas y Justificaciones</h3>
            <CurrencyInput id="renta-liq" label="Renta Liquida Gravable Declarada" value={rentaLiquidaDeclarada} onChange={setRentaLiquidaDeclarada} />
            <CurrencyInput id="go" label="Ganancias Ocasionales Netas" value={gananciasOcasionales} onChange={setGananciasOcasionales} />
            <CurrencyInput id="exentas" label="Rentas Exentas" value={rentasExentas} onChange={setRentasExentas} />
            <CurrencyInput id="incrngo" label="Ingresos No Constitutivos de Renta (INCRNGO)" value={ingresosNoGravados} onChange={setIngresosNoGravados} />
          </div>
        </div>

        <div className="space-y-6">
          <CalculatorResult
            items={[
              { label: "Incremento Patrimonial", value: formatCOP(results.incremento) },
              { label: "Total Justificado", value: formatCOP(results.justificacion) },
              {
                label: "Renta por Comparacion",
                value: formatCOP(results.rentaNoJustificada),
                sublabel: results.esValido ? "Justificado" : "Diferencia patrimonial no justificada",
              },
              { label: "Impuesto Estimado (Art. 241)", value: formatCOP(results.impuestoAdicional) },
            ]}
          />

          {!results.esValido ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-bold mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Patrimonio No Justificado</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400">
                El incremento patrimonial supera las rentas declaradas por {formatCOP(results.rentaNoJustificada)}.
                Esto puede generar una renta gravable adicional y sanciones por parte de la DIAN.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30 text-green-800 dark:text-green-400">
              <div className="flex items-center gap-2 font-bold mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Patrimonio Justificado</span>
              </div>
              <p className="text-sm">
                Su incremento patrimonial se encuentra cubierto por las rentas y ganancias declaradas en el periodo.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold tracking-tight">Explicacion Legal</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Segun el Art. 236 del ET, cuando el patrimonio liquido en el ultimo dia del ano gravable sea superior al del
              ultimo dia del ano anterior, dicha diferencia se considera renta liquida, a menos que el contribuyente
              demuestre que el incremento proviene de causas justificadas.
              <br /><br />
              Se restan las desvalorizaciones y se suman las valorizaciones nominales para el calculo exacto ante la
              administracion. Las justificaciones incluyen: renta liquida gravable, ganancias ocasionales, rentas exentas
              e ingresos no constitutivos de renta ni ganancia ocasional (INCRNGO).
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CalculatorSources articles={["236", "237", "238", "239"]} />
      </div>
    </div>
  );
}
