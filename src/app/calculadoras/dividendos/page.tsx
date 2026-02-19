"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR, RENTA_BRACKETS } from "@/config/tax-data";
import {
  DIVIDENDOS_NO_GRAVADOS_RATE,
  DIVIDENDOS_DESCUENTO_RATE
} from "@/config/tax-data-ganancias";
import { CurrencyInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function calculateTax(rentaUVT: number): number {
  for (let i = RENTA_BRACKETS.length - 1; i >= 0; i--) {
    const b = RENTA_BRACKETS[i];
    if (rentaUVT > b.from) {
      return (rentaUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

export default function DividendosPage() {
  const [porcionGravada, setPorcionGravada] = useState(0);
  const [porcionNoGravada, setPorcionNoGravada] = useState(0);
  const [otrosIngresos, setOtrosIngresos] = useState(0);
  const [esResidente, setEsResidente] = useState(true);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const results = useMemo(() => {
    const totalDividendos = porcionGravada + porcionNoGravada;
    if (totalDividendos <= 0 && otrosIngresos <= 0) return null;

    let impuestoFinal = 0;
    let descuentoArt254 = 0;
    let retencionSugerida = 0;

    if (esResidente) {
      // 1. Manejo de Porción No Gravada (Art. 49 Par 2)
      // Se le aplica el 35% corporativo y el remanente se suma a la base
      const impuestoCorpB = porcionNoGravada * DIVIDENDOS_NO_GRAVADOS_RATE;
      const remanenteB = porcionNoGravada - impuestoCorpB;

      // 2. Base Gravable Total (Cédula General)
      const baseTotalCOP = otrosIngresos + porcionGravada + remanenteB;
      const baseTotalUVT = baseTotalCOP / uvt;

      const impuestoBrutoTotal = calculateTax(baseTotalUVT) * uvt;
      // 3. Descuento Tributario (Art. 254-1)
      // 19% sobre dividendos que excedan 1090 UVT
      const dividendosSujetosDescuento = Math.max(0, (porcionGravada + remanenteB) - (1090 * uvt));
      descuentoArt254 = dividendosSujetosDescuento * DIVIDENDOS_DESCUENTO_RATE;

      impuestoFinal = Math.max(0, impuestoBrutoTotal - descuentoArt254);
      retencionSugerida = (porcionGravada + remanenteB) > (1090 * uvt) ? (porcionGravada + remanenteB - 1090 * uvt) * 0.15 : 0;
    } else {
      // No residentes: 20% sobre gravados, 35% sobre no gravados
      impuestoFinal = (porcionGravada * 0.20) + (porcionNoGravada * 0.35);
    }

    return {
      impuestoFinal,
      descuentoArt254,
      retencionSugerida,
      tasaEfectiva: totalDividendos > 0 ? impuestoFinal / totalDividendos : 0
    };
  }, [porcionGravada, porcionNoGravada, otrosIngresos, esResidente, uvt]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Dividendos y Participaciones</h1>
      <p className="mb-10 text-muted-foreground">Integrado a Cédula General (Ley 2277/2022).</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Ingresos del Socio</h2>
            <div className="space-y-4">
              <CurrencyInput id="otros-ingresos" label="Otros Ingresos Gravables (Salarios, etc)" value={otrosIngresos} onChange={setOtrosIngresos} />
              <CurrencyInput id="p-gravada" label="Dividendos Gravados (Art. 49 P3)" value={porcionGravada} onChange={setPorcionGravada} />
              <CurrencyInput id="p-no-gravada" label="Dividendos NO Gravados (Art. 49 P2)" value={porcionNoGravada} onChange={setPorcionNoGravada} />
              <div className="pt-2 border-t border-border">
                <ToggleInput label="Es Residente Fiscal" pressed={esResidente} onToggle={setEsResidente} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold tracking-tight">Estimación Fiscal</h2>
                <CalculatorResult items={[
                  { label: "Impuesto Estimado", value: formatCOP(results.impuestoFinal) },
                  { label: "Descuento Art 254-1", value: formatCOP(results.descuentoArt254), sublabel: "Ahorro por ley" },
                  { label: "Tasa Efectiva", value: (results.tasaEfectiva * 100).toFixed(1) + "%" },
                ]} />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
                <p><strong>Nota:</strong> Desde 2023, los dividendos se suman a tus demás ingresos. Esta calculadora estima el impacto marginal.</p>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa tus ingresos para calcular el impuesto.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["242", "254-1", "49"]} />
      </div>
    </div>
  );
}
