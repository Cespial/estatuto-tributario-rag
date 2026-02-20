"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tag } from "lucide-react";
import { SelectInput, CurrencyInput } from "@/components/calculators/shared-inputs";
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
import { CONSUMO_TARIFAS } from "@/config/tax-data-wave4";

function ConsumoPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    return {
      tipo: readStringParam(searchParams, "t", "restaurantes"),
      valor: readNumberParam(searchParams, "v", 0, { min: 0 }),
    };
  }, [searchParams]);

  const [tipo, setTipo] = useState(initialValues.tipo);
  const [valor, setValor] = useState(initialValues.valor);

  const { contentRef, handlePrint } = usePrintExport({ title: "Impuesto Nacional al Consumo" });

  useEffect(() => {
    trackCalculatorUsage("consumo");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      t: tipo,
      v: valor,
    });
  }, [tipo, valor]);

  const calculo = useMemo(() => {
    const selected = (CONSUMO_TARIFAS.find(t => t.tipo === tipo) || CONSUMO_TARIFAS[0]) as {
      tipo: string;
      label: string;
      tarifa: number;
      articulo: string;
      notas?: string;
    };
    
    if (!valor) return { selected, impuesto: 0, total: 0, tarifaLabel: (selected.tarifa * 100).toFixed(0) + "%" };

    const impuesto = valor * selected.tarifa;
    const total = valor + impuesto;

    return {
      selected,
      impuesto,
      total,
      tarifaLabel: (selected.tarifa * 100).toFixed(0) + "%"
    };
  }, [tipo, valor]);

  const resultItems = useMemo(() => {
    if (valor <= 0) return [];
    return [
      {
        label: "Impuesto al Consumo",
        value: formatCOP(calculo.impuesto),
        sublabel: `Tarifa del ${calculo.tarifaLabel}`
      },
      {
        label: "Total a pagar",
        value: formatCOP(calculo.total)
      }
    ];
  }, [calculo, valor]);

  const shareUrl = buildShareUrl("/calculadoras/consumo", {
    t: tipo,
    v: valor,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Impuesto Nacional al Consumo" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Impuesto Nacional al Consumo</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el INC para servicios de restaurante, telefonia, vehiculos y otros hechos generadores (Art. 512-1 ET).
      </p>

      <CalculatorActions
        title="Impuesto al Consumo"
        shareText="Consulta este calculo de Impuesto al Consumo"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 md:grid-cols-2 mb-6">
        <div className="space-y-6">
          <SelectInput
            id="tipo-consumo"
            label="Tipo de bien o servicio"
            value={tipo}
            onChange={setTipo}
            options={CONSUMO_TARIFAS.map(t => ({ value: t.tipo, label: t.label }))}
          />

          <CurrencyInput
            id="valor-base"
            label="Valor de la operacion (Base antes de impuestos)"
            value={valor}
            onChange={setValor}
            placeholder="Ej: 100.000"
          />

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-foreground/70" />
              Informacion de Tarifa
            </h4>
            {calculo?.selected && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong>Articulo:</strong> {calculo.selected.articulo} ET</p>
                <p><strong>Tarifa aplicable:</strong> {calculo.tarifaLabel}</p>
                {calculo.selected.notas && <p className="italic mt-2">{calculo.selected.notas}</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          {valor > 0 ? (
            <div className="space-y-6">
              <CalculatorResult items={resultItems} />

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold tracking-tight">Resumen de Operacion</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Base gravable:</span>
                    <span className="font-medium text-foreground">{formatCOP(valor)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Impuesto ({calculo.tarifaLabel}):</span>
                    <span className="font-medium text-foreground">{formatCOP(calculo.impuesto)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold text-foreground">
                    <span>Total a pagar:</span>
                    <span>{formatCOP(calculo.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              Selecciona el tipo de operacion e ingresa el valor base para calcular.
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 border-b border-border/60">
            <tr>
              <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Hecho Generador</th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Tarifa</th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Art. ET</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {CONSUMO_TARIFAS.map((t, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">{t.label}</td>
                <td className="px-4 py-3 font-medium">{(t.tarifa * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-muted-foreground">{t.articulo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CalculatorSources
        articles={[
          { id: "512-1", reason: "Hecho generador del INC." },
          { id: "512-2", reason: "Bienes gravados a la tarifa del 8%." },
          { id: "512-3", reason: "Bienes gravados a la tarifa del 16%." },
          { id: "512-4", reason: "Servicio de telefonía móvil." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 512-1 ET", "Art. 512-2 ET", "Art. 512-3 ET"]}
      />

      <RelatedCalculators currentId="consumo" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Liquidacion Impuesto Nacional al Consumo"
            subtitle={`Concepto: ${calculo.selected.label}`}
          >
            {valor > 0 && (
              <div className="space-y-2 text-sm">
                <p>Concepto: {calculo.selected.label}</p>
                <p>Base gravable: {formatCOP(valor)}</p>
                <p>Tarifa: {calculo.tarifaLabel}</p>
                <p>Impuesto: {formatCOP(calculo.impuesto)}</p>
                <p>Total: {formatCOP(calculo.total)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function ConsumoPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <ConsumoPageContent />
    </Suspense>
  );
}
