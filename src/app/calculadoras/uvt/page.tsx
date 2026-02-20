"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
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

const YEAR_OPTIONS = Object.keys(UVT_VALUES)
  .sort((a, b) => Number(b) - Number(a))
  .map((y) => ({ value: y, label: y }));

function UVTPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    return {
      amount: readNumberParam(searchParams, "amount", 0, { min: 0 }),
      year: readStringParam(searchParams, "year", String(CURRENT_UVT_YEAR)),
      direction: readStringParam(searchParams, "dir", "uvt-to-cop") as "uvt-to-cop" | "cop-to-uvt",
    };
  }, [searchParams]);

  const [amount, setAmount] = useState(initialValues.amount);
  const [year, setYear] = useState(initialValues.year);
  const [direction, setDirection] = useState<"uvt-to-cop" | "cop-to-uvt">(initialValues.direction);

  const { contentRef, handlePrint } = usePrintExport({ title: "Conversor UVT" });

  useEffect(() => {
    trackCalculatorUsage("uvt");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      amount,
      year,
      dir: direction,
    });
  }, [amount, year, direction]);

  const uvtValue = UVT_VALUES[Number(year)] ?? UVT_VALUES[CURRENT_UVT_YEAR];

  const result = useMemo(() => {
    if (direction === "uvt-to-cop") {
      return {
        uvt: amount,
        cop: amount * uvtValue,
      };
    } else {
      return {
        uvt: amount / uvtValue,
        cop: amount,
      };
    }
  }, [amount, uvtValue, direction]);

  const resultItems = useMemo(() => {
    if (amount <= 0) return [];

    if (direction === "uvt-to-cop") {
      return [
        { label: "UVT", value: amount.toLocaleString("es-CO") },
        { label: "Pesos colombianos", value: formatCOP(result.cop) },
        { label: `Valor UVT ${year}`, value: formatCOP(uvtValue) },
      ];
    } else {
      return [
        { label: "Pesos colombianos", value: formatCOP(amount) },
        { label: "UVT", value: result.uvt.toLocaleString("es-CO", { maximumFractionDigits: 2 }) },
        { label: `Valor UVT ${year}`, value: formatCOP(uvtValue) },
      ];
    }
  }, [amount, direction, result, year, uvtValue]);

  const shareUrl = buildShareUrl("/calculadoras/uvt", {
    amount,
    year,
    dir: direction,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Conversor UVT ↔ COP" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Conversor UVT ↔ COP</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el valor en pesos o en Unidades de Valor Tributario (UVT) para cualquier ano gravable.
      </p>

      <CalculatorActions
        title="Conversor UVT"
        shareText="Consulta esta conversion de UVT"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-6 space-y-4">
        {/* Direction toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => { setDirection("uvt-to-cop"); setAmount(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              direction === "uvt-to-cop" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            UVT → COP
          </button>
          <button
            onClick={() => { setDirection("cop-to-uvt"); setAmount(0); }}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              direction === "cop-to-uvt" ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            COP → UVT
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput
            id="uvt-amount"
            label={direction === "uvt-to-cop" ? "Cantidad en UVT" : "Monto en pesos"}
            value={amount}
            onChange={setAmount}
            prefix={direction === "uvt-to-cop" ? "" : "$"}
            placeholder="0"
          />
          <SelectInput
            id="uvt-year"
            label="Ano gravable"
            value={year}
            onChange={setYear}
            options={YEAR_OPTIONS}
          />
        </div>
      </div>

      {resultItems.length > 0 ? (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Ingresa un valor para realizar la conversion.</p>
        </div>
      )}

      {/* Historical table */}
      <div className="mb-6">
        <h2 className="mb-4 heading-serif text-lg">Historico UVT</h2>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                <th className="px-4 py-3 text-left">Ano</th>
                <th className="px-4 py-3 text-right">Valor UVT</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(UVT_VALUES)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([y, v]) => (
                  <tr key={y} className={clsx("border-b border-border last:border-0", y === year && "bg-muted/50")}>
                    <td className="px-4 py-3">{y}</td>
                    <td className="px-4 py-3 text-right">{formatCOP(v)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "868", reason: "Definicion y ajuste de la Unidad de Valor Tributario (UVT)." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 868 ET"]}
      />

      <RelatedCalculators currentId="uvt" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Conversor UVT"
            subtitle={`Ano gravable: ${year} (1 UVT = ${formatCOP(uvtValue)})`}
          >
            {amount > 0 && (
              <div className="space-y-2 text-sm">
                <p>Direccion: {direction === "uvt-to-cop" ? "UVT a COP" : "COP a UVT"}</p>
                <p>Valor ingresado: {direction === "uvt-to-cop" ? amount.toLocaleString("es-CO") : formatCOP(amount)}</p>
                <p>Resultado: {direction === "uvt-to-cop" ? formatCOP(result.cop) : result.uvt.toLocaleString("es-CO", { maximumFractionDigits: 2 })}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function UVTPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <UVTPageContent />
    </Suspense>
  );
}
