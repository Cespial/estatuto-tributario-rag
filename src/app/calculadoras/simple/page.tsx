"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrencyInput, SelectInput, NumberInput, ToggleInput } from "@/components/calculators/shared-inputs";
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
  const [usaCostosReales, setUsaCostosReales] = useState(false);
  const [margenUtilidad, setMargenUtilidad] = useState(30);
  const [costosDeducciones, setCostosDeducciones] = useState(0);
  const [rentasExentas, setRentasExentas] = useState(0);

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
    const utilidadEstimada = usaCostosReales
      ? Math.max(0, ingresos - costosDeducciones)
      : ingresos * (margenUtilidad / 100);
    const baseDepurada = Math.max(0, utilidadEstimada - rentasExentas);
    const utilidadUVT = baseDepurada / uvt;

    let rentaOrdinariaUVT = 0;
    for (let i = RENTA_BRACKETS.length - 1; i >= 0; i--) {
      const b = RENTA_BRACKETS[i];
      if (utilidadUVT > b.from) {
        rentaOrdinariaUVT = (utilidadUVT - b.from) * b.rate + b.base;
        break;
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
  }, [ingresos, grupoId, tarifaICA, uvt, usaCostosReales, margenUtilidad, costosDeducciones, rentasExentas]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Régimen SIMPLE de Tributación</h1>
        <p className="mt-2 text-muted-foreground">
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

          <div className="space-y-4 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground">Parámetros comparación Ordinario</h3>
            <ToggleInput
              label={usaCostosReales ? "Usando costos reales" : "Usando margen estimado %"}
              pressed={usaCostosReales}
              onToggle={setUsaCostosReales}
            />
            {usaCostosReales ? (
              <CurrencyInput
                id="costos-deducciones"
                label="Costos y deducciones reales"
                value={costosDeducciones}
                onChange={setCostosDeducciones}
                placeholder="Ej: 60.000.000"
              />
            ) : (
              <NumberInput
                id="margen-utilidad"
                label="Margen de utilidad estimado (%)"
                value={margenUtilidad}
                onChange={setMargenUtilidad}
                min={1}
                max={100}
                placeholder="30"
              />
            )}
            <CurrencyInput
              id="rentas-exentas"
              label="Rentas exentas (Art. 206 ET)"
              value={rentasExentas}
              onChange={setRentasExentas}
              placeholder="Ej: 10.000.000"
            />
          </div>

          {calculo?.superaTope && (
            <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 text-sm">
              <p className="font-bold">Atención: Supera el tope</p>
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

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
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
                  <div className={`flex justify-between pt-2 text-lg font-bold ${calculo.ahorro > 0 ? "text-green-600" : "text-red-500"}`}>
                    <span>{calculo.ahorro > 0 ? "Ahorro estimado:" : "Diferencia:"}</span>
                    <span>{formatCOP(Math.abs(calculo.ahorro))}</span>
                  </div>
                </div>
              </div>

              <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 text-xs">
                La comparación con régimen ordinario es estimada. Use el{" "}
                <Link href="/calculadoras/comparador-regimenes" className="font-semibold underline hover:text-foreground">
                  Comparador de Regímenes
                </Link>{" "}
                para un análisis detallado.
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
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
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Ingresa tus ingresos para proyectar el impuesto SIMPLE
            </div>
          )}
        </div>
      </div>

      <CalculatorSources articles={["903", "905", "908"]} />
    </div>
  );
}
