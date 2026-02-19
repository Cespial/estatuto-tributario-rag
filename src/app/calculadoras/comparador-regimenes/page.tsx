"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { CurrencyInput, SelectInput, ToggleInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RENTA_BRACKETS,
  SIMPLE_GROUPS,
  SIMPLE_BRACKETS,
} from "@/config/tax-data";

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

function calcSimple(ingresoBrutoAnualUVT: number, groupIndex: number): number {
  let impuesto = 0;
  let remaining = ingresoBrutoAnualUVT;
  for (const bracket of SIMPLE_BRACKETS) {
    if (remaining <= 0) break;
    const bracketSize = bracket.to - bracket.from;
    const taxableInBracket = Math.min(remaining, bracketSize);
    impuesto += taxableInBracket * bracket.rates[groupIndex];
    remaining -= taxableInBracket;
  }
  return impuesto;
}

export default function ComparadorRegimenesPage() {
  const [ingresosBrutos, setIngresosBrutos] = useState(0);
  const [costosDeducciones, setCostosDeducciones] = useState(0);
  const [grupoSimple, setGrupoSimple] = useState("1");
  const [tarifaICA, setTarifaICA] = useState(7);
  const [esPersonaJuridica, setEsPersonaJuridica] = useState(false);
  const [rentasExentas, setRentasExentas] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const groupIdx = parseInt(grupoSimple) - 1;

  const results = useMemo(() => {
    // ORDINARIO
    const rentaLiquida = Math.max(0, ingresosBrutos - costosDeducciones - rentasExentas);
    const rentaLiquidaUVT = rentaLiquida / uvt;
    const impuestoOrd = esPersonaJuridica ? rentaLiquida * 0.35 : calcImpuestoRenta(rentaLiquidaUVT) * uvt;
    const icaOrd = ingresosBrutos * (tarifaICA / 1000);
    const totalOrd = impuestoOrd + icaOrd;

    // SIMPLE
    const ingresosUVT = ingresosBrutos / uvt;
    const totalSimple = calcSimple(ingresosUVT, groupIdx) * uvt;

    const ahorro = totalOrd - totalSimple;
    const recomendacion = ahorro > 0 ? "Regimen SIMPLE" : "Regimen Ordinario";

    return {
      rentaLiquida,
      totalOrd,
      impuestoOrd,
      icaOrd,
      totalSimple,
      ahorro,
      recomendacion,
      ahorroPct: totalOrd > 0 ? (Math.abs(ahorro) / totalOrd) * 100 : 0,
    };
  }, [ingresosBrutos, costosDeducciones, rentasExentas, esPersonaJuridica, tarifaICA, groupIdx, uvt]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Comparador Ordinario vs SIMPLE</h1>
        <p className="mt-2 mb-10 text-muted-foreground">Analice cual regimen tributario le conviene mas para el ano {CURRENT_UVT_YEAR}.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight border-b pb-2">Informacion Financiera</h3>
            <CurrencyInput id="ingresos" label="Ingresos Brutos Anuales" value={ingresosBrutos} onChange={setIngresosBrutos} />
            <CurrencyInput id="costos" label="Costos y Deducciones" value={costosDeducciones} onChange={setCostosDeducciones} />
            <CurrencyInput id="exentas" label="Rentas Exentas" value={rentasExentas} onChange={setRentasExentas} />
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight border-b pb-2">Configuracion</h3>
            <div className="flex gap-4">
              <ToggleInput label="Es Persona Juridica" pressed={esPersonaJuridica} onToggle={setEsPersonaJuridica} />
            </div>
            <SelectInput
              id="grupo"
              label="Grupo Regimen SIMPLE"
              value={grupoSimple}
              onChange={setGrupoSimple}
              options={SIMPLE_GROUPS.map(g => ({ value: String(g.id), label: g.label }))}
            />
            <NumberInput id="ica" label="Tarifa ICA Estimada (por mil)" value={tarifaICA} onChange={setTarifaICA} />
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-lg border p-6 shadow-sm ${results.ahorro > 0 ? "bg-muted/50 border-border/60" : "border-border/60 bg-card"}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Recomendacion</h3>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className={`h-8 w-8 ${results.ahorro > 0 ? "text-foreground" : "text-muted-foreground"}`} />
              <span className="text-2xl font-bold">{results.recomendacion}</span>
            </div>
            <p className="text-muted-foreground">
              Ahorro estimado de <span className="font-bold text-foreground">{formatCOP(Math.abs(results.ahorro))}</span> ({results.ahorroPct.toFixed(1)}%)
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Concepto</th>
                  <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Ordinario</th>
                  <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">SIMPLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2">Renta Liquida / Ingresos Brutos</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.rentaLiquida)}</td>
                  <td className="px-4 py-2 text-right">{formatCOP(ingresosBrutos)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Impuesto Renta / SIMPLE</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.impuestoOrd)}</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.totalSimple)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">ICA (Consolidado en SIMPLE)</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.icaOrd)}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground italic">Incluido</td>
                </tr>
                <tr className="font-bold bg-muted/20">
                  <td className="px-4 py-2">TOTAL CARGA TRIBUTARIA</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.totalOrd)}</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.totalSimple)}</td>
                </tr>
                <tr className="font-semibold">
                  <td className="px-4 py-2">Diferencia</td>
                  <td colSpan={2} className="px-4 py-2 text-right">
                    {formatCOP(Math.abs(results.ahorro))} a favor de {results.recomendacion}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold tracking-tight">Ventajas del SIMPLE</h3>
            <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
              <li>Sustituye el impuesto de renta, el nacional al consumo y el ICA municipal.</li>
              <li>Simplifica la declaracion anual en un solo formulario.</li>
              <li>No esta sujeto a retenciones en la fuente ni a autorretenciones.</li>
              <li>Ahorro en aportes a pension (se descuentan del impuesto).</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CalculatorSources articles={["241", "903", "905", "908"]} />
      </div>
    </div>
  );
}
