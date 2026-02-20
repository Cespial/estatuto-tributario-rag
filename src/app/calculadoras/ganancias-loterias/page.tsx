"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { LOTERIAS_RATE, LOTERIAS_MIN_RETENCION } from "@/config/tax-data-sprint2";
import { 
  CurrencyInput, 
  SelectInput, 
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

function LoteriasPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    return {
      premioBruto: readNumberParam(searchParams, "premio", 0, { min: 0 }),
      tipoJuego: readStringParam(searchParams, "tipo", "loteria"),
      valorApuesta: readNumberParam(searchParams, "apuesta", 0, { min: 0 }),
      yaRetenido: readBooleanParam(searchParams, "ret", false),
    };
  }, [searchParams]);

  const [premioBruto, setPremioBruto] = useState(initialValues.premioBruto);
  const [tipoJuego, setTipoJuego] = useState(initialValues.tipoJuego);
  const [valorApuesta, setValorApuesta] = useState(initialValues.valorApuesta);
  const [yaRetenido, setYaRetenido] = useState(initialValues.yaRetenido);

  const { contentRef, handlePrint } = usePrintExport({ title: "Ganancias Ocasionales - Loterias" });

  useEffect(() => {
    trackCalculatorUsage("ganancias-loterias");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      premio: premioBruto,
      tipo: tipoJuego,
      apuesta: valorApuesta,
      ret: yaRetenido,
    });
  }, [premioBruto, tipoJuego, valorApuesta, yaRetenido]);

  const results = useMemo(() => {
    if (premioBruto <= 0) return null;

    // Art. 306: En apuestas hipicas se resta el valor de la apuesta
    const baseGravable = tipoJuego === "apuesta_hipica"
      ? Math.max(0, premioBruto - valorApuesta)
      : premioBruto;

    const impuesto = baseGravable * LOTERIAS_RATE;
    const retencionCalculada = yaRetenido ? impuesto : 0;
    const saldoAPagar = Math.max(0, impuesto - retencionCalculada);

    const sujetoRetencion = premioBruto >= LOTERIAS_MIN_RETENCION;

    return {
      baseGravable,
      impuesto,
      retencionCalculada,
      saldoAPagar,
      sujetoRetencion
    };
  }, [premioBruto, tipoJuego, valorApuesta, yaRetenido]);

  const shareUrl = buildShareUrl("/calculadoras/ganancias-loterias", {
    premio: premioBruto,
    tipo: tipoJuego,
    apuesta: valorApuesta,
    ret: yaRetenido,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Loterias, Rifas y Apuestas" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Loterias, Rifas y Apuestas</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el impuesto de ganancias ocasionales (20%) sobre premios obtenidos en juegos de suerte y azar.
      </p>

      <CalculatorActions
        title="Impuesto Loterias y Rifas"
        shareText="Consulta este calculo de impuesto a premios"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 lg:grid-cols-2 mb-6">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 heading-serif text-lg">Datos del Premio</h2>
            <div className="space-y-4">
              <CurrencyInput 
                id="premio" 
                label="Valor Bruto del Premio" 
                value={premioBruto} 
                onChange={setPremioBruto} 
                placeholder="Ej: 50.000.000"
              />

              <SelectInput
                id="tipo"
                label="Tipo de Juego"
                value={tipoJuego}
                onChange={setTipoJuego}
                options={[
                  { value: "loteria", label: "Loteria o Rifa" },
                  { value: "apuesta_hipica", label: "Apuesta Hipica" },
                  { value: "otra", label: "Otra Apuesta o Sorteo" }
                ]}
              />

              {tipoJuego === "apuesta_hipica" && (
                <CurrencyInput 
                  id="apuesta" 
                  label="Valor de la Apuesta" 
                  value={valorApuesta} 
                  onChange={setValorApuesta} 
                  placeholder="Ej: 5.000"
                />
              )}

              <div className="pt-2">
                <ToggleInput 
                  label="Ya le practicaron retencion?" 
                  pressed={yaRetenido} 
                  onToggle={setYaRetenido} 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
            <Info className="h-5 w-5 shrink-0 text-foreground/70" />
            <div>
              <p className="font-semibold">Retencion en la fuente (Art. 317)</p>
              <p>Solo se practica retencion si el premio es igual o superior a 48 UVT ({formatCOP(LOTERIAS_MIN_RETENCION)}).</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 heading-serif text-lg">Resultado</h2>
                <CalculatorResult items={[
                  { label: "Base Gravable", value: formatCOP(results.baseGravable) },
                  { label: "Impuesto (20%)", value: formatCOP(results.impuesto) },
                  { label: "Saldo a Pagar", value: formatCOP(results.saldoAPagar) },
                ]} />
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sujeto a retencion:</span>
                    {results.sujetoRetencion ? (
                      <span className="inline-block rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background">SI</span>
                    ) : (
                      <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">NO</span>
                    )}
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2">
                    <span className="text-muted-foreground text-xs italic">
                      {tipoJuego === "apuesta_hipica" ? "Nota: Se resto el valor de la apuesta segun Art. 306" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa el valor del premio para calcular el impuesto.</p>
            </div>
          )}
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "304", reason: "Tarifa del impuesto ganancias ocasionales." },
          { id: "306", reason: "Base gravable especial apuestas." },
          { id: "317", reason: "Retencion en la fuente premios." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 304 ET", "Art. 306 ET", "Art. 317 ET"]}
      />

      <RelatedCalculators currentId="ganancias-loterias" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Liquidacion Impuesto Loterias"
            subtitle={`Premio: ${formatCOP(premioBruto)} | Tipo: ${tipoJuego}`}
          >
            {results && (
              <div className="space-y-2 text-sm">
                <p>Valor premio: {formatCOP(premioBruto)}</p>
                <p>Base gravable: {formatCOP(results.baseGravable)}</p>
                <p>Impuesto (20%): {formatCOP(results.impuesto)}</p>
                <p>Retencion practicada: {yaRetenido ? "Si" : "No"}</p>
                <p>Saldo a pagar: {formatCOP(results.saldoAPagar)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function LoteriasPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <LoteriasPageContent />
    </Suspense>
  );
}
