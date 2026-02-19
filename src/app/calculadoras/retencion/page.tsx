"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RETENCION_CONCEPTOS,
  RETENCION_SALARIOS_BRACKETS,
} from "@/config/tax-data";
import {
  CurrencyInput,
  SelectInput,
} from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { CalculatorBreadcrumb } from "@/components/calculators/calculator-breadcrumb";
import { ScenarioSlider } from "@/components/calculators/scenario-slider";
import { CalculationStepsTable } from "@/components/calculators/calculation-steps-table";
import { CalculatorActions } from "@/components/calculators/calculator-actions";
import { CalculatorDisclaimer } from "@/components/calculators/calculator-disclaimer";
import { RelatedCalculators } from "@/components/calculators/related-calculators";
import { RetencionBreakdownChart } from "@/components/calculators/charts/retencion-breakdown-chart";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { formatCOP, formatPercent } from "@/lib/calculators/format";
import {
  buildShareUrl,
  readNumberParam,
  readStringParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

interface RetencionResult {
  aplica: boolean;
  baseMinCOP: number;
  tarifa: number;
  retencion: number;
  neto: number;
  baseDepurada: number;
  conceptoLabel: string;
  isSalarios: boolean;
  deduccionesSS: number;
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

function buildRetencionResult(input: {
  conceptoId: string;
  monto: number;
  deduccionesSS: number;
  uvt: number;
}): RetencionResult | null {
  if (input.monto <= 0) return null;

  const concepto = RETENCION_CONCEPTOS.find((c) => c.id === input.conceptoId) ?? RETENCION_CONCEPTOS[0];
  const isSalarios = concepto.id === "salarios";

  if (isSalarios) {
    const netoCOP = Math.max(0, input.monto - input.deduccionesSS);
    const netoUVT = netoCOP / input.uvt;
    const retencionUVT = calcSalaryRetention(netoUVT);
    const retencionCOP = retencionUVT * input.uvt;

    return {
      aplica: retencionUVT > 0,
      baseMinCOP: 0,
      tarifa: netoCOP > 0 ? retencionCOP / netoCOP : 0,
      retencion: retencionCOP,
      neto: input.monto - retencionCOP,
      baseDepurada: netoCOP,
      conceptoLabel: concepto.concepto,
      isSalarios: true,
      deduccionesSS: input.deduccionesSS,
    };
  }

  const baseMinCOP = concepto.baseUVT * input.uvt;
  const aplica = baseMinCOP === 0 || input.monto >= baseMinCOP;
  const tarifa = concepto.tarifa ?? 0;
  const retencion = aplica ? input.monto * tarifa : 0;

  return {
    aplica,
    baseMinCOP,
    tarifa,
    retencion,
    neto: input.monto - retencion,
    baseDepurada: input.monto,
    conceptoLabel: concepto.concepto,
    isSalarios: false,
    deduccionesSS: 0,
  };
}

function RetencionPageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const initialValues = useMemo(() => {
    const parsedConcepto = readStringParam(searchParams, "c", RETENCION_CONCEPTOS[0].id);
    const exists = RETENCION_CONCEPTOS.some((item) => item.id === parsedConcepto);

    return {
      conceptoId: exists ? parsedConcepto : RETENCION_CONCEPTOS[0].id,
      monto: readNumberParam(searchParams, "m", 0, { min: 0 }),
      deduccionesSS: readNumberParam(searchParams, "ss", 0, { min: 0 }),
      escenarioDelta: readNumberParam(searchParams, "delta", 0),
    };
  }, [searchParams]);

  const [conceptoId, setConceptoId] = useState<string>(initialValues.conceptoId);
  const [monto, setMonto] = useState(initialValues.monto);
  const [deduccionesSS, setDeduccionesSS] = useState(initialValues.deduccionesSS);
  const [escenarioDelta, setEscenarioDelta] = useState(initialValues.escenarioDelta);

  const { contentRef, handlePrint } = usePrintExport({ title: "Retencion en la Fuente" });

  useEffect(() => {
    trackCalculatorUsage("retencion");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      c: conceptoId,
      m: monto,
      ss: deduccionesSS,
      delta: escenarioDelta,
    });
  }, [conceptoId, monto, deduccionesSS, escenarioDelta]);

  const result = useMemo(
    () =>
      buildRetencionResult({
        conceptoId,
        monto,
        deduccionesSS,
        uvt,
      }),
    [conceptoId, monto, deduccionesSS, uvt],
  );

  const escenarioMonto = Math.max(0, monto + escenarioDelta);
  const escenarioResult = useMemo(
    () =>
      buildRetencionResult({
        conceptoId,
        monto: escenarioMonto,
        deduccionesSS,
        uvt,
      }),
    [conceptoId, escenarioMonto, deduccionesSS, uvt],
  );

  const resultItems = result
    ? [
        {
          label: "Aplica retencion",
          value: result.aplica ? "Si" : "No",
          sublabel:
            !result.aplica && result.baseMinCOP > 0
              ? `Base minima: ${formatCOP(result.baseMinCOP)}`
              : undefined,
        },
        {
          label: "Tarifa efectiva",
          value: formatPercent(result.tarifa),
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

  const steps = result
    ? [
        {
          id: "concepto",
          label: `Concepto seleccionado: ${result.conceptoLabel}`,
          value: result.isSalarios ? "Art. 383" : "Tarifa fija",
          explanation:
            "Cada concepto tiene tarifa y base minima diferente segun el Estatuto Tributario y decretos reglamentarios.",
        },
        {
          id: "monto",
          label: result.isSalarios ? "Ingreso mensual bruto" : "Monto del pago",
          value: formatCOP(monto),
          explanation:
            "Valor base antes de retencion. Para salarios se depura restando aportes obligatorios de seguridad social.",
        },
        {
          id: "ss",
          label: "(-) Deducciones de seguridad social",
          value: formatCOP(result.deduccionesSS),
          explanation:
            "Solo aplica en concepto salarios (salud + pension). Se resta para determinar base gravable de retencion.",
          tone: "muted" as const,
        },
        {
          id: "base",
          label: "Base depurada de retencion",
          value: formatCOP(result.baseDepurada),
          explanation:
            "Base sobre la que se aplica la tarifa fija o la tabla progresiva de retencion salarial.",
          tone: "subtotal" as const,
        },
        {
          id: "retencion",
          label: "Retencion calculada",
          value: formatCOP(result.retencion),
          explanation:
            "Valor retenido por el agente retenedor en el momento del pago o abono en cuenta.",
          tone: "total" as const,
        },
        {
          id: "neto",
          label: "Valor neto a pagar",
          value: formatCOP(result.neto),
          explanation:
            "Monto final recibido por el beneficiario luego de practicar la retencion.",
          tone: "total" as const,
        },
      ]
    : [];

  const relatedArticles = [...new Set(RETENCION_CONCEPTOS.map((c) => c.art))];

  const shareUrl = buildShareUrl("/calculadoras/retencion", {
    c: conceptoId,
    m: monto,
    ss: deduccionesSS,
    delta: escenarioDelta,
  });

  const isSalarios = conceptoId === "salarios";

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Retencion en la Fuente" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Retencion en la Fuente</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Simulador de retencion por concepto, con soporte de tabla progresiva salarial (Art. 383 ET).
      </p>

      <CalculatorActions
        title="Retencion en la Fuente"
        shareText="Consulta este escenario de retencion en la fuente"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-6 space-y-4">
        <SelectInput
          id="ret-concepto"
          label="Concepto"
          value={conceptoId}
          onChange={(value) => {
            setConceptoId(value);
            setMonto(0);
            setDeduccionesSS(0);
            setEscenarioDelta(0);
          }}
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

      <ScenarioSlider
        label="Escenario: Que pasa si el pago sube o baja?"
        helper="El ajuste modifica el monto base y recalcula retencion y neto de forma inmediata."
        min={-2_000_000}
        max={15_000_000}
        step={100_000}
        value={escenarioDelta}
        onChange={setEscenarioDelta}
        formatValue={formatCOP}
      />

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      {result && (
        <RetencionBreakdownChart
          monto={monto}
          baseDepurada={result.baseDepurada}
          retencion={result.retencion}
          neto={result.neto}
          isSalarios={result.isSalarios}
        />
      )}

      {result && (
        <div className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Escenario comparativo</p>
          <p className="mt-1">
            Con un monto de <strong>{formatCOP(escenarioMonto)}</strong>, la retencion proyectada seria
            <strong> {formatCOP(escenarioResult?.retencion ?? 0)}</strong>. Variacion frente al caso base:
            <strong> {formatCOP((escenarioResult?.retencion ?? 0) - result.retencion)}</strong>.
          </p>
        </div>
      )}

      {steps.length > 0 && (
        <CalculationStepsTable title="Paso a paso del calculo" rows={steps} valueColumnTitle="Resultado" />
      )}

      {isSalarios && (
        <div className="mb-6">
          <h2 className="mb-4 heading-serif text-lg">Tabla progresiva Art. 383 ET</h2>
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                  <th className="px-4 py-3 text-left">Desde (UVT)</th>
                  <th className="px-4 py-3 text-left">Hasta (UVT)</th>
                  <th className="px-4 py-3 text-right">Tarifa</th>
                </tr>
              </thead>
              <tbody>
                {RETENCION_SALARIOS_BRACKETS.map((b, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{b.from}</td>
                    <td className="px-4 py-3">{b.to === Infinity ? "En adelante" : b.to}</td>
                    <td className="px-4 py-3 text-right">{(b.rate * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CalculatorSources
        articles={relatedArticles.map((art) => ({
          id: art,
          reason: art === "383"
            ? "Tabla progresiva de retencion para pagos laborales."
            : "Tarifas y bases minimas por concepto de retencion.",
        }))}
      />

      <CalculatorDisclaimer
        references={[
          "Art. 383 ET",
          "Art. 392 ET",
          "Art. 401 ET",
          "Decreto 0572 de 2025",
        ]}
      />

      <RelatedCalculators currentId="retencion" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Retencion en la Fuente"
            subtitle="Resumen del escenario de retencion"
          >
            {result && (
              <div className="space-y-2 text-sm">
                <p>Concepto: {result.conceptoLabel}</p>
                <p>Monto base: {formatCOP(monto)}</p>
                <p>Base depurada: {formatCOP(result.baseDepurada)}</p>
                <p>Retencion: {formatCOP(result.retencion)}</p>
                <p>Valor neto: {formatCOP(result.neto)}</p>
                <p>Tarifa efectiva: {formatPercent(result.tarifa)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function RetencionPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <RetencionPageContent />
    </Suspense>
  );
}
