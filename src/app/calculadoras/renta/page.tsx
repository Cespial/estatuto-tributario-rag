"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RENTA_BRACKETS,
  LEY_2277_LIMITS,
} from "@/config/tax-data";
import { CurrencyInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function calcImpuestoRenta(rentaLiquidaUVT: number): { impuestoUVT: number; breakdown: Array<{ from: number; to: number; rate: number; impuesto: number }> } {
  const breakdown: Array<{ from: number; to: number; rate: number; impuesto: number }> = [];
  let impuestoUVT = 0;

  for (const bracket of RENTA_BRACKETS) {
    if (rentaLiquidaUVT <= bracket.from) break;
    if (rentaLiquidaUVT > bracket.from) {
      const taxable = Math.min(rentaLiquidaUVT, bracket.to) - bracket.from;
      const tax = taxable * bracket.rate;
      if (tax > 0) {
        breakdown.push({
          from: bracket.from,
          to: Math.min(rentaLiquidaUVT, bracket.to),
          rate: bracket.rate,
          impuesto: tax,
        });
      }
      impuestoUVT += tax;
    }
  }

  return { impuestoUVT, breakdown };
}

export default function RentaPage() {
  const [ingresoBruto, setIngresoBruto] = useState(0);
  const [deducciones, setDeducciones] = useState(0);
  const [rentasExentas, setRentasExentas] = useState(0);
  const [dependientes, setDependientes] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const result = useMemo(() => {
    if (ingresoBruto <= 0) return null;

    // Cap dependientes
    const numDep = Math.min(dependientes, LEY_2277_LIMITS.maxDependientes);
    const deduccionDependientes = numDep * LEY_2277_LIMITS.dependienteUVT * uvt;

    // Cap rentas exentas a 790 UVT
    const maxExentasCOP = LEY_2277_LIMITS.rentasExentasMaxUVT * uvt;
    const exentasAplicadas = Math.min(rentasExentas, maxExentasCOP);

    // Total deducciones + exentas, cap a 1,340 UVT
    const maxCombinadoCOP = LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt;
    const totalDeduccionesExentas = Math.min(
      deducciones + exentasAplicadas + deduccionDependientes,
      maxCombinadoCOP,
    );

    // Renta liquida gravable
    const rentaLiquidaCOP = Math.max(0, ingresoBruto - totalDeduccionesExentas);
    const rentaLiquidaUVT = rentaLiquidaCOP / uvt;

    // Calcular impuesto marginal
    const { impuestoUVT, breakdown } = calcImpuestoRenta(rentaLiquidaUVT);
    const impuestoCOP = impuestoUVT * uvt;

    // Tasa efectiva
    const tasaEfectiva = ingresoBruto > 0 ? impuestoCOP / ingresoBruto : 0;

    return {
      rentaLiquidaCOP,
      rentaLiquidaUVT,
      impuestoUVT,
      impuestoCOP,
      tasaEfectiva,
      breakdown,
      totalDeduccionesExentas,
      warnings: {
        exentasCapped: rentasExentas > maxExentasCOP,
        combinadoCapped: deducciones + rentasExentas + deduccionDependientes > maxCombinadoCOP,
        dependientesCapped: dependientes > LEY_2277_LIMITS.maxDependientes,
      },
    };
  }, [ingresoBruto, deducciones, rentasExentas, dependientes, uvt]);

  const resultItems = result
    ? [
        { label: "Renta liquida gravable", value: formatCOP(result.rentaLiquidaCOP), sublabel: `${result.rentaLiquidaUVT.toFixed(2)} UVT` },
        { label: "Impuesto de renta", value: formatCOP(result.impuestoCOP), sublabel: `${result.impuestoUVT.toFixed(2)} UVT` },
        { label: "Tasa efectiva", value: (result.tasaEfectiva * 100).toFixed(2) + "%" },
        { label: "Deducciones + exentas aplicadas", value: formatCOP(result.totalDeduccionesExentas) },
      ]
    : [];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 heading-serif text-3xl">Renta Personas Naturales</h1>

      <div className="mb-6 space-y-4">
        <CurrencyInput id="renta-ingreso" label="Ingreso bruto anual" value={ingresoBruto} onChange={setIngresoBruto} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CurrencyInput id="renta-deducciones" label="Deducciones" value={deducciones} onChange={setDeducciones} />
          <CurrencyInput
            id="renta-exentas"
            label={`Rentas exentas (max ${LEY_2277_LIMITS.rentasExentasMaxUVT} UVT)`}
            value={rentasExentas}
            onChange={setRentasExentas}
          />
          <NumberInput
            id="renta-dependientes"
            label={`Dependientes (max ${LEY_2277_LIMITS.maxDependientes})`}
            value={dependientes}
            onChange={setDependientes}
            min={0}
            max={LEY_2277_LIMITS.maxDependientes}
          />
        </div>
      </div>

      {/* Warnings */}
      {result?.warnings && (
        <div className="mb-4 space-y-1">
          {result.warnings.exentasCapped && (
            <p className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 text-sm">
              Rentas exentas limitadas a {LEY_2277_LIMITS.rentasExentasMaxUVT} UVT ({formatCOP(LEY_2277_LIMITS.rentasExentasMaxUVT * uvt)}).
            </p>
          )}
          {result.warnings.combinadoCapped && (
            <p className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 text-sm">
              Total deducciones + exentas limitado a {LEY_2277_LIMITS.deduccionesExentasMaxUVT} UVT ({formatCOP(LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt)}).
            </p>
          )}
        </div>
      )}

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      {/* Desglose marginal */}
      {result && result.breakdown.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Desglose marginal</h2>
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                  <th className="px-4 py-2 text-left">Rango (UVT)</th>
                  <th className="px-4 py-2 text-right">Tarifa</th>
                  <th className="px-4 py-2 text-right">Impuesto (UVT)</th>
                  <th className="px-4 py-2 text-right">Impuesto (COP)</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((b, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">
                      {b.from.toLocaleString("es-CO")} - {b.to === Infinity ? "∞" : b.to.toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-2 text-right">{(b.rate * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2 text-right">{b.impuesto.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{formatCOP(b.impuesto * uvt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Art. 241 */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Tabla Art. 241 ET</h2>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                <th className="px-4 py-2 text-left">Desde (UVT)</th>
                <th className="px-4 py-2 text-left">Hasta (UVT)</th>
                <th className="px-4 py-2 text-right">Tarifa marginal</th>
              </tr>
            </thead>
            <tbody>
              {RENTA_BRACKETS.map((b, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{b.from.toLocaleString("es-CO")}</td>
                  <td className="px-4 py-2">{b.to === Infinity ? "En adelante" : b.to.toLocaleString("es-CO")}</td>
                  <td className="px-4 py-2 text-right">{(b.rate * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CalculatorSources articles={["241", "206", "336"]} />
    </>
  );
}
