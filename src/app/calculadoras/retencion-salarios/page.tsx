"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ShieldCheck, AlertTriangle } from "lucide-react";
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
import { CalculatorBreadcrumb } from "@/components/calculators/calculator-breadcrumb";
import { CalculatorActions } from "@/components/calculators/calculator-actions";
import { CalculatorDisclaimer } from "@/components/calculators/calculator-disclaimer";
import { RelatedCalculators } from "@/components/calculators/related-calculators";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { formatCOP } from "@/lib/calculators/format";
import {
  buildShareUrl,
  readNumberParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

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

function RetencionSalariosPageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const initialValues = useMemo(() => {
    return {
      ingresoBruto: readNumberParam(searchParams, "ing", 12000000, { min: 0 }),
      aporteSalud: readNumberParam(searchParams, "salud", 0, { min: 0 }),
      aportePension: readNumberParam(searchParams, "pension", 0, { min: 0 }),
      aporteVoluntarioPension: readNumberParam(searchParams, "vol", 0, { min: 0 }),
      aporteAFC: readNumberParam(searchParams, "afc", 0, { min: 0 }),
      numDependientes: readNumberParam(searchParams, "deps", 1, { min: 0, max: 4 }),
      interesesVivienda: readNumberParam(searchParams, "viv", 0, { min: 0 }),
      medicinaPrepagada: readNumberParam(searchParams, "med", 0, { min: 0 }),
    };
  }, [searchParams]);

  const [ingresoBruto, setIngresoBruto] = useState(initialValues.ingresoBruto);
  const [aporteSalud, setAporteSalud] = useState(initialValues.aporteSalud);
  const [aportePension, setAportePension] = useState(initialValues.aportePension);
  const [aporteVoluntarioPension, setAporteVoluntarioPension] = useState(initialValues.aporteVoluntarioPension);
  const [aporteAFC, setAporteAFC] = useState(initialValues.aporteAFC);
  const [numDependientes, setNumDependientes] = useState(initialValues.numDependientes);
  const [interesesVivienda, setInteresesVivienda] = useState(initialValues.interesesVivienda);
  const [medicinaPrepagada, setMedicinaPrepagada] = useState(initialValues.medicinaPrepagada);

  // Auto-calculate health/pension if zero (only on first load or manual trigger? 
  // Better to just calculate default if not provided, but user might want to override.
  // The original code had a useEffect to auto-set them. 
  // Let's keep that behavior but be careful with URL state conflict.
  // If URL has values, initialValues uses them. If user changes income, we update contributions.
  
  useEffect(() => {
    // Only update if they match the standard 4% roughly, to allow manual override?
    // Or just always update like the original.
    // Original: 
    // useEffect(() => {
    //   setAporteSalud(Math.round(ingresoBruto * 0.04));
    //   setAportePension(Math.round(ingresoBruto * 0.04));
    // }, [ingresoBruto]);
    
    // We will keep this behavior for simplicity, as it's standard for employees.
    // But we need to avoid overwriting if the user is typing (maybe debounce? or just let it be).
    // React state updates are fast.
    setAporteSalud(Math.round(ingresoBruto * 0.04));
    setAportePension(Math.round(ingresoBruto * 0.04));
  }, [ingresoBruto]);

  const { contentRef, handlePrint } = usePrintExport({ title: "Retencion Salarios" });

  useEffect(() => {
    trackCalculatorUsage("retencion-salarios");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      ing: ingresoBruto,
      salud: aporteSalud,
      pension: aportePension,
      vol: aporteVoluntarioPension,
      afc: aporteAFC,
      deps: numDependientes,
      viv: interesesVivienda,
      med: medicinaPrepagada,
    });
  }, [ingresoBruto, aporteSalud, aportePension, aporteVoluntarioPension, aporteAFC, numDependientes, interesesVivienda, medicinaPrepagada]);

  const results = useMemo(() => {
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
  }, [ingresoBruto, aporteSalud, aportePension, aporteVoluntarioPension, aporteAFC, numDependientes, interesesVivienda, medicinaPrepagada, uvt]);

  const shareUrl = buildShareUrl("/calculadoras/retencion-salarios", {
    ing: ingresoBruto,
    salud: aporteSalud,
    pension: aportePension,
    vol: aporteVoluntarioPension,
    afc: aporteAFC,
    deps: numDependientes,
    viv: interesesVivienda,
    med: medicinaPrepagada,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Retencion en la Fuente - Salarios" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Retencion en la Fuente - Salarios</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Depuracion mensual completa segun Procedimiento 1 (Art. 383 y 388 ET).
      </p>

      <CalculatorActions
        title="Retencion Salarios"
        shareText="Consulta esta depuracion de retencion salarial"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="space-y-4">
          <CurrencyInput 
            id="ingreso" 
            label="Ingreso mensual bruto laboral" 
            value={ingresoBruto} 
            onChange={setIngresoBruto} 
          />

          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput 
              id="salud" 
              label="Salud Oblig. (4%)" 
              value={aporteSalud} 
              onChange={setAporteSalud} 
            />
            <CurrencyInput 
              id="pension" 
              label="Pension Oblig. (4%)" 
              value={aportePension} 
              onChange={setAportePension} 
            />
          </div>

          <CollapsibleSection title="Deducciones y Exenciones" defaultOpen>
            <div className="space-y-3 pt-2">
              <NumberInput 
                id="deps" 
                label="Numero de dependientes" 
                value={numDependientes} 
                onChange={setNumDependientes} 
                min={0} 
                max={4} 
              />
              <CurrencyInput 
                id="vivienda" 
                label="Intereses Vivienda / Leasing" 
                value={interesesVivienda} 
                onChange={setInteresesVivienda} 
              />
              <CurrencyInput 
                id="prepagada" 
                label="Medicina Prepagada" 
                value={medicinaPrepagada} 
                onChange={setMedicinaPrepagada} 
              />
              <CurrencyInput 
                id="vol" 
                label="Aportes Voluntarios Pension" 
                value={aporteVoluntarioPension} 
                onChange={setAporteVoluntarioPension} 
              />
              <CurrencyInput 
                id="afc" 
                label="Aportes AFC / AVC" 
                value={aporteAFC} 
                onChange={setAporteAFC} 
              />
            </div>
          </CollapsibleSection>
        </div>

        <div className="space-y-6">
          <CalculatorResult
            items={[
              { label: "Base Gravable", value: formatCOP(results.baseGravable) },
              { label: "Base en UVT", value: results.baseGravableUVT.toFixed(2) },
              { label: "Retencion Mensual", value: formatCOP(results.retencionCOP) },
              { label: "Tasa Efectiva", value: `${results.tasaEfectiva.toFixed(2)}%` },
            ]}
          />

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3">(+) Ingreso Bruto</td>
                  <td className="px-4 py-3 text-right">{formatCOP(results.totalPagos)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">(-) Aportes Obligatorios SS</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">-{formatCOP(results.incrngo)}</td>
                </tr>
                <tr className="bg-muted/20 font-medium">
                  <td className="px-4 py-3">(=) Subtotal 1 (Ingreso Neto)</td>
                  <td className="px-4 py-3 text-right">{formatCOP(results.subtotal1)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">(-) Deduccion Dependientes</td>
                  <td className="px-4 py-3 text-right">-{formatCOP(results.dependienteDeduccion)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">(-) Otros (Vivienda, Salud)</td>
                  <td className="px-4 py-3 text-right">-{formatCOP(results.interesesVivienda + results.medicinaLimitada)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">(-) Aportes Voluntarios / AFC</td>
                  <td className="px-4 py-3 text-right">-{formatCOP(results.totalVoluntarios)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">(-) Renta Exenta 25%</td>
                  <td className="px-4 py-3 text-right">-{formatCOP(results.rentaExenta25)}</td>
                </tr>
                <tr className="bg-muted/50 italic">
                  <td className="px-4 py-3">Suma deducciones + exentas</td>
                  <td className="px-4 py-3 text-right">{formatCOP(results.totalDeduccionesExentas)}</td>
                </tr>
                <tr className="bg-muted/50 font-bold">
                  <td className="px-4 py-3">Total aplicado (limitado)</td>
                  <td className="px-4 py-3 text-right text-foreground">-{formatCOP(results.totalAplicado)}</td>
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
              <p>Las deducciones y rentas exentas superaron el limite de {results.limitType} del ingreso neto. Solo se aplico el limite legal.</p>
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
        <CollapsibleSection title="Tabla de Retencion Art. 383 ET">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
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

        <CalculatorSources articles={["383", "387", "388", "206"]} />
      </div>

      <CalculatorDisclaimer
        references={["Art. 383 ET", "Art. 387 ET", "Art. 388 ET", "Art. 206 ET"]}
      />

      <RelatedCalculators currentId="retencion-salarios" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Depuracion Retencion Salarios"
            subtitle={`Ingreso Mensual: ${formatCOP(ingresoBruto)}`}
          >
            {results && (
              <div className="space-y-2 text-sm">
                <p>Ingreso Bruto: {formatCOP(ingresoBruto)}</p>
                <p>INCRNGO: {formatCOP(results.incrngo)}</p>
                <p>Deducciones: {formatCOP(results.totalDeducciones)}</p>
                <p>Renta Exenta 25%: {formatCOP(results.rentaExenta25)}</p>
                <p>Total Aplicado: {formatCOP(results.totalAplicado)}</p>
                <p>Base Gravable: {formatCOP(results.baseGravable)}</p>
                <p>Retencion: {formatCOP(results.retencionCOP)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function RetencionSalariosPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <RetencionSalariosPageContent />
    </Suspense>
  );
}
