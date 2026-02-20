"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { ZONAS_FRANCAS } from "@/config/tax-data-sprint2";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
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

function ZonasFrancasPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    return {
      rentaLiquida: readNumberParam(searchParams, "renta", 0, { min: 0 }),
      tipoUsuario: readStringParam(searchParams, "tipo", "industrial"),
      ingresosTotales: readNumberParam(searchParams, "ing", 0, { min: 0 }),
      ingresosExportacion: readNumberParam(searchParams, "exp", 0, { min: 0 }),
      utilidadDepurada: readNumberParam(searchParams, "utilidad", 0, { min: 0 }),
    };
  }, [searchParams]);

  const [rentaLiquida, setRentaLiquida] = useState(initialValues.rentaLiquida);
  const [tipoUsuario, setTipoUsuario] = useState(initialValues.tipoUsuario);
  const [ingresosTotales, setIngresosTotales] = useState(initialValues.ingresosTotales);
  const [ingresosExportacion, setIngresosExportacion] = useState(initialValues.ingresosExportacion);
  const [utilidadDepurada, setUtilidadDepurada] = useState(initialValues.utilidadDepurada);

  const { contentRef, handlePrint } = usePrintExport({ title: "Zonas Francas - Renta" });

  useEffect(() => {
    trackCalculatorUsage("zonas-francas");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      renta: rentaLiquida,
      tipo: tipoUsuario,
      ing: ingresosTotales,
      exp: ingresosExportacion,
      utilidad: utilidadDepurada,
    });
  }, [rentaLiquida, tipoUsuario, ingresosTotales, ingresosExportacion, utilidadDepurada]);

  const results = useMemo(() => {
    if (rentaLiquida <= 0) return null;

    // 1. Determinar Tarifa (Comercial paga 35%, Industrial/Servicios 20% - con requisitos)
    const tarifa = tipoUsuario === "comercial" ? 0.35 : 0.20;

    // 2. Impuesto segun tarifa preferencial
    const impuestoBase = rentaLiquida * tarifa;

    // 3. Validacion TTD Real (Minimo 15% segun Ley 2277 Art 240 Par 6)
    // TTD = Impuesto Neto / Utilidad Depurada
    
    // Si TTD < 15%, se debe adicionar impuesto.
    // Impuesto a adicionar (IA) = (Utilidad Depurada * 15%) - Impuesto Depurado
    // Impuesto Final = Impuesto Base + IA
    // Simplificado: Impuesto Final = max(Impuesto Base, Utilidad Depurada * 0.15)
    
    const impuestoMinimoTTD = utilidadDepurada * ZONAS_FRANCAS.tarifa_ttd_minima;
    const impuestoFinal = Math.max(impuestoBase, impuestoMinimoTTD);

    // 4. Ahorro frente a tarifa general (35%)
    const ahorro = (rentaLiquida * 0.35) - impuestoFinal;
    const pctExportacion = ingresosTotales > 0 ? (ingresosExportacion / ingresosTotales) * 100 : 0;

    return {
      tarifa,
      impuestoFinal,
      ahorro,
      ttdReal: (impuestoFinal / (utilidadDepurada || 1)) * 100, // TTD calculada final
      pctExportacion,
      ajusteTTD: impuestoFinal > impuestoBase
    };
  }, [rentaLiquida, tipoUsuario, ingresosTotales, ingresosExportacion, utilidadDepurada]);

  const shareUrl = buildShareUrl("/calculadoras/zonas-francas", {
    renta: rentaLiquida,
    tipo: tipoUsuario,
    ing: ingresosTotales,
    exp: ingresosExportacion,
    utilidad: utilidadDepurada,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Zonas Francas" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Zonas Francas</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula el impuesto de renta para usuarios de Zona Franca y valida la Tasa de Tributacion Depurada (TTD) minima del 15%.
      </p>

      <CalculatorActions
        title="Impuesto Renta Zonas Francas"
        shareText="Consulta este calculo de renta ZF"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 lg:grid-cols-2 mb-6">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 heading-serif text-lg">Datos del Usuario</h2>
            <div className="space-y-4">
              <CurrencyInput 
                id="renta" 
                label="Renta Liquida Gravable" 
                value={rentaLiquida} 
                onChange={setRentaLiquida} 
                placeholder="Ej: 500.000.000"
              />

              <SelectInput
                id="tipo"
                label="Tipo de Usuario"
                value={tipoUsuario}
                onChange={setTipoUsuario}
                options={[
                  { value: "industrial", label: "Usuario Industrial (Tarifa 20%)" },
                  { value: "servicios", label: "Usuario de Servicios (Tarifa 20%)" },
                  { value: "comercial", label: "Usuario Comercial (Tarifa 35%)" }
                ]}
              />

              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">Informacion de Exportacion (Plan de Internacionalizacion)</h3>
                <div className="space-y-4">
                  <CurrencyInput 
                    id="it" 
                    label="Ingresos Totales" 
                    value={ingresosTotales} 
                    onChange={setIngresosTotales} 
                  />
                  <CurrencyInput 
                    id="ix" 
                    label="Ingresos por Exportacion" 
                    value={ingresosExportacion} 
                    onChange={setIngresosExportacion} 
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">Validacion TTD (Ley 2277/2022)</h3>
                <CurrencyInput 
                  id="ud" 
                  label="Utilidad Depurada (Art. 240 Par. 6)" 
                  helperText="Base contable depurada para calculo de tasa minima."
                  value={utilidadDepurada} 
                  onChange={setUtilidadDepurada} 
                  placeholder="Ej: 600.000.000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 heading-serif text-lg">Liquidacion ZF</h2>
                <CalculatorResult items={[
                  { label: "Tarifa Nominal", value: (results.tarifa * 100) + "%" },
                  { label: "Impuesto Final", value: formatCOP(results.impuestoFinal) },
                  { label: "Ahorro Estimado", value: formatCOP(results.ahorro), sublabel: "Vs Tarifa General 35%" },
                ]} />
              </div>

              {results.ajusteTTD && (
                <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 flex gap-3 text-sm">
                  <Info className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Ajuste por Tasa Minima (TTD)</p>
                    <p>El impuesto se incremento para alcanzar la Tasa de Tributacion Depurada minima del 15% sobre la Utilidad Comercial Depurada.</p>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-sm">
                <h3 className="mb-2 font-semibold">Indicadores</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">TTD Real Final:</span>
                    <span>{results.ttdReal.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">% Ingresos Exportacion:</span>
                    <span>{results.pctExportacion.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa la renta liquida para proyectar el impuesto.</p>
            </div>
          )}
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "240-1", reason: "Tarifa usuarios de zona franca." },
          { id: "240", reason: "Paragrafo 6: Tasa de Tributacion Depurada." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 240-1 ET", "Art. 240 Par. 6 ET"]}
        message="Calculo sujeto al cumplimiento del Plan de Internacionalizacion y Ventas para aplicar tarifa del 20%."
      />

      <RelatedCalculators currentId="zonas-francas" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Liquidacion Renta Zona Franca"
            subtitle={`Usuario: ${tipoUsuario} | Renta Liquida: ${formatCOP(rentaLiquida)}`}
          >
            {results && (
              <div className="space-y-2 text-sm">
                <p>Renta Liquida Gravable: {formatCOP(rentaLiquida)}</p>
                <p>Utilidad Depurada: {formatCOP(utilidadDepurada)}</p>
                <p>Impuesto Calculado: {formatCOP(results.impuestoFinal)}</p>
                <p>Tarifa Efectiva TTD: {results.ttdReal.toFixed(2)}%</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function ZonasFrancasPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <ZonasFrancasPageContent />
    </Suspense>
  );
}
