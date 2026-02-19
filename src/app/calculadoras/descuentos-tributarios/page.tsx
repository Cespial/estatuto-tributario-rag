"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { DESCUENTOS_TRIBUTARIOS } from "@/config/tax-data-sprint2";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function DescuentosTributariosPage() {
  const [impuestoRentaLiquido, setImpuestoRentaLiquido] = useState(0);
  const [ivaActivosProductivos, setIvaActivosProductivos] = useState(0);
  const [donaciones, setDonaciones] = useState(0);
  const [impuestoExterior, setImpuestoExterior] = useState(0);
  const [rentaLiquidaExterior, setRentaLiquidaExterior] = useState(0);
  const [rentaLiquidaTotal, setRentaLiquidaTotal] = useState(0);

  const results = useMemo(() => {
    if (impuestoRentaLiquido <= 0) return null;

    // 1. IVA Activos Productivos (100% Art. 258-1)
    const descuentoIVA = ivaActivosProductivos;

    // 2. Donaciones (25% Art. 257) - Límite sobre impuesto de renta
    const descuentoDonaciones = Math.min(
      donaciones * DESCUENTOS_TRIBUTARIOS.donaciones_pct,
      impuestoRentaLiquido * DESCUENTOS_TRIBUTARIOS.donaciones_tope_renta_pct
    );

    // 3. Impuesto Exterior (Art. 254) - Límite proporcional al impuesto
    const limiteExterior = rentaLiquidaTotal > 0
      ? impuestoRentaLiquido * (rentaLiquidaExterior / rentaLiquidaTotal)
      : 0;
    const descuentoExterior = Math.min(impuestoExterior, limiteExterior);

    // 4. Límite Art. 259: No pueden exceder el impuesto de renta
    const sumaDescuentos = descuentoIVA + descuentoDonaciones + descuentoExterior;
    const descuentoEfectivo = Math.min(sumaDescuentos, impuestoRentaLiquido);

    const impuestoNeto = Math.max(0, impuestoRentaLiquido - descuentoEfectivo);

    return {
      descuentoIVA,
      descuentoDonaciones,
      descuentoExterior,
      sumaDescuentos,
      descuentoEfectivo,
      impuestoNeto,
      superaLimite: sumaDescuentos > impuestoRentaLiquido
    };
  }, [impuestoRentaLiquido, ivaActivosProductivos, donaciones, impuestoExterior, rentaLiquidaExterior, rentaLiquidaTotal]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Descuentos Tributarios</h1>
      <p className="mb-10 text-muted-foreground">Calcula los descuentos aplicables al impuesto de renta y sus límites legales.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Base de Impuesto</h2>
            <CurrencyInput id="imp" label="Impuesto de Renta Líquido" value={impuestoRentaLiquido} onChange={setImpuestoRentaLiquido} />
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Conceptos de Descuento</h2>
            <div className="space-y-4">
              <CurrencyInput id="iva" label="IVA Activos Productivos" value={ivaActivosProductivos} onChange={setIvaActivosProductivos} />
              <CurrencyInput id="don" label="Donaciones Realizadas" value={donaciones} onChange={setDonaciones} />
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">Impuestos en el Exterior</h3>
                <div className="space-y-4">
                  <CurrencyInput id="ie" label="Impuesto Pagado en Exterior" value={impuestoExterior} onChange={setImpuestoExterior} />
                  <CurrencyInput id="rle" label="Renta Líquida Exterior" value={rentaLiquidaExterior} onChange={setRentaLiquidaExterior} />
                  <CurrencyInput id="rlt" label="Renta Líquida Total" value={rentaLiquidaTotal} onChange={setRentaLiquidaTotal} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold tracking-tight">Liquidación Final</h2>
                <CalculatorResult items={[
                  { label: "Total Descuentos", value: formatCOP(results.descuentoEfectivo) },
                  { label: "Impuesto Neto", value: formatCOP(results.impuestoNeto) },
                ]} />
              </div>

              {results.superaLimite && (
                <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p><strong>Límite Art. 259:</strong> Los descuentos exceden el impuesto de renta líquido. Solo se pueden tomar hasta por el valor del impuesto.</p>
                </div>
              )}

              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm text-sm">
                <h3 className="mb-2 font-semibold">Desglose Técnico</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (Art. 258-1):</span>
                    <span>{formatCOP(results.descuentoIVA)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donaciones (Art. 257):</span>
                    <span>{formatCOP(results.descuentoDonaciones)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exterior (Art. 254):</span>
                    <span>{formatCOP(results.descuentoExterior)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa el impuesto de renta para calcular los descuentos.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["254", "257", "258-1", "259"]} />
      </div>
    </div>
  );
}
