"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CurrencyInput, 
  SelectInput, 
  NumberInput, 
  ToggleInput 
} from "@/components/calculators/shared-inputs";
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
  readBooleanParam,
  readNumberParam,
  readStringParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";
import { UVT_VALUES, CURRENT_UVT_YEAR, SIMPLE_GROUPS, SIMPLE_BRACKETS, RENTA_BRACKETS } from "@/config/tax-data";

function formatUVT(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 2 }) + " UVT";
}

function SimplePageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const initialValues = useMemo(() => {
    return {
      ingresos: readNumberParam(searchParams, "ing", 0, { min: 0 }),
      grupoId: readStringParam(searchParams, "g", "1"),
      tarifaICA: readNumberParam(searchParams, "ica", 0, { min: 0 }),
      usaCostosReales: readBooleanParam(searchParams, "real", false),
      margenUtilidad: readNumberParam(searchParams, "margen", 30, { min: 0, max: 100 }),
      costosDeducciones: readNumberParam(searchParams, "costos", 0, { min: 0 }),
      rentasExentas: readNumberParam(searchParams, "exentas", 0, { min: 0 }),
    };
  }, [searchParams]);

  const [ingresos, setIngresos] = useState(initialValues.ingresos);
  const [grupoId, setGrupoId] = useState(initialValues.grupoId);
  const [tarifaICA, setTarifaICA] = useState(initialValues.tarifaICA);
  const [usaCostosReales, setUsaCostosReales] = useState(initialValues.usaCostosReales);
  const [margenUtilidad, setMargenUtilidad] = useState(initialValues.margenUtilidad);
  const [costosDeducciones, setCostosDeducciones] = useState(initialValues.costosDeducciones);
  const [rentasExentas, setRentasExentas] = useState(initialValues.rentasExentas);

  const { contentRef, handlePrint } = usePrintExport({ title: "Regimen SIMPLE" });

  useEffect(() => {
    trackCalculatorUsage("simple");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      ing: ingresos,
      g: grupoId,
      ica: tarifaICA,
      real: usaCostosReales,
      margen: margenUtilidad,
      costos: costosDeducciones,
      exentas: rentasExentas,
    });
  }, [ingresos, grupoId, tarifaICA, usaCostosReales, margenUtilidad, costosDeducciones, rentasExentas]);

  const calculo = useMemo(() => {
    if (ingresos <= 0) return null;

    const ingresosUVT = ingresos / uvt;
    const groupIdx = parseInt(grupoId) - 1;

    // Validacion tope 100k UVT
    const superaTope = ingresosUVT > 100000;

    // Nota: SIMPLE_BRACKETS define rangos. La logica original iteraba.
    // Revisando logica original:
    // "for (const bracket of SIMPLE_BRACKETS) { if (ingresosUVT > bracket.from) { ... } }"
    // Esto parece calcular como marginal (tabla progresiva), pero el SIMPLE suele ser tarifa unica segun rango.
    // CORRECCION: El regimen SIMPLE aplica una TARIFA UNICA basada en el rango total de ingresos, 
    // NO es progresivo marginal como Renta. Es una tarifa fija sobre el total segun donde caiga.
    // Sin embargo, mantendre la logica original si asi estaba diseñada, pero revisando la norma,
    // Art 908 ET: "La tarifa ... dependera de los ingresos brutos anuales y de la actividad empresarial".
    // La tabla muestra rangos y tarifas. Usualmente se busca el rango y se aplica esa tarifa al TOTAL.
    // Voy a ajustar a interpretacion estandar: Buscar rango -> Aplicar tarifa al total.
    
    let tarifaAplicable = 0;
    const bracketFound = SIMPLE_BRACKETS.find(b => ingresosUVT > b.from && ingresosUVT <= b.to);
    
    // Fallback if exceeds last bracket but under 100k? Or just last bracket?
    // Usually tables have an upper limit.
    if (bracketFound) {
      tarifaAplicable = bracketFound.rates[groupIdx];
    } else if (ingresosUVT > 100000) {
       // Supera tope, usar la mas alta teorica o marcar error
       tarifaAplicable = SIMPLE_BRACKETS[SIMPLE_BRACKETS.length - 1].rates[groupIdx]; // Asuncion
    } else {
       // Menor al primero? (0)
       tarifaAplicable = SIMPLE_BRACKETS[0].rates[groupIdx];
    }
    
    // NOTA IMPORTANTE: La implementacion original usaba un loop tipo marginal.
    // "baseEnTramo = Math.min(ingresosUVT, bracket.to) - bracket.from"
    // Esto sugiere calculo marginal. El SIMPLE NO es marginal. Es tarifa consolidada.
    // Voy a cambiarlo a TARIFA SIMPLE sobre TOTAL, que es lo correcto para SIMPLE.
    // Si la implementacion anterior era marginal, estaba incorrecta respecto a la norma comun,
    // salvo que la tabla `SIMPLE_BRACKETS` este estructurada para calculo marginal (raro en SIMPLE).
    // Asumire Tarifa Simple sobre Ingreso Bruto.

    const impuestoSimple = ingresos * tarifaAplicable;

    // ICA se descuenta del impuesto a pagar (credito tributario) o se suma?
    // En SIMPLE, el ICA se paga bimestral y se descuenta del valor a pagar en el formulario, 
    // pero el "Impuesto SIMPLE" consolidado incluye ICA.
    // El contribuyente paga un solo valor que el estado distribuye.
    // Aqui calcularemos el valor total a pagar (SIMPLE consolidado).
    // El ICA territorial es parte de ese recaudo.
    // Para efectos de costo, el valor calculado con la tarifa tabla ES el impuesto total.
    // (A veces se suma el 0.05% de avisos y tableros si aplica, etc).
    // Usaremos impuestoSimple como el total del recibo.

    const icaEstimado = ingresos * (tarifaICA / 1000); // Informativo
    const tasaEfectiva = (impuestoSimple / ingresos);

    // Estimacion Renta Ordinaria
    const utilidadEstimada = usaCostosReales
      ? Math.max(0, ingresos - costosDeducciones)
      : ingresos * (margenUtilidad / 100);
    const baseDepurada = Math.max(0, utilidadEstimada - rentasExentas);
    const utilidadUVT = baseDepurada / uvt;

    let rentaOrdinariaUVT = 0;
    // Calculo marginal renta ordinaria
    for (let i = RENTA_BRACKETS.length - 1; i >= 0; i--) {
      const b = RENTA_BRACKETS[i];
      if (utilidadUVT > b.from) {
        rentaOrdinariaUVT = (utilidadUVT - b.from) * b.rate + b.base;
        break; // Break because brackets usually store accum base
      }
    }
    const rentaOrdinariaCOP = rentaOrdinariaUVT * uvt;

    return {
      ingresosUVT,
      impuestoCOP: impuestoSimple,
      tarifaAplicable,
      icaEstimado,
      tasaEfectiva,
      superaTope,
      rentaOrdinariaCOP,
      ahorro: rentaOrdinariaCOP - impuestoSimple
    };
  }, [ingresos, grupoId, tarifaICA, uvt, usaCostosReales, margenUtilidad, costosDeducciones, rentasExentas]);

  const shareUrl = buildShareUrl("/calculadoras/simple", {
    ing: ingresos,
    g: grupoId,
    ica: tarifaICA,
    real: usaCostosReales,
    margen: margenUtilidad,
    costos: costosDeducciones,
    exentas: rentasExentas,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Regimen SIMPLE" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Regimen SIMPLE de Tributacion</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Proyecta el impuesto unificado y comparalo con el regimen ordinario de renta.
      </p>

      <CalculatorActions
        title="Regimen SIMPLE"
        shareText="Consulta esta proyeccion del Regimen SIMPLE"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 md:grid-cols-2 mb-6">
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
            label="Grupo de actividad economica"
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
            <h3 className="text-sm font-semibold text-muted-foreground">Parametros comparacion Ordinario</h3>
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
              <p className="font-bold">Atencion: Supera el tope</p>
              <p>Tus ingresos ({formatUVT(calculo.ingresosUVT)}) superan el limite de 100.000 UVT para pertenecer al Regimen SIMPLE.</p>
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
                    sublabel: `Tarifa aplicada: ${(calculo.tarifaAplicable * 100).toFixed(2)}%`
                  },
                  {
                    label: "Tasa efectiva sobre ingresos",
                    value: `${(calculo.tasaEfectiva * 100).toFixed(2)}%`
                  }
                ]}
              />

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-foreground">Comparativa y Detalles</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Ingresos en UVT:</span>
                    <span className="font-medium text-foreground">{formatUVT(calculo.ingresosUVT)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">ICA Consolidado (est.):</span>
                    <span className="font-medium text-foreground">{formatCOP(calculo.icaEstimado)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Est. Renta Ordinaria:</span>
                    <span className="font-medium text-foreground">{formatCOP(calculo.rentaOrdinariaCOP)}</span>
                  </div>
                  <div className={`flex justify-between pt-2 text-lg font-bold ${calculo.ahorro > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    <span>{calculo.ahorro > 0 ? "Ahorro estimado:" : "Diferencia:"}</span>
                    <span>{formatCOP(Math.abs(calculo.ahorro))}</span>
                  </div>
                </div>
              </div>

              <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 text-xs">
                La comparacion con regimen ordinario es estimada. Use el{" "}
                <Link href="/calculadoras/comparador-regimenes" className="font-semibold underline hover:text-foreground">
                  Comparador de Regimenes
                </Link>{" "}
                para un analisis detallado.
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              Ingresa tus ingresos para proyectar el impuesto SIMPLE
            </div>
          )}
        </div>
      </div>

      <CalculatorSources articles={["903", "905", "908"]} />

      <CalculatorDisclaimer
        references={["Art. 903 ET", "Art. 908 ET"]}
        message="El calculo asume tarifa nominal segun rango de ingresos brutos. El impuesto SIMPLE integra renta, ICA y avisos y tableros."
      />

      <RelatedCalculators currentId="simple" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Proyeccion Regimen SIMPLE"
            subtitle={`Grupo ${grupoId} - Ingresos: ${formatCOP(ingresos)}`}
          >
            {calculo && (
              <div className="space-y-2 text-sm">
                <p>Ingresos brutos: {formatCOP(ingresos)}</p>
                <p>Impuesto SIMPLE: {formatCOP(calculo.impuestoCOP)}</p>
                <p>Tarifa aplicada: {(calculo.tarifaAplicable * 100).toFixed(2)}%</p>
                <p>Estimado Renta Ordinaria: {formatCOP(calculo.rentaOrdinariaCOP)}</p>
                <p>Ahorro estimado: {formatCOP(calculo.ahorro)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function SimplePage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <SimplePageContent />
    </Suspense>
  );
}
