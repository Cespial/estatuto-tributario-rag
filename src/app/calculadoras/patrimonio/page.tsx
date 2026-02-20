"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import {
  PATRIMONIO_THRESHOLD_UVT,
  PATRIMONIO_BRACKETS,
  PATRIMONIO_VIVIENDA_EXCLUSION_UVT
} from "@/config/tax-data-ganancias";
import {
  CurrencyInput,
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
  readNumberParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

function PatrimonioPageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const initialValues = useMemo(() => {
    return {
      patrimonioBruto: readNumberParam(searchParams, "bruto", 0, { min: 0 }),
      deudas: readNumberParam(searchParams, "deudas", 0, { min: 0 }),
      valorVivienda: readNumberParam(searchParams, "viv", 0, { min: 0 }),
      otrasExclusiones: readNumberParam(searchParams, "exc", 0, { min: 0 }),
    };
  }, [searchParams]);

  const [patrimonioBruto, setPatrimonioBruto] = useState(initialValues.patrimonioBruto);
  const [deudas, setDeudas] = useState(initialValues.deudas);
  const [valorVivienda, setValorVivienda] = useState(initialValues.valorVivienda);
  const [otrasExclusiones, setOtrasExclusiones] = useState(initialValues.otrasExclusiones);

  const { contentRef, handlePrint } = usePrintExport({ title: "Impuesto al Patrimonio" });

  useEffect(() => {
    trackCalculatorUsage("patrimonio");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      bruto: patrimonioBruto,
      deudas,
      viv: valorVivienda,
      exc: otrasExclusiones,
    });
  }, [patrimonioBruto, deudas, valorVivienda, otrasExclusiones]);

  const results = useMemo(() => {
    const patrimonioLiquido = Math.max(0, patrimonioBruto - deudas);

    // Aplicacion exclusion vivienda (Max 12.000 UVT)
    const exclusionViviendaEfectiva = Math.min(valorVivienda, PATRIMONIO_VIVIENDA_EXCLUSION_UVT * uvt);

    const baseGravableCOP = Math.max(0, patrimonioLiquido - exclusionViviendaEfectiva - otrasExclusiones);
    const baseGravableUVT = baseGravableCOP / uvt;

    let impuestoUVT = 0;
    if (baseGravableUVT >= PATRIMONIO_THRESHOLD_UVT) {
      for (let i = PATRIMONIO_BRACKETS.length - 1; i >= 0; i--) {
        const bracket = PATRIMONIO_BRACKETS[i];
        if (baseGravableUVT > bracket.from) {
          impuestoUVT = (baseGravableUVT - bracket.from) * bracket.rate + bracket.base;
          break;
        }
      }
    }

    return {
      patrimonioLiquido,
      exclusionViviendaEfectiva,
      baseGravableCOP,
      baseGravableUVT,
      impuesto: impuestoUVT * uvt,
      aplica: baseGravableUVT >= PATRIMONIO_THRESHOLD_UVT
    };
  }, [patrimonioBruto, deudas, valorVivienda, otrasExclusiones, uvt]);

  const shareUrl = buildShareUrl("/calculadoras/patrimonio", {
    bruto: patrimonioBruto,
    deudas,
    viv: valorVivienda,
    exc: otrasExclusiones,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Impuesto al Patrimonio" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Impuesto al Patrimonio</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el impuesto permanente al patrimonio con las tarifas progresivas y exclusiones de ley.
      </p>

      <CalculatorActions
        title="Impuesto al Patrimonio"
        shareText="Consulta esta liquidacion del Impuesto al Patrimonio"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 lg:grid-cols-2 mb-6">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 heading-serif text-lg">Activos y Pasivos</h2>
            <div className="space-y-4">
              <CurrencyInput 
                id="p-bruto" 
                label="Patrimonio Bruto Total" 
                value={patrimonioBruto} 
                onChange={setPatrimonioBruto} 
              />
              <CurrencyInput 
                id="deudas" 
                label="Total Deudas" 
                value={deudas} 
                onChange={setDeudas} 
              />
              {deudas > patrimonioBruto && (
                <p className="text-xs text-destructive font-medium">
                  Alerta: Las deudas superan el patrimonio bruto (Patrimonio liquido negativo).
                </p>
              )}
              <div className="pt-4 border-t border-border">
                <h3 className="mb-3 text-sm font-medium">Exclusiones de Ley</h3>
                <div className="space-y-4">
                  <CurrencyInput 
                    id="v-vivienda" 
                    label="Valor Vivienda de Habitacion" 
                    helperText={`Exclusion maxima ${PATRIMONIO_VIVIENDA_EXCLUSION_UVT.toLocaleString()} UVT (${formatCOP(PATRIMONIO_VIVIENDA_EXCLUSION_UVT * uvt)})`}
                    value={valorVivienda} 
                    onChange={setValorVivienda} 
                  />
                  <CurrencyInput 
                    id="o-exclusiones" 
                    label="Otras Exclusiones (Art. 295-3)" 
                    value={otrasExclusiones} 
                    onChange={setOtrasExclusiones} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results && (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 heading-serif text-lg">Resumen de Liquidacion</h2>
                <CalculatorResult items={[
                  { label: "Patrimonio Liquido", value: formatCOP(results.patrimonioLiquido) },
                  { label: "Base Gravable Depurada", value: formatCOP(results.baseGravableCOP) },
                  { label: "Base en UVT", value: results.baseGravableUVT.toLocaleString(undefined, {maximumFractionDigits: 0}) },
                  { label: "Impuesto a Pagar", value: formatCOP(results.impuesto) },
                ]} />
              </div>

              {results.exclusionViviendaEfectiva > 0 && (
                <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 flex gap-3 text-sm">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p>Estas ahorrando el impuesto sobre <strong>{formatCOP(results.exclusionViviendaEfectiva)}</strong> por concepto de vivienda de habitacion.</p>
                </div>
              )}

              {!results.aplica && patrimonioBruto > 0 && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border/60 text-center text-sm text-muted-foreground">
                  La base gravable es inferior al umbral de {PATRIMONIO_THRESHOLD_UVT.toLocaleString()} UVT. No se genera impuesto.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CalculatorSources 
        articles={[
          { id: "292-2", reason: "Hecho generador del impuesto." },
          { id: "295-3", reason: "Base gravable y exclusiones." },
          { id: "296-3", reason: "Tarifa marginal progresiva." },
        ]} 
      />

      <CalculatorDisclaimer
        references={["Art. 292-2 ET", "Art. 295-3 ET", "Art. 296-3 ET"]}
      />

      <RelatedCalculators currentId="patrimonio" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Liquidacion Impuesto al Patrimonio"
            subtitle={`Patrimonio Bruto: ${formatCOP(patrimonioBruto)}`}
          >
            {results && (
              <div className="space-y-2 text-sm">
                <p>Patrimonio Bruto: {formatCOP(patrimonioBruto)}</p>
                <p>Deudas: {formatCOP(deudas)}</p>
                <p>Patrimonio Liquido: {formatCOP(results.patrimonioLiquido)}</p>
                <p>Exclusion Vivienda: {formatCOP(results.exclusionViviendaEfectiva)}</p>
                <p>Otras Exclusiones: {formatCOP(otrasExclusiones)}</p>
                <p>Base Gravable: {formatCOP(results.baseGravableCOP)}</p>
                <p>Impuesto Calculado: {formatCOP(results.impuesto)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function PatrimonioPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <PatrimonioPageContent />
    </Suspense>
  );
}
