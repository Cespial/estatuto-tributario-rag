"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RETENCION_SALARIOS_BRACKETS,
  LEY_2277_LIMITS
} from "@/config/tax-data";
import { DEPURACION_LIMITS } from "@/config/tax-data-laboral";
import { CurrencyInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

export default function RetencionSalariosPage() {
  const [ingresoBruto, setIngresoBruto] = useState(12000000);
  const [aporteSalud, setAporteSalud] = useState(0);
  const [aportePension, setAportePension] = useState(0);
  const [aporteVoluntarioPension, setAporteVoluntarioPension] = useState(0);
  const [aporteAFC, setAporteAFC] = useState(0);
  const [numDependientes, setNumDependientes] = useState(1);
  const [interesesVivienda, setInteresesVivienda] = useState(0);
  const [medicinaPrepagada, setMedicinaPrepagada] = useState(0);

  // Pre-fill mandatory contributions
  useEffect(() => {
    setAporteSalud(Math.round(ingresoBruto * 0.04));
    setAportePension(Math.round(ingresoBruto * 0.04));
  }, [ingresoBruto]);

  const results = useMemo(() => {
    const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

    // Step 1: Total pagos
    const totalPagos = ingresoBruto;

    // Step 2: INCRNGO
    const incrngo = aporteSalud + aportePension;

    // Step 3: Subtotal 1
    const subtotal1 = Math.max(0, totalPagos - incrngo);

    // Step 4: Deducciones Art. 387
    const dependienteDeduccion = numDependientes > 0
      ? Math.min(subtotal1 * DEPURACION_LIMITS.dependientePct, DEPURACION_LIMITS.dependienteMaxUVTMensual * uvt)
      : 0;

    const medicinaLimitada = Math.min(medicinaPrepagada, DEPURACION_LIMITS.medicinaPrepagadaMaxUVTMensual * uvt);
    const totalDeducciones = dependienteDeduccion + interesesVivienda + medicinaLimitada;

    // Step 5: Aportes voluntarios
    const totalVoluntarios = aporteVoluntarioPension + aporteAFC;

    // Step 6: Renta exenta 25%
    const subtotal2 = Math.max(0, subtotal1 - totalDeducciones - totalVoluntarios);
    const rentaExenta25 = subtotal2 * DEPURACION_LIMITS.rentaExenta25Pct;

    // Step 7: Global limit 40%
    const totalDeduccionesExentas = totalDeducciones + totalVoluntarios + rentaExenta25;
    const limiteGlobal = subtotal1 * DEPURACION_LIMITS.limiteGlobalPct;
    const limiteUVTMensual = (LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt) / 12;

    const totalAplicado = Math.min(totalDeduccionesExentas, limiteGlobal, limiteUVTMensual);
    const limitType = totalDeduccionesExentas > totalAplicado
      ? (totalAplicado === limiteGlobal ? "40%" : "1,340 UVT")
      : null;

    // Step 8: Base gravable
    const baseGravable = Math.max(0, subtotal1 - totalAplicado);
    const baseGravableUVT = baseGravable / uvt;

    // Step 9: Apply Art. 383 table
    let retencionUVT = 0;
    let bracketFound = RETENCION_SALARIOS_BRACKETS[0];
    for (let i = RETENCION_SALARIOS_BRACKETS.length - 1; i >= 0; i--) {
      const bracket = RETENCION_SALARIOS_BRACKETS[i];
      if (baseGravableUVT > bracket.from) {
        retencionUVT = (baseGravableUVT - bracket.from) * bracket.rate + bracket.base;
        bracketFound = bracket;
        break;
      }
    }

    const retencionCOP = retencionUVT * uvt;
    const tasaEfectiva = ingresoBruto > 0 ? (retencionCOP / ingresoBruto) * 100 : 0;

    return {
      uvt,
      totalPagos,
      incrngo,
      subtotal1,
      dependienteDeduccion,
      medicinaLimitada,
      totalDeducciones,
      totalVoluntarios,
      rentaExenta25,
      totalDeduccionesExentas,
      limiteGlobal,
      limiteUVTMensual,
      totalAplicado,
      limitType,
      baseGravable,
      baseGravableUVT,
      retencionCOP,
      tasaEfectiva,
      bracketFound,
      interesesVivienda
    };
  }, [ingresoBruto, aporteSalud, aportePension, aporteVoluntarioPension, aporteAFC, numDependientes, interesesVivienda, medicinaPrepagada]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a calculadoras
        </Link>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Retención en la Fuente — Salarios</h1>
        <p className="mt-2 text-muted-foreground">Depuración mensual completa según Procedimiento 1 (Art. 388 ET) para el año 2026.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <CurrencyInput id="ingreso" label="Ingreso mensual bruto laboral" value={ingresoBruto} onChange={setIngresoBruto} />

          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput id="salud" label="Salud Oblig. (4%)" value={aporteSalud} onChange={setAporteSalud} />
            <CurrencyInput id="pension" label="Pensión Oblig. (4%)" value={aportePension} onChange={setAportePension} />
          </div>

          <CollapsibleSection title="Deducciones y Exenciones" defaultOpen>
            <div className="space-y-3 pt-2">
              <NumberInput id="deps" label="Número de dependientes" value={numDependientes} onChange={setNumDependientes} min={0} max={4} />
              <CurrencyInput id="vivienda" label="Intereses Vivienda / Leasing" value={interesesVivienda} onChange={setInteresesVivienda} />
              <CurrencyInput id="prepagada" label="Medicina Prepagada" value={medicinaPrepagada} onChange={setMedicinaPrepagada} />
              <CurrencyInput id="vol" label="Aportes Voluntarios Pensión" value={aporteVoluntarioPension} onChange={setAporteVoluntarioPension} />
              <CurrencyInput id="afc" label="Aportes AFC / AVC" value={aporteAFC} onChange={setAporteAFC} />
            </div>
          </CollapsibleSection>
        </div>

        <div className="space-y-6">
          <CalculatorResult
            items={[
              { label: "Base Gravable", value: formatCOP(results.baseGravable) },
              { label: "Base en UVT", value: results.baseGravableUVT.toFixed(2) },
              { label: "Retención Mensual", value: formatCOP(results.retencionCOP) },
              { label: "Tasa Efectiva", value: `${results.tasaEfectiva.toFixed(2)}%` },
            ]}
          />

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Concepto</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2">(+) Ingreso Bruto</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.totalPagos)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">(-) Aportes Obligatorios SS</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">-{formatCOP(results.incrngo)}</td>
                </tr>
                <tr className="bg-muted/20 font-medium">
                  <td className="px-4 py-2">(=) Subtotal 1 (Ingreso Neto)</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.subtotal1)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">(-) Deducción Dependientes</td>
                  <td className="px-4 py-2 text-right">-{formatCOP(results.dependienteDeduccion)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">(-) Otros (Vivienda, Salud)</td>
                  <td className="px-4 py-2 text-right">-{formatCOP(results.interesesVivienda + results.medicinaLimitada)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">(-) Aportes Voluntarios / AFC</td>
                  <td className="px-4 py-2 text-right">-{formatCOP(results.totalVoluntarios)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">(-) Renta Exenta 25%</td>
                  <td className="px-4 py-2 text-right">-{formatCOP(results.rentaExenta25)}</td>
                </tr>
                <tr className="bg-muted/50 italic">
                  <td className="px-4 py-2">Suma deducciones + exentas</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.totalDeduccionesExentas)}</td>
                </tr>
                <tr className="bg-muted/50 font-bold">
                  <td className="px-4 py-2">Total aplicado (limitado)</td>
                  <td className="px-4 py-2 text-right text-foreground">-{formatCOP(results.totalAplicado)}</td>
                </tr>
                <tr className="bg-muted/30 font-bold">
                  <td className="px-4 py-3">(=) BASE GRAVABLE</td>
                  <td className="px-4 py-3 text-right">{formatCOP(results.baseGravable)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {results.limitType && (
            <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 flex gap-3 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>Las deducciones y rentas exentas superaron el límite de {results.limitType} del ingreso neto. Solo se aplicó el límite legal.</p>
            </div>
          )}

          <div className="flex gap-3 rounded-lg bg-muted/50 border border-border/60 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-foreground/70" />
            <div>
              <p className="font-semibold text-foreground">Rango Tabla Art. 383:</p>
              <p>Base en UVT: {results.baseGravableUVT.toFixed(2)}. Tarifa aplicada: {(results.bracketFound.rate * 100).toFixed(0)}%.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <CollapsibleSection title="Tabla de Retención Art. 383 ET">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Desde (UVT)</th>
                  <th className="px-3 py-2">Hasta (UVT)</th>
                  <th className="px-3 py-2">Tarifa Marginal</th>
                  <th className="px-3 py-2">Base Fija (UVT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                {RETENCION_SALARIOS_BRACKETS.map((b, i) => (
                  <tr key={i} className={results.baseGravableUVT > b.from && results.baseGravableUVT <= (b.to || Infinity) ? "bg-muted font-bold text-foreground" : ""}>
                    <td className="px-3 py-2">{b.from}</td>
                    <td className="px-3 py-2">{b.to === Infinity ? "En adelante" : b.to}</td>
                    <td className="px-3 py-2">{(b.rate * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2">{b.base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Límites de la Ley 2277 de 2022">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Límite Global del 40%:</strong> La suma de deducciones y rentas exentas no puede superar el 40% del subtotal 1 (Ingreso bruto - INCRNGO).</p>
            <p><strong>Límite Anual/Mensual en UVT:</strong> Además del 40%, existe un tope absoluto de 1,340 UVT anuales (aprox. 111.6 UVT mensuales) para el conjunto de beneficios tributarios.</p>
            <p><strong>Renta Exenta del 25%:</strong> Se calcula sobre el neto después de deducciones, pero está limitada a 790 UVT anuales (aprox. 65.8 UVT mensuales).</p>
          </div>
        </CollapsibleSection>

        <CalculatorSources articles={["383", "387", "388", "206"]} />
      </div>
    </div>
  );
}
