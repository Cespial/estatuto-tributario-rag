"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DIVIDENDOS_PJ_RATES, TARIFA_GENERAL_PJ } from "@/config/tax-data-sprint2";
import { CurrencyInput, SelectInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function DividendosJuridicasPage() {
  const [dividendosGravados, setDividendosGravados] = useState(0);
  const [dividendosNoGravados, setDividendosNoGravados] = useState(0);
  const [tipoSociedad, setTipoSociedad] = useState("nacional");
  const [participacion, setParticipacion] = useState(100);

  const results = useMemo(() => {
    const totalDividendos = dividendosGravados + dividendosNoGravados;
    if (totalDividendos <= 0) return null;

    let impuestoGravados = 0;
    let impuestoNoGravados = 0;
    let impuestoRemanente = 0;

    if (tipoSociedad === "nacional") {
      impuestoGravados = dividendosGravados * DIVIDENDOS_PJ_RATES.nacionales;
      impuestoNoGravados = dividendosNoGravados * TARIFA_GENERAL_PJ;
      const remanente = dividendosNoGravados - impuestoNoGravados;
      impuestoRemanente = remanente * DIVIDENDOS_PJ_RATES.nacionales;
    } else if (tipoSociedad === "extranjera") {
      impuestoGravados = dividendosGravados * DIVIDENDOS_PJ_RATES.extranjeras;
      impuestoNoGravados = dividendosNoGravados * TARIFA_GENERAL_PJ;
      const remanente = dividendosNoGravados - impuestoNoGravados;
      impuestoRemanente = remanente * DIVIDENDOS_PJ_RATES.extranjeras;
    } else {
      // CDI: Tarifa reducida sobre el total
      impuestoGravados = totalDividendos * DIVIDENDOS_PJ_RATES.cdi;
    }

    const totalImpuesto = impuestoGravados + impuestoNoGravados + impuestoRemanente;
    const netaSocio = (totalDividendos - totalImpuesto) * (participacion / 100);

    return {
      totalDividendos,
      impuestoGravados,
      impuestoNoGravados,
      impuestoRemanente,
      totalImpuesto,
      netaSocio,
      tasaEfectiva: (totalImpuesto / totalDividendos) * 100
    };
  }, [dividendosGravados, dividendosNoGravados, tipoSociedad, participacion]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>
      
      <h1 className="mb-2 text-3xl font-bold">Dividendos PJ</h1>
      <p className="mb-8 text-muted-foreground">Retención y tributación de dividendos para socios personas jurídicas.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Datos de la Sociedad</h2>
            <div className="space-y-4">
              <CurrencyInput id="gravados" label="Dividendos Gravados (Art. 49 P3)" value={dividendosGravados} onChange={setDividendosGravados} />
              <CurrencyInput id="no-gravados" label="Dividendos NO Gravados (Art. 49 P2)" value={dividendosNoGravados} onChange={setDividendosNoGravados} />
              
              <SelectInput 
                id="tipo" 
                label="Naturaleza del Socio" 
                value={tipoSociedad} 
                onChange={setTipoSociedad}
                options={[
                  { value: "nacional", label: "Sociedad Nacional" },
                  { value: "extranjera", label: "Sociedad Extranjera" },
                  { value: "cdi", label: "CDI (Convenio Doble Imposición)" }
                ]}
              />

              <NumberInput id="part" label="% de Participación" value={participacion} onChange={setParticipacion} min={0} max={100} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Resumen de Tributación</h2>
                <CalculatorResult items={[
                  { label: "Impuesto Total", value: formatCOP(results.totalImpuesto) },
                  { label: "Valor Neto Socio", value: formatCOP(results.netaSocio), sublabel: `Corresponde al ${participacion}%` },
                  { label: "Tasa Efectiva", value: results.tasaEfectiva.toFixed(2) + "%" },
                ]} />
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Concepto</th>
                      <th className="px-4 py-2 text-right font-medium">Impuesto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2 text-muted-foreground">Sobre porción gravada</td>
                      <td className="px-4 py-2 text-right">{formatCOP(results.impuestoGravados)}</td>
                    </tr>
                    {tipoSociedad !== "cdi" && (
                      <>
                        <tr className="border-t border-border">
                          <td className="px-4 py-2 text-muted-foreground">Sobre no gravados (Tarifa 35%)</td>
                          <td className="px-4 py-2 text-right">{formatCOP(results.impuestoNoGravados)}</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="px-4 py-2 text-muted-foreground">Retención sobre remanente</td>
                          <td className="px-4 py-2 text-right">{formatCOP(results.impuestoRemanente)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa los montos de los dividendos para ver el cálculo.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["242-1", "49", "245"]} />
      </div>
    </div>
  );
}
