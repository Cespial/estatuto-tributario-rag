"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import { TOPES_DECLARAR_RENTA_AG2025 } from "@/config/tax-data-corporativo";
import {
  CurrencyInput,
  ToggleInput,
} from "@/components/calculators/shared-inputs";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { CalculatorBreadcrumb } from "@/components/calculators/calculator-breadcrumb";
import { ScenarioSlider } from "@/components/calculators/scenario-slider";
import { CalculationStepsTable } from "@/components/calculators/calculation-steps-table";
import { CalculatorActions } from "@/components/calculators/calculator-actions";
import { CalculatorDisclaimer } from "@/components/calculators/calculator-disclaimer";
import { RelatedCalculators } from "@/components/calculators/related-calculators";
import { DeboDeclararThresholdChart } from "@/components/calculators/charts/debo-declarar-threshold-chart";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { formatCOP } from "@/lib/calculators/format";
import {
  buildShareUrl,
  readBooleanParam,
  readNumberParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

interface Thresholds {
  patrimonio: number;
  ingresos: number;
  consumos: number;
  compras: number;
  consignaciones: number;
}

interface Evaluation {
  exceeds: {
    patrimonio: boolean;
    ingresos: boolean;
    consumos: boolean;
    compras: boolean;
    consignaciones: boolean;
  };
  debeDeclarar: boolean;
  exceededCount: number;
}

function DeboDeclararPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(
    () => ({
      esResidente: readBooleanParam(searchParams, "res", true),
      retencionTotalNoResidente: readBooleanParam(searchParams, "nrret", false),
      patrimonioBruto: readNumberParam(searchParams, "pb", 0, { min: 0 }),
      ingresosBrutos: readNumberParam(searchParams, "ib", 0, { min: 0 }),
      consumosTarjeta: readNumberParam(searchParams, "ct", 0, { min: 0 }),
      compras: readNumberParam(searchParams, "cp", 0, { min: 0 }),
      consignaciones: readNumberParam(searchParams, "co", 0, { min: 0 }),
      escenarioDelta: readNumberParam(searchParams, "delta", 0),
    }),
    [searchParams],
  );

  const [esResidente, setEsResidente] = useState(initialValues.esResidente);
  const [retencionTotalNoResidente, setRetencionTotalNoResidente] = useState(initialValues.retencionTotalNoResidente);
  const [patrimonioBruto, setPatrimonioBruto] = useState(initialValues.patrimonioBruto);
  const [ingresosBrutos, setIngresosBrutos] = useState(initialValues.ingresosBrutos);
  const [consumosTarjeta, setConsumosTarjeta] = useState(initialValues.consumosTarjeta);
  const [compras, setCompras] = useState(initialValues.compras);
  const [consignaciones, setConsignaciones] = useState(initialValues.consignaciones);
  const [escenarioDelta, setEscenarioDelta] = useState(initialValues.escenarioDelta);

  const { contentRef, handlePrint } = usePrintExport({
    title: "Debo Declarar Renta",
  });

  useEffect(() => {
    trackCalculatorUsage("debo-declarar");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      res: esResidente,
      nrret: retencionTotalNoResidente,
      pb: patrimonioBruto,
      ib: ingresosBrutos,
      ct: consumosTarjeta,
      cp: compras,
      co: consignaciones,
      delta: escenarioDelta,
    });
  }, [
    esResidente,
    retencionTotalNoResidente,
    patrimonioBruto,
    ingresosBrutos,
    consumosTarjeta,
    compras,
    consignaciones,
    escenarioDelta,
  ]);

  const uvtAG = TOPES_DECLARAR_RENTA_AG2025.uvtAnoGravable;

  const thresholds = useMemo<Thresholds>(
    () => ({
      patrimonio: TOPES_DECLARAR_RENTA_AG2025.patrimonioBrutoUVT * uvtAG,
      ingresos: TOPES_DECLARAR_RENTA_AG2025.ingresosBrutosUVT * uvtAG,
      consumos: TOPES_DECLARAR_RENTA_AG2025.consumosTarjetaUVT * uvtAG,
      compras: TOPES_DECLARAR_RENTA_AG2025.comprasTotalesUVT * uvtAG,
      consignaciones: TOPES_DECLARAR_RENTA_AG2025.consignacionesUVT * uvtAG,
    }),
    [uvtAG],
  );

  const evalInput = useMemo(
    () => ({
      patrimonioBruto,
      ingresosBrutos,
      consumosTarjeta,
      compras,
      consignaciones,
    }),
    [patrimonioBruto, ingresosBrutos, consumosTarjeta, compras, consignaciones],
  );

  const evaluation = useMemo<Evaluation>(() => {
    const exceeds = {
      patrimonio: evalInput.patrimonioBruto > thresholds.patrimonio,
      ingresos: evalInput.ingresosBrutos > thresholds.ingresos,
      consumos: evalInput.consumosTarjeta > thresholds.consumos,
      compras: evalInput.compras > thresholds.compras,
      consignaciones: evalInput.consignaciones > thresholds.consignaciones,
    };

    const exceededCount = Object.values(exceeds).filter(Boolean).length;

    const residenteObligado = exceededCount > 0;
    const noResidenteObligado = !retencionTotalNoResidente;

    const debeDeclarar = esResidente ? residenteObligado : noResidenteObligado;

    return {
      exceeds,
      debeDeclarar,
      exceededCount,
    };
  }, [evalInput, thresholds, esResidente, retencionTotalNoResidente]);

  const escenarioIngresos = Math.max(0, ingresosBrutos + escenarioDelta);
  const escenarioDebeDeclarar = esResidente
    ? escenarioIngresos > thresholds.ingresos || evaluation.exceededCount > 0
    : !retencionTotalNoResidente;

  const rows = [
    {
      id: "patrimonio",
      label: "Patrimonio bruto (4,500 UVT)",
      limit: thresholds.patrimonio,
      value: patrimonioBruto,
      exceeds: evaluation.exceeds.patrimonio,
      explanation:
        "Si el patrimonio bruto al 31 de diciembre de 2025 supera 4,500 UVT, hay obligacion de declarar.",
    },
    {
      id: "ingresos",
      label: "Ingresos brutos (1,400 UVT)",
      limit: thresholds.ingresos,
      value: ingresosBrutos,
      exceeds: evaluation.exceeds.ingresos,
      explanation:
        "Incluye la totalidad de ingresos brutos del AG 2025. Si supera 1,400 UVT, debe declarar.",
    },
    {
      id: "consignaciones",
      label: "Consignaciones bancarias (1,400 UVT)",
      limit: thresholds.consignaciones,
      value: consignaciones,
      exceeds: evaluation.exceeds.consignaciones,
      explanation:
        "Se evalua el total de consignaciones, depositos e inversiones financieras del periodo.",
    },
    {
      id: "consumos",
      label: "Consumos con tarjeta (1,400 UVT)",
      limit: thresholds.consumos,
      value: consumosTarjeta,
      exceeds: evaluation.exceeds.consumos,
      explanation:
        "Suma de consumos con tarjeta de credito durante 2025.",
    },
    {
      id: "compras",
      label: "Compras y consumos totales (1,400 UVT)",
      limit: thresholds.compras,
      value: compras,
      exceeds: evaluation.exceeds.compras,
      explanation:
        "Incluye compras y consumos por cualquier medio de pago.",
    },
  ];

  const steps = rows.map((row) => ({
    id: row.id,
    label: `${row.label} - Tope: ${formatCOP(row.limit)}`,
    value: formatCOP(row.value),
    explanation: row.explanation,
    tone: row.exceeds ? ("warning" as const) : ("default" as const),
  }));

  const shareUrl = buildShareUrl("/calculadoras/debo-declarar", {
    res: esResidente,
    nrret: retencionTotalNoResidente,
    pb: patrimonioBruto,
    ib: ingresosBrutos,
    ct: consumosTarjeta,
    cp: compras,
    co: consignaciones,
    delta: escenarioDelta,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Debo Declarar Renta" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Debo declarar renta? AG 2025 (declaracion 2026)</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Verificador rapido con topes del AG 2025. UVT AG 2025: <strong>$49.799</strong>. UVT 2026 vigente: <strong>$52.374</strong>.
      </p>

      <CalculatorActions
        title="Debo Declarar Renta"
        shareText="Consulta este escenario para validar obligacion de declarar renta"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-8 rounded-lg border border-border/60 bg-muted/50 p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Globe className="h-5 w-5 text-foreground/70" />
          <span>Residencia fiscal</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Permanecio en Colombia mas de 183 dias durante 2025?</p>
            <ToggleInput
              label={esResidente ? "Si, residente fiscal" : "No, no residente"}
              pressed={esResidente}
              onToggle={setEsResidente}
            />
          </div>

          {!esResidente && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                Para no residente: sus ingresos de fuente nacional quedaron totalmente sometidos a retencion (Arts. 407-411 ET)?
              </p>
              <ToggleInput
                label={retencionTotalNoResidente ? "Si, retencion total" : "No, requiere validar declaracion"}
                pressed={retencionTotalNoResidente}
                onToggle={setRetencionTotalNoResidente}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <CurrencyInput
          id="patrimonio"
          label="Patrimonio bruto a 31 dic 2025"
          value={patrimonioBruto}
          onChange={setPatrimonioBruto}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput id="ingresos" label="Ingresos brutos 2025" value={ingresosBrutos} onChange={setIngresosBrutos} />
          <CurrencyInput id="consignaciones" label="Consignaciones bancarias 2025" value={consignaciones} onChange={setConsignaciones} />
          <CurrencyInput id="consumos-tarjeta" label="Consumos tarjeta de credito 2025" value={consumosTarjeta} onChange={setConsumosTarjeta} />
          <CurrencyInput id="compras" label="Compras y consumos totales 2025" value={compras} onChange={setCompras} />
        </div>
      </div>

      <ScenarioSlider
        label="Escenario: Que pasa si mis ingresos cambian?"
        helper="Ajusta este valor y valida inmediatamente si superas el tope de ingresos de 1,400 UVT."
        min={-20_000_000}
        max={80_000_000}
        step={500_000}
        value={escenarioDelta}
        onChange={setEscenarioDelta}
        formatValue={formatCOP}
      />

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-border/60 bg-muted/50 p-6">
        {evaluation.debeDeclarar ? (
          <AlertTriangle className="h-10 w-10 text-foreground" />
        ) : (
          <CheckCircle2 className="h-10 w-10 text-foreground" />
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {evaluation.debeDeclarar
              ? "Esta obligado a declarar renta"
              : "No esta obligado a declarar renta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {esResidente
              ? `Topes superados: ${evaluation.exceededCount}.`
              : retencionTotalNoResidente
                ? "No residente con retencion total: normalmente no obligado por esos ingresos."
                : "No residente sin retencion total: validar declaracion obligatoria."}
          </p>
        </div>
      </div>

      <DeboDeclararThresholdChart
        rows={rows.map((row) => ({
          name: row.label.split("(")[0].trim(),
          value: row.value,
          limit: row.limit,
        }))}
      />

      <div className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Escenario comparativo de ingresos</p>
        <p className="mt-1">
          Ingresos ajustados: <strong>{formatCOP(escenarioIngresos)}</strong>. Con ese ajuste, estado proyectado:
          <strong> {escenarioDebeDeclarar ? "Obligado a declarar" : "No obligado"}</strong>.
        </p>
      </div>

      <CalculationStepsTable
        title="Paso a paso de validacion de topes"
        rows={steps}
        valueColumnTitle="Tu valor"
      />

      <div className="mb-6">
        <h3 className="mb-4 heading-serif text-lg">Tabla de verificacion (UVT AG 2025: $49.799)</h3>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Concepto</th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Tope</th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Tu valor</th>
                <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Supera?</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={`border-b border-border last:border-0 ${row.exceeds ? "bg-muted/30" : ""}`}>
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatCOP(row.limit)}</td>
                  <td className="px-4 py-3 text-right">{formatCOP(row.value)}</td>
                  <td className="px-4 py-3 text-center">
                    {row.exceeds ? (
                      <span className="inline-block rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background">SI</span>
                    ) : (
                      <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "9", reason: "Definicion de residencia fiscal para personas naturales." },
          { id: "10", reason: "Criterios de residencia fiscal aplicables." },
          { id: "592", reason: "No obligados a declarar renta en regimen ordinario." },
          { id: "593", reason: "Requisitos complementarios de no obligacion." },
          { id: "594-3", reason: "Topes y condiciones de ingresos y movimientos financieros." },
        ]}
      />

      <CalculatorDisclaimer
        references={[
          "Art. 9 ET",
          "Art. 10 ET",
          "Art. 592 ET",
          "Art. 593 ET",
          "Art. 594-3 ET",
        ]}
        message="Esta herramienta orienta sobre obligacion de declarar. Para no residentes y casos especiales, valide soportes de retencion y fuente del ingreso con su asesor tributario."
      />

      <RelatedCalculators currentId="debo-declarar" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Debo declarar renta?"
            subtitle="AG 2025 (declaracion en 2026)"
          >
            <div className="space-y-2 text-sm">
              <p>Residencia fiscal: {esResidente ? "Residente" : "No residente"}</p>
              {!esResidente && (
                <p>Retencion total fuente nacional (Arts. 407-411): {retencionTotalNoResidente ? "Si" : "No"}</p>
              )}
              <p>Patrimonio bruto: {formatCOP(patrimonioBruto)}</p>
              <p>Ingresos brutos: {formatCOP(ingresosBrutos)}</p>
              <p>Consignaciones: {formatCOP(consignaciones)}</p>
              <p>Consumos tarjeta: {formatCOP(consumosTarjeta)}</p>
              <p>Compras y consumos: {formatCOP(compras)}</p>
              <p>Resultado: {evaluation.debeDeclarar ? "Obligado a declarar" : "No obligado"}</p>
            </div>
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function DeboDeclararPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <DeboDeclararPageContent />
    </Suspense>
  );
}
