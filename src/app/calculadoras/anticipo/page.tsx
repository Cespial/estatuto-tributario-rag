"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ANTICIPO_RATES } from "@/config/tax-data-corporativo";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function AnticipoPage() {
  const [impuestoActual, setImpuestoActual] = useState(0);
  const [impuestoAnterior, setImpuestoAnterior] = useState(0);
  const [retenciones, setRetenciones] = useState(0);
  const [anio, setAnio] = useState("subsiguiente");

  const result = useMemo(() => {
    let porcentaje = 0;
    if (anio === "primer_ano") porcentaje = ANTICIPO_RATES.primerAno;
    else if (anio === "segundo_ano") porcentaje = ANTICIPO_RATES.segundoAno;
    else porcentaje = ANTICIPO_RATES.subsiguientes;

    // Opcion A: Impuesto neto año actual × porcentaje
    const opcionA = impuestoActual * porcentaje;

    // Opcion B: Promedio 2 últimos años × porcentaje
    const promedio = (impuestoActual + impuestoAnterior) / 2;
    const opcionB = promedio * porcentaje;

    // Contribuyente escoge el menor (Art. 807)
    const anticipoBruto = Math.min(opcionA, opcionB);
    const anticipoNeto = Math.max(0, anticipoBruto - retenciones);

    return {
      porcentaje,
      opcionA,
      opcionB,
      promedio,
      anticipoBruto,
      anticipoNeto,
      isOpcionA: opcionA <= opcionB,
    };
  }, [impuestoActual, impuestoAnterior, retenciones, anio]);

  const resultItems = [
    { label: "Opcion A (Imp. Actual)", value: formatCOP(result.opcionA), sublabel: `Tarifa ${result.porcentaje * 100}%` },
    { label: "Opcion B (Promedio)", value: formatCOP(result.opcionB), sublabel: `Promedio: ${formatCOP(result.promedio)}` },
    { label: "Anticipo Bruto", value: formatCOP(result.anticipoBruto), sublabel: "Se elige el menor" },
    { label: "Anticipo Neto a Pagar", value: formatCOP(result.anticipoNeto), sublabel: `Tras retenciones de ${formatCOP(retenciones)}` },
  ];

  return (
    <>
      <Link href="/calculadoras" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Anticipo de Renta</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcule el anticipo para el año siguiente segun el Art. 807 del Estatuto Tributario.
      </p>

      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput id="imp-actual" label="Impuesto neto de renta año actual" value={impuestoActual} onChange={setImpuestoActual} />
          <CurrencyInput id="imp-anterior" label="Impuesto neto de renta año anterior" value={impuestoAnterior} onChange={setImpuestoAnterior} />
          <CurrencyInput id="retenciones" label="Retenciones en la fuente a favor" value={retenciones} onChange={setRetenciones} />
          <SelectInput
            id="anio-declarante"
            label="Año como declarante"
            value={anio}
            onChange={setAnio}
            options={[
              { value: "primer_ano", label: "Primer año" },
              { value: "segundo_ano", label: "Segundo año" },
              { value: "subsiguiente", label: "Tercer año en adelante" },
            ]}
          />
        </div>
      </div>

      <div className="mb-8">
        <CalculatorResult items={resultItems} />
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Comparativa de Opciones (Art. 807)</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Metodo</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Calculo</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b border-border ${result.isOpcionA ? "bg-primary/5 font-medium" : ""}`}>
                <td className="px-4 py-2">Opcion A</td>
                <td className="px-4 py-2 text-muted-foreground">Impuesto actual ({formatCOP(impuestoActual)}) × {(result.porcentaje * 100)}%</td>
                <td className="px-4 py-2 text-right">{formatCOP(result.opcionA)}</td>
              </tr>
              <tr className={`border-b border-border ${!result.isOpcionA ? "bg-primary/5 font-medium" : ""}`}>
                <td className="px-4 py-2">Opcion B</td>
                <td className="px-4 py-2 text-muted-foreground">Promedio ({formatCOP(result.promedio)}) × {(result.porcentaje * 100)}%</td>
                <td className="px-4 py-2 text-right">{formatCOP(result.opcionB)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          * El contribuyente puede optar por la opcion que resulte menor.
        </p>
      </div>

      <CalculatorSources articles={["807", "809"]} />
    </>
  );
}
