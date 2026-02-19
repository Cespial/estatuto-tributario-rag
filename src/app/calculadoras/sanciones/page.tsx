"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { CurrencyInput, NumberInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function SancionesPage() {
  const [impuesto, setImpuesto] = useState(0);
  const [meses, setMeses] = useState(0);
  const [emplazamiento, setEmplazamiento] = useState(false);
  const [primeraInfraccion, setPrimeraInfraccion] = useState(false);
  // Campos condicionales cuando impuesto = 0
  const [ingresoBruto, setIngresoBruto] = useState(0);
  const [patrimonioLiquido, setPatrimonioLiquido] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const sancionMinima = 10 * uvt;

  const result = useMemo(() => {
    if (meses <= 0) return null;

    const tasaPorMes = emplazamiento ? 0.10 : 0.05;

    let sancionBruta: number;
    let tope: number;

    if (impuesto > 0) {
      // Art. 641/642: sancion = impuesto * tasa * meses
      sancionBruta = impuesto * tasaPorMes * meses;
      tope = emplazamiento ? impuesto * 2 : impuesto;
    } else {
      // Cuando impuesto = 0: base es 0.5% ingresos brutos o 1% patrimonio liquido (el mayor)
      const baseIngreso = ingresoBruto * 0.005 * meses;
      const basePatrimonio = patrimonioLiquido * 0.01 * meses;
      sancionBruta = Math.max(baseIngreso, basePatrimonio);
      tope = emplazamiento
        ? Math.max(ingresoBruto * 0.10, patrimonioLiquido * 0.20)
        : Math.max(ingresoBruto * 0.05, patrimonioLiquido * 0.10);
    }

    // Aplicar tope
    const sancionConTope = Math.min(sancionBruta, tope || Infinity);

    // Reduccion Art. 640: primera infraccion en 2 anos = 50%
    const reduccion = primeraInfraccion ? 0.5 : 1;
    const sancionReducida = sancionConTope * reduccion;

    // Minimo 10 UVT
    const sancionFinal = Math.max(sancionReducida, sancionMinima);

    return {
      sancionBruta,
      tope: tope || 0,
      sancionConTope,
      reduccion: primeraInfraccion,
      sancionReducida,
      sancionFinal,
    };
  }, [impuesto, meses, emplazamiento, primeraInfraccion, ingresoBruto, patrimonioLiquido, sancionMinima]);

  const resultItems = result
    ? [
        { label: "Sancion calculada", value: formatCOP(result.sancionBruta) },
        ...(result.tope > 0 ? [{ label: "Tope aplicable", value: formatCOP(result.tope) }] : []),
        ...(result.reduccion
          ? [{ label: "Reduccion 50% (Art. 640)", value: formatCOP(result.sancionReducida) }]
          : []),
        { label: "Sancion minima (10 UVT)", value: formatCOP(sancionMinima) },
        { label: "Sancion final", value: formatCOP(result.sancionFinal) },
      ]
    : [];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 heading-serif text-3xl">Sancion por Extemporaneidad</h1>

      <div className="mb-6 space-y-4">
        <CurrencyInput id="sancion-impuesto" label="Impuesto a cargo" value={impuesto} onChange={setImpuesto} />
        <NumberInput id="sancion-meses" label="Meses de retraso" value={meses} onChange={setMeses} min={0} max={120} />

        {impuesto === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CurrencyInput
              id="sancion-ingreso"
              label="Ingresos brutos del periodo"
              value={ingresoBruto}
              onChange={setIngresoBruto}
            />
            <CurrencyInput
              id="sancion-patrimonio"
              label="Patrimonio liquido"
              value={patrimonioLiquido}
              onChange={setPatrimonioLiquido}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <ToggleInput
            label="Emplazamiento previo"
            pressed={emplazamiento}
            onToggle={setEmplazamiento}
          />
          <ToggleInput
            label="Primera infraccion en 2 anos"
            pressed={primeraInfraccion}
            onToggle={setPrimeraInfraccion}
          />
        </div>
      </div>

      {resultItems.length > 0 && (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      )}

      <div className="mb-6 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">Como se calcula</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li><strong>Sin emplazamiento (Art. 641):</strong> 5% del impuesto por cada mes o fraccion de retraso, tope 100% del impuesto.</li>
          <li><strong>Con emplazamiento (Art. 642):</strong> 10% del impuesto por cada mes o fraccion, tope 200% del impuesto.</li>
          <li><strong>Reduccion Art. 640:</strong> 50% si es la primera infraccion en los ultimos 2 anos.</li>
          <li><strong>Sancion minima:</strong> 10 UVT ({formatCOP(sancionMinima)} en {CURRENT_UVT_YEAR}).</li>
        </ul>
      </div>

      <CalculatorSources articles={["641", "642", "640"]} />
    </>
  );
}
