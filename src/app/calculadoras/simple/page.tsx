"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrencyInput, SelectInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { UVT_VALUES, CURRENT_UVT_YEAR, SIMPLE_GROUPS, SIMPLE_BRACKETS, RENTA_BRACKETS } from "@/config/tax-data";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function formatUVT(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 2 }) + " UVT";
}

export default function SimplePage() {
  const [ingresos, setIngresos] = useState(0);
  const [grupoId, setGrupoId] = useState("1");
  const [tarifaICA, setTarifaICA] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const calculo = useMemo(() => {
    if (ingresos <= 0) return null;

    const ingresosUVT = ingresos / uvt;
    const groupIdx = parseInt(grupoId) - 1;
    
    // Validacion tope 100k UVT
    const superaTope = ingresosUVT > 100000;

    // Calculo progresivo
    let impuestoUVT = 0;
    const desgloseBrackets = [];

    for (const bracket of SIMPLE_BRACKETS) {
      if (ingresosUVT > bracket.from) {
        const baseEnTramo = Math.min(ingresosUVT, bracket.to) - bracket.from;
        const tarifa = bracket.rates[groupIdx];
        const impuestoTramo = baseEnTramo * tarifa;
        impuestoUVT += impuestoTramo;

        desgloseBrackets.push({
          rango: `${bracket.from.toLocaleString()} - ${bracket.to.toLocaleString()} UVT`,
          base: baseEnTramo,
          tarifa: (tarifa * 100).toFixed(2) + "%",
          impuesto: impuestoTramo * uvt
        });
      }
    }

    const impuestoCOP = impuestoUVT * uvt;
    const icaEstimado = ingresos * (tarifaICA / 1000);
    const tasaEfectiva = (impuestoCOP / ingresos) * 100;

    // Estimacion Renta Ordinaria (Simplificada para comparacion)
    // Se asume PN Cedula General con utilidad del 30%
    const utilidadEstimada = ingresos * 0.3;
    const utilidadUVT = utilidadEstimada / uvt;
    let rentaOrdinariaUVT = 0;
    for (let i = 0; i < RENTA_BRACKETS.length; i++) {
      const b = RENTA_BRACKETS[i];
      if (utilidadUVT > b.from) {
        const base = Math.min(utilidadUVT, b.to) - b.from;
        rentaOrdinariaUVT += base * b.rate;
      }
    }
    const rentaOrdinariaCOP = rentaOrdinariaUVT * uvt;

    return {
      ingresosUVT,
      impuestoCOP,
      icaEstimado,
      tasaEfectiva,
      superaTope,
      desgloseBrackets,
      rentaOrdinariaCOP,
      ahorro: rentaOrdinariaCOP - impuestoCOP
    };
  }, [ingresos, grupoId, tarifaICA, uvt]);

  return (
    <div className="container max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Régimen SIMPLE de Tributación</h1>
        <p className="text-muted-foreground">
          Calcula el impuesto unificado para el año gravable {CURRENT_UVT_YEAR} (Art. 903-916 ET).
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <CurrencyInput
            id="ingresos"
            label="Ingresos brutos anuales"
            value={ingresos}
            onChange={setIngresos}
            placeholder="Ej: 200.000.000"
          />

          <SelectInput
            id="grupo"
            label="Grupo de actividad económica"
            value={grupoId}
            onChange={setGrupoId}
            options={SIMPLE_GROUPS.map(g => ({ value: g.id.toString(), label: g.label }))}
          />

          <NumberInput
            id="tarifa-ica"
            label="Tarifa ICA municipal (por mil)"
            value={tarifaICA}
            onChange={setTarifaICA}
            placeholder="Ej: 7.7"
          />

          {calculo?.superaTope && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-950/30 dark:text-yellow-400">
              <p className="font-bold">⚠️ Atención: Supera el tope</p>
              <p>Tus ingresos ({formatUVT(calculo.ingresosUVT)}) superan el límite de 100.000 UVT para pertenecer al Régimen SIMPLE.</p>
            </div>
          )}
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <CalculatorResult
                items={[
                  {
                    label: "Impuesto SIMPLE Anual",
                    value: formatCOP(calculo.impuestoCOP),
                    sublabel: `Tasa efectiva: ${calculo.tasaEfectiva.toFixed(2)}%`
                  }
                ]}
              />

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Comparativa y Detalles</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Ingresos en UVT:</span>
                    <span className="font-medium">{formatUVT(calculo.ingresosUVT)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">ICA Consolidado (est.):</span>
                    <span className="font-medium">{formatCOP(calculo.icaEstimado)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Est. Renta Ordinaria:</span>
                    <span className="font-medium">{formatCOP(calculo.rentaOrdinariaCOP)}</span>
                  </div>
                  <div className={`flex justify-between pt-2 text-lg font-bold ${calculo.ahorro > 0 ? "text-green-600" : "text-red-600"}`}>
                    <span>{calculo.ahorro > 0 ? "Ahorro estimado:" : "Diferencia:"}</span>
                    <span>{formatCOP(Math.abs(calculo.ahorro))}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-semibold">Desglose por Rangos</h4>
                <div className="space-y-2 text-xs">
                  {calculo.desgloseBrackets.map((b, i) => (
                    <div key={i} className="flex justify-between text-muted-foreground">
                      <span>{b.rango} ({b.tarifa})</span>
                      <span className="font-mono">{formatCOP(b.impuesto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              Ingresa tus ingresos para proyectar el impuesto SIMPLE
            </div>
          )}
        </div>
      </div>

      <CalculatorSources articles={["903", "905", "908"]} />
    </div>
  );
}
