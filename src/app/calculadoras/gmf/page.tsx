"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UVT_VALUES, CURRENT_UVT_YEAR, GMF_RATE, GMF_EXEMPT_UVT } from "@/config/tax-data";
import {
  CurrencyInput,
  ToggleInput,
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
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

function GMFPageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const initialValues = useMemo(() => {
    return {
      monto: readNumberParam(searchParams, "m", 0, { min: 0 }),
      cuentaExenta: readBooleanParam(searchParams, "ex", false),
    };
  }, [searchParams]);

  const [monto, setMonto] = useState(initialValues.monto);
  const [cuentaExenta, setCuentaExenta] = useState(initialValues.cuentaExenta);

  const { contentRef, handlePrint } = usePrintExport({ title: "Calculadora GMF (4x1000)" });

  useEffect(() => {
    trackCalculatorUsage("gmf");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      m: monto,
      ex: cuentaExenta,
    });
  }, [monto, cuentaExenta]);

  const { montoExento, montoGravado, gmf, tasaEfectiva } = useMemo(() => {
    const exento = cuentaExenta ? GMF_EXEMPT_UVT * uvt : 0;
    const gravado = Math.max(0, monto - exento);
    const imp = gravado * GMF_RATE;
    const tasa = monto > 0 ? imp / monto : 0;

    return {
      montoExento: exento,
      montoGravado: gravado,
      gmf: imp,
      tasaEfectiva: tasa,
    };
  }, [monto, cuentaExenta, uvt]);

  const resultItems = useMemo(() => {
    if (monto <= 0) return [];

    return [
      { label: "Monto transacciones", value: formatCOP(monto) },
      ...(cuentaExenta
        ? [{ label: `Monto exento (${GMF_EXEMPT_UVT} UVT)`, value: formatCOP(montoExento) }]
        : []),
      { label: "Base gravable", value: formatCOP(montoGravado) },
      { label: "GMF a pagar (4x1000)", value: formatCOP(gmf) },
      { label: "Tasa efectiva", value: (tasaEfectiva * 100).toFixed(3) + "%" },
    ];
  }, [monto, cuentaExenta, montoExento, montoGravado, gmf, tasaEfectiva]);

  const shareUrl = buildShareUrl("/calculadoras/gmf", {
    m: monto,
    ex: cuentaExenta,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "GMF (4x1000)" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">GMF (4x1000)</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el Gravamen a los Movimientos Financieros, incluyendo exenciones para cuentas marcadas.
      </p>

      <CalculatorActions
        title="GMF (4x1000)"
        shareText="Consulta este calculo de GMF"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-6 space-y-4">
        <CurrencyInput
          id="gmf-monto"
          label="Monto de transacciones mensuales"
          value={monto}
          onChange={setMonto}
          placeholder="Ej: 5.000.000"
        />
        <ToggleInput
          label="Cuenta marcada como exenta (Art. 879)"
          helperText={`Exime los primeros ${GMF_EXEMPT_UVT} UVT mensuales (${formatCOP(GMF_EXEMPT_UVT * uvt)}).`}
          pressed={cuentaExenta}
          onToggle={setCuentaExenta}
        />
      </div>

      {resultItems.length > 0 ? (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Ingresa el monto de tus transacciones para calcular el impuesto.</p>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold tracking-tight">Sobre el GMF</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>El Gravamen a los Movimientos Financieros es del 4 por mil (0.4%).</li>
          <li>Cada persona natural puede marcar una unica cuenta como exenta hasta {GMF_EXEMPT_UVT} UVT mensuales.</li>
          <li>Aplica a retiros, transferencias, cheques y movimientos contables.</li>
        </ul>
      </div>

      <CalculatorSources
        articles={[
          { id: "871", reason: "Hecho generador y tarifa del GMF." },
          { id: "879", reason: "Exenciones del gravamen." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 871 ET", "Art. 879 ET"]}
      />

      <RelatedCalculators currentId="gmf" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Calculo GMF (4x1000)"
            subtitle="Gravamen a los Movimientos Financieros"
          >
            {monto > 0 && (
              <div className="space-y-2 text-sm">
                <p>Monto transacciones: {formatCOP(monto)}</p>
                <p>Exenta: {cuentaExenta ? "Si" : "No"}</p>
                <p>Base gravable: {formatCOP(montoGravado)}</p>
                <p>Impuesto: {formatCOP(gmf)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function GMFPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <GMFPageContent />
    </Suspense>
  );
}
