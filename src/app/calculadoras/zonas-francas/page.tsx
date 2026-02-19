"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { ZONAS_FRANCAS } from "@/config/tax-data-sprint2";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function ZonasFrancasPage() {
  const [rentaLiquida, setRentaLiquida] = useState(0);
  const [tipoUsuario, setTipoUsuario] = useState("industrial");
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [ingresosExportacion, setIngresosExportacion] = useState(0);
  const [utilidadDepurada, setUtilidadDepurada] = useState(0);

  const results = useMemo(() => {
    if (rentaLiquida <= 0) return null;

    // 1. Determinar Tarifa (Comercial paga 35%, Industrial/Servicios 20%)
    const tarifa = tipoUsuario === "comercial" ? 0.35 : 0.20;

    // 2. Impuesto según tarifa preferencial
    const impuestoBase = rentaLiquida * tarifa;

    // 3. Validación TTD Real (Mínimo 15% según Ley 2277)
    const ttdReal = utilidadDepurada > 0 ? impuestoBase / utilidadDepurada : 0;
    const impuestoFinal = ttdReal < ZONAS_FRANCAS.tarifa_ttd_minima && utilidadDepurada > 0
      ? utilidadDepurada * ZONAS_FRANCAS.tarifa_ttd_minima
      : impuestoBase;

    // 4. Ahorro frente a tarifa general (35%)
    const ahorro = (rentaLiquida * 0.35) - impuestoFinal;
    const pctExportacion = ingresosTotales > 0 ? (ingresosExportacion / ingresosTotales) * 100 : 0;

    return {
      tarifa,
      impuestoFinal,
      ahorro,
      ttdReal: ttdReal * 100,
      pctExportacion,
      ajusteTTD: impuestoFinal > impuestoBase
    };
  }, [rentaLiquida, tipoUsuario, ingresosTotales, ingresosExportacion, utilidadDepurada]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Zonas Francas</h1>
      <p className="mb-10 text-muted-foreground">Calcula el impuesto de renta para usuarios de Zona Franca y valida la TTD mínima.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Datos del Usuario</h2>
            <div className="space-y-4">
              <CurrencyInput id="renta" label="Renta Líquida Gravable" value={rentaLiquida} onChange={setRentaLiquida} />

              <SelectInput
                id="tipo"
                label="Tipo de Usuario"
                value={tipoUsuario}
                onChange={setTipoUsuario}
                options={[
                  { value: "industrial", label: "Usuario Industrial" },
                  { value: "servicios", label: "Usuario de Servicios" },
                  { value: "comercial", label: "Usuario Comercial" }
                ]}
              />

              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">Información de Exportación</h3>
                <div className="space-y-4">
                  <CurrencyInput id="it" label="Ingresos Totales" value={ingresosTotales} onChange={setIngresosTotales} />
                  <CurrencyInput id="ix" label="Ingresos por Exportación" value={ingresosExportacion} onChange={setIngresosExportacion} />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">Validación TTD</h3>
                <CurrencyInput id="ud" label="Utilidad Depurada (Art. 240)" value={utilidadDepurada} onChange={setUtilidadDepurada} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Liquidación ZF</h2>
                <CalculatorResult items={[
                  { label: "Tarifa Aplicada", value: (results.tarifa * 100) + "%" },
                  { label: "Impuesto Final", value: formatCOP(results.impuestoFinal) },
                  { label: "Ahorro Estimado", value: formatCOP(results.ahorro), sublabel: "Vs Tarifa 35%" },
                ]} />
              </div>

              {results.ajusteTTD && (
                <div className="text-foreground bg-muted/50 border border-border/60 rounded-xl p-4 flex gap-3 text-sm">
                  <Info className="h-5 w-5 shrink-0" />
                  <p><strong>Ajuste TTD:</strong> El impuesto se incrementó para alcanzar la Tasa de Tributación Depurada mínima del 15%.</p>
                </div>
              )}

              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm text-sm">
                <h3 className="mb-2 font-semibold">Indicadores</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TTD Real:</span>
                    <span>{results.ttdReal.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% Exportación:</span>
                    <span>{results.pctExportacion.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa la renta líquida para proyectar el impuesto.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["240-1", "240"]} />
      </div>
    </div>
  );
}
