"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import {
  CurrencyInput,
  SelectInput,
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
  readStringParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

const RATE_OPTIONS = [
  { value: "0.19", label: "19% (General)" },
  { value: "0.05", label: "5% (Reducido)" },
];

function IVAPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    return {
      mode: readStringParam(searchParams, "mode", "calculo") as "calculo" | "extraccion",
      monto: readNumberParam(searchParams, "m", 0, { min: 0 }),
      rateStr: readStringParam(searchParams, "r", "0.19"),
    };
  }, [searchParams]);

  const [mode, setMode] = useState<"calculo" | "extraccion">(initialValues.mode);
  const [monto, setMonto] = useState(initialValues.monto);
  const [rateStr, setRateStr] = useState(initialValues.rateStr);

  const { contentRef, handlePrint } = usePrintExport({ title: "Calculadora de IVA" });

  useEffect(() => {
    trackCalculatorUsage("iva");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      mode,
      m: monto,
      r: rateStr,
    });
  }, [mode, monto, rateStr]);

  const rate = Number(rateStr);

  const result = useMemo(() => {
    if (mode === "calculo") {
      return {
        base: monto,
        iva: monto * rate,
        total: monto * (1 + rate),
      };
    } else {
      return {
        base: monto / (1 + rate),
        iva: monto - monto / (1 + rate),
        total: monto,
      };
    }
  }, [mode, monto, rate]);

  const resultItems = useMemo(() => {
    if (monto <= 0) return [];
    return [
      { label: "Base gravable", value: formatCOP(result.base) },
      { label: `IVA (${(rate * 100).toFixed(0)}%)`, value: formatCOP(result.iva) },
      { label: "Total", value: formatCOP(result.total) },
    ];
  }, [monto, result, rate]);

  const shareUrl = buildShareUrl("/calculadoras/iva", {
    mode,
    m: monto,
    r: rateStr,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Calculadora de IVA" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Calculadora de IVA</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el Impuesto al Valor Agregado (IVA) o extraelo de un valor total. Tarifas actualizadas (19% y 5%).
      </p>

      <CalculatorActions
        title="Calculadora de IVA"
        shareText="Consulta este calculo de IVA"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-6 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => { setMode("calculo"); setMonto(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              mode === "calculo" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            Calcular IVA (Agregar)
          </button>
          <button
            onClick={() => { setMode("extraccion"); setMonto(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              mode === "extraccion" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            Extraer IVA (Incluido)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput
            id="iva-monto"
            label={mode === "calculo" ? "Base gravable" : "Total con IVA incluido"}
            value={monto}
            onChange={setMonto}
            placeholder={mode === "calculo" ? "Ej: 1.000.000" : "Ej: 1.190.000"}
          />
          <SelectInput
            id="iva-rate"
            label="Tarifa IVA"
            value={rateStr}
            onChange={setRateStr}
            options={RATE_OPTIONS}
          />
        </div>
      </div>

      {resultItems.length > 0 ? (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Ingresa un valor para ver el desglose del impuesto.</p>
        </div>
      )}

      {/* Educational section */}
      <div className="mb-6 space-y-4">
        <h2 className="heading-serif text-lg">Diferencia entre Exento y Excluido</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Excluido (Art. 424)</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              No causa IVA. El productor/prestador NO puede descontar el IVA pagado en insumos.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>- Alimentos basicos (canasta familiar)</li>
              <li>- Servicios medicos y educativos</li>
              <li>- Transporte publico</li>
              <li>- Servicios publicos (estratos 1-2)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Exento (Art. 477)</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Tarifa 0%, pero el productor SI puede solicitar devolucion del IVA pagado en insumos.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>- Exportaciones de bienes</li>
              <li>- Carne, leche, huevos frescos</li>
              <li>- Cuadernos escolares</li>
              <li>- Servicios turisticos para no residentes</li>
            </ul>
          </div>
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "468", reason: "Tarifa general y tarifas diferenciales." },
          { id: "477", reason: "Bienes exentos del impuesto." },
          { id: "424", reason: "Bienes excluidos del impuesto." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 468 ET", "Art. 477 ET", "Art. 424 ET"]}
      />

      <RelatedCalculators currentId="iva" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Calculo de IVA"
            subtitle={`Modalidad: ${mode === "calculo" ? "Calculo (Agregar)" : "Extraccion (Incluido)"}`}
          >
            {monto > 0 && (
              <div className="space-y-2 text-sm">
                <p>Monto ingresado: {formatCOP(monto)}</p>
                <p>Tarifa aplicada: {(rate * 100).toFixed(0)}%</p>
                <p>Base gravable: {formatCOP(result.base)}</p>
                <p>Valor IVA: {formatCOP(result.iva)}</p>
                <p>Total: {formatCOP(result.total)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function IVAPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <IVAPageContent />
    </Suspense>
  );
}
