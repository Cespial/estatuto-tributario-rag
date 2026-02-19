"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RENTA_BRACKETS,
  LEY_2277_LIMITS,
} from "@/config/tax-data";
import {
  CurrencyInput,
  NumberInput,
} from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { CalculatorBreadcrumb } from "@/components/calculators/calculator-breadcrumb";
import { ScenarioSlider } from "@/components/calculators/scenario-slider";
import { CalculationStepsTable } from "@/components/calculators/calculation-steps-table";
import { CalculatorActions } from "@/components/calculators/calculator-actions";
import { CalculatorDisclaimer } from "@/components/calculators/calculator-disclaimer";
import { RelatedCalculators } from "@/components/calculators/related-calculators";
import { RentaBreakdownChart } from "@/components/calculators/charts/renta-breakdown-chart";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { formatCOP, formatPercent } from "@/lib/calculators/format";
import {
  buildShareUrl,
  readNumberParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

interface RentaResult {
  ingreso: number;
  rentaLiquidaCOP: number;
  rentaLiquidaUVT: number;
  impuestoUVT: number;
  impuestoCOP: number;
  tasaEfectiva: number;
  breakdown: Array<{ from: number; to: number; rate: number; impuesto: number }>;
  totalDeduccionesExentas: number;
  deduccionDependientes: number;
  exentasAplicadas: number;
  warnings: {
    exentasCapped: boolean;
    combinadoCapped: boolean;
    dependientesCapped: boolean;
  };
}

function calcImpuestoRenta(
  rentaLiquidaUVT: number,
): { impuestoUVT: number; breakdown: Array<{ from: number; to: number; rate: number; impuesto: number }> } {
  const breakdown: Array<{ from: number; to: number; rate: number; impuesto: number }> = [];
  let impuestoUVT = 0;

  for (const bracket of RENTA_BRACKETS) {
    if (rentaLiquidaUVT <= bracket.from) break;
    const taxable = Math.min(rentaLiquidaUVT, bracket.to) - bracket.from;
    const tax = taxable * bracket.rate;

    if (tax > 0) {
      breakdown.push({
        from: bracket.from,
        to: Math.min(rentaLiquidaUVT, bracket.to),
        rate: bracket.rate,
        impuesto: tax,
      });
    }

    impuestoUVT += Math.max(0, tax);
  }

  return { impuestoUVT, breakdown };
}

function buildRentaResult(input: {
  ingreso: number;
  deducciones: number;
  rentasExentas: number;
  dependientes: number;
  uvt: number;
}): RentaResult | null {
  if (input.ingreso <= 0) return null;

  const numDep = Math.min(input.dependientes, LEY_2277_LIMITS.maxDependientes);
  const deduccionDependientes = numDep * LEY_2277_LIMITS.dependienteUVT * input.uvt;

  const maxExentasCOP = LEY_2277_LIMITS.rentasExentasMaxUVT * input.uvt;
  const exentasAplicadas = Math.min(input.rentasExentas, maxExentasCOP);

  const maxCombinadoCOP = LEY_2277_LIMITS.deduccionesExentasMaxUVT * input.uvt;
  const totalDeduccionesExentas = Math.min(
    input.deducciones + exentasAplicadas + deduccionDependientes,
    maxCombinadoCOP,
  );

  const rentaLiquidaCOP = Math.max(0, input.ingreso - totalDeduccionesExentas);
  const rentaLiquidaUVT = rentaLiquidaCOP / input.uvt;

  const { impuestoUVT, breakdown } = calcImpuestoRenta(rentaLiquidaUVT);
  const impuestoCOP = impuestoUVT * input.uvt;
  const tasaEfectiva = input.ingreso > 0 ? impuestoCOP / input.ingreso : 0;

  return {
    ingreso: input.ingreso,
    rentaLiquidaCOP,
    rentaLiquidaUVT,
    impuestoUVT,
    impuestoCOP,
    tasaEfectiva,
    breakdown,
    totalDeduccionesExentas,
    deduccionDependientes,
    exentasAplicadas,
    warnings: {
      exentasCapped: input.rentasExentas > maxExentasCOP,
      combinadoCapped: input.deducciones + input.rentasExentas + deduccionDependientes > maxCombinadoCOP,
      dependientesCapped: input.dependientes > LEY_2277_LIMITS.maxDependientes,
    },
  };
}

function RentaPageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const initialValues = useMemo(
    () => ({
      ingresoBruto: readNumberParam(searchParams, "ing", 0, { min: 0 }),
      deducciones: readNumberParam(searchParams, "ded", 0, { min: 0 }),
      rentasExentas: readNumberParam(searchParams, "exe", 0, { min: 0 }),
      dependientes: readNumberParam(searchParams, "dep", 0, {
        min: 0,
        max: LEY_2277_LIMITS.maxDependientes,
      }),
      escenarioDelta: readNumberParam(searchParams, "delta", 0),
    }),
    [searchParams],
  );

  const [ingresoBruto, setIngresoBruto] = useState(initialValues.ingresoBruto);
  const [deducciones, setDeducciones] = useState(initialValues.deducciones);
  const [rentasExentas, setRentasExentas] = useState(initialValues.rentasExentas);
  const [dependientes, setDependientes] = useState(initialValues.dependientes);
  const [escenarioDelta, setEscenarioDelta] = useState(initialValues.escenarioDelta);

  const { contentRef, handlePrint } = usePrintExport({
    title: "Renta Personas Naturales",
  });

  useEffect(() => {
    trackCalculatorUsage("renta");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      ing: ingresoBruto,
      ded: deducciones,
      exe: rentasExentas,
      dep: dependientes,
      delta: escenarioDelta,
    });
  }, [ingresoBruto, deducciones, rentasExentas, dependientes, escenarioDelta]);

  const result = useMemo(
    () =>
      buildRentaResult({
        ingreso: ingresoBruto,
        deducciones,
        rentasExentas,
        dependientes,
        uvt,
      }),
    [ingresoBruto, deducciones, rentasExentas, dependientes, uvt],
  );

  const escenarioIngreso = Math.max(0, ingresoBruto + escenarioDelta);
  const escenarioResult = useMemo(
    () =>
      buildRentaResult({
        ingreso: escenarioIngreso,
        deducciones,
        rentasExentas,
        dependientes,
        uvt,
      }),
    [escenarioIngreso, deducciones, rentasExentas, dependientes, uvt],
  );

  const resultItems = result
    ? [
        {
          label: "Renta liquida gravable",
          value: formatCOP(result.rentaLiquidaCOP),
          sublabel: `${result.rentaLiquidaUVT.toFixed(2)} UVT`,
        },
        {
          label: "Impuesto de renta",
          value: formatCOP(result.impuestoCOP),
          sublabel: `${result.impuestoUVT.toFixed(2)} UVT`,
        },
        {
          label: "Tasa efectiva",
          value: formatPercent(result.tasaEfectiva),
          sublabel: "Sobre ingreso bruto anual",
        },
        {
          label: "Deducciones + exentas aplicadas",
          value: formatCOP(result.totalDeduccionesExentas),
        },
      ]
    : [];

  const chartSegments =
    result?.breakdown.map((b, index) => ({
      name: `Tramo ${index + 1} (${(b.rate * 100).toFixed(0)}%)`,
      value: b.impuesto * uvt,
    })) ?? [];

  const steps = result
    ? [
        {
          id: "ingreso",
          label: "Ingreso bruto anual",
          value: formatCOP(result.ingreso),
          explanation:
            "Corresponde al total de ingresos laborales y no laborales gravados del periodo.",
        },
        {
          id: "deducciones",
          label: "(-) Deducciones reportadas",
          value: formatCOP(deducciones),
          explanation:
            "Deducciones procedentes debidamente soportadas. Esta calculadora aplica limites globales al final.",
          tone: "muted" as const,
        },
        {
          id: "exentas",
          label: `(-) Rentas exentas aplicadas (tope ${LEY_2277_LIMITS.rentasExentasMaxUVT} UVT)`,
          value: formatCOP(result.exentasAplicadas),
          explanation:
            "Las rentas exentas se limitan a 790 UVT anuales conforme a Ley 2277 de 2022.",
          tone: "muted" as const,
        },
        {
          id: "dependientes",
          label: "(-) Deduccion por dependientes",
          value: formatCOP(result.deduccionDependientes),
          explanation:
            "Se reconoce hasta 4 dependientes, 72 UVT anuales por cada uno.",
          tone: "muted" as const,
        },
        {
          id: "topeglobal",
          label: `Total aplicado (tope global ${LEY_2277_LIMITS.deduccionesExentasMaxUVT} UVT)`,
          value: formatCOP(result.totalDeduccionesExentas),
          explanation:
            "La suma de deducciones y rentas exentas no puede superar 1,340 UVT anuales.",
          tone: "subtotal" as const,
        },
        {
          id: "renta-liquida",
          label: "(=) Renta liquida gravable",
          value: formatCOP(result.rentaLiquidaCOP),
          explanation:
            "Base gravable final expresada en pesos para aplicar la tabla marginal del Art. 241 ET.",
          tone: "total" as const,
        },
        {
          id: "impuesto",
          label: "Impuesto de renta estimado",
          value: formatCOP(result.impuestoCOP),
          explanation:
            "Resultado de sumar el impuesto marginal causado en cada tramo UVT aplicable.",
          tone: "total" as const,
        },
      ]
    : [];

  const shareUrl = buildShareUrl("/calculadoras/renta", {
    ing: ingresoBruto,
    ded: deducciones,
    exe: rentasExentas,
    dep: dependientes,
    delta: escenarioDelta,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Renta Personas Naturales" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Renta Personas Naturales</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Simulador para personas naturales con tabla marginal del Art. 241 ET y limites de la Ley 2277 de 2022.
      </p>

      <CalculatorActions
        title="Renta Personas Naturales"
        shareText="Consulta este escenario de renta personas naturales"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-6 space-y-4">
        <CurrencyInput
          id="renta-ingreso"
          label="Ingreso bruto anual"
          value={ingresoBruto}
          onChange={setIngresoBruto}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CurrencyInput
            id="renta-deducciones"
            label="Deducciones"
            value={deducciones}
            onChange={setDeducciones}
          />
          <CurrencyInput
            id="renta-exentas"
            label={`Rentas exentas (max ${LEY_2277_LIMITS.rentasExentasMaxUVT} UVT)`}
            value={rentasExentas}
            onChange={setRentasExentas}
          />
          <NumberInput
            id="renta-dependientes"
            label={`Dependientes (max ${LEY_2277_LIMITS.maxDependientes})`}
            value={dependientes}
            onChange={setDependientes}
            min={0}
            max={LEY_2277_LIMITS.maxDependientes}
          />
        </div>
      </div>

      <ScenarioSlider
        label="Escenario: Que pasa si gano $X mas?"
        helper="Ajusta el incremento para ver el impacto directo en impuesto y tasa efectiva."
        min={-5_000_000}
        max={30_000_000}
        step={250_000}
        value={escenarioDelta}
        onChange={setEscenarioDelta}
        formatValue={formatCOP}
      />

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      {result && chartSegments.length > 0 && (
        <RentaBreakdownChart
          segments={chartSegments}
          ingresoBruto={result.ingreso}
          deduccionesAplicadas={result.totalDeduccionesExentas}
          impuesto={result.impuestoCOP}
        />
      )}

      {result && (
        <div className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Escenario comparativo</p>
          <p className="mt-1">
            Con ingreso anual de <strong>{formatCOP(escenarioIngreso)}</strong>, el impuesto proyectado seria
            <strong> {formatCOP(escenarioResult?.impuestoCOP ?? 0)}</strong>. Variacion frente al caso base:
            <strong> {formatCOP((escenarioResult?.impuestoCOP ?? 0) - result.impuestoCOP)}</strong>.
          </p>
        </div>
      )}

      {result?.warnings && (
        <div className="mb-6 space-y-2">
          {result.warnings.exentasCapped && (
            <p className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
              Rentas exentas limitadas a {LEY_2277_LIMITS.rentasExentasMaxUVT} UVT ({formatCOP(LEY_2277_LIMITS.rentasExentasMaxUVT * uvt)}).
            </p>
          )}
          {result.warnings.combinadoCapped && (
            <p className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
              Deducciones + exentas limitadas a {LEY_2277_LIMITS.deduccionesExentasMaxUVT} UVT ({formatCOP(LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt)}).
            </p>
          )}
          {result.warnings.dependientesCapped && (
            <p className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
              Solo se aplican hasta {LEY_2277_LIMITS.maxDependientes} dependientes para este calculo.
            </p>
          )}
        </div>
      )}

      {steps.length > 0 && (
        <CalculationStepsTable
          title="Paso a paso del calculo"
          rows={steps}
          valueColumnTitle="Resultado"
        />
      )}

      <CalculatorSources
        articles={[
          { id: "241", reason: "Tabla marginal para impuesto de renta personas naturales." },
          { id: "206", reason: "Rentas exentas aplicables a rentas de trabajo." },
          { id: "336", reason: "Determinacion de renta liquida cedular." },
        ]}
      />

      <CalculatorDisclaimer
        references={[
          "Art. 241 ET",
          "Art. 206 ET",
          "Art. 336 ET",
          "Ley 2277 de 2022",
        ]}
      />

      <RelatedCalculators currentId="renta" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Renta Personas Naturales"
            subtitle="Simulacion de impuesto de renta (Art. 241 ET)"
          >
            {result && (
              <div className="space-y-2 text-sm">
                <p>Ingreso bruto: {formatCOP(result.ingreso)}</p>
                <p>Deducciones + exentas aplicadas: {formatCOP(result.totalDeduccionesExentas)}</p>
                <p>Renta liquida gravable: {formatCOP(result.rentaLiquidaCOP)}</p>
                <p>Impuesto estimado: {formatCOP(result.impuestoCOP)}</p>
                <p>Tasa efectiva: {formatPercent(result.tasaEfectiva)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function RentaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <RentaPageContent />
    </Suspense>
  );
}
