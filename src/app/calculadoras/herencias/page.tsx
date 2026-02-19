"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { 
  GANANCIA_OCASIONAL_RATE, 
  HERENCIA_EXENCION_HEREDEROS_UVT,
  HERENCIA_EXENCION_OTROS_PCT,
  HERENCIA_EXENCION_OTROS_TOPE_UVT,
  PORCION_CONYUGAL_EXENTA_UVT,
  HERENCIA_VIVIENDA_EXENCION_UVT,
  HERENCIA_OTROS_INMUEBLES_EXENCION_UVT
} from "@/config/tax-data-ganancias";
import { CurrencyInput, SelectInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

const TIPO_BIEN_OPTIONS = [
  { value: "vivienda_causante", label: "Vivienda de Habitación del Causante" },
  { value: "otros_inmuebles", label: "Otros Inmuebles" },
  { value: "otros_bienes", label: "Dinero, Acciones, Otros" },
];

export default function HerenciasPage() {
  const [valorBienes, setValorBienes] = useState(0);
  const [tipoBien, setTipoBien] = useState("vivienda_causante");
  const [relacionDirecta, setRelacionDirecta] = useState(true);
  const [esPorcionConyugal, setEsPorcionConyugal] = useState(false);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const results = useMemo(() => {
    if (valorBienes <= 0) return null;

    let exencionBien = 0;
    let exencionPersonal = 0;

    // 1. Exenciones por tipo de bien (solo si es herencia/legado, no donación - simplificado)
    if (tipoBien === "vivienda_causante") {
      exencionBien = Math.min(valorBienes, HERENCIA_VIVIENDA_EXENCION_UVT * uvt);
    } else if (tipoBien === "otros_inmuebles") {
      exencionBien = Math.min(valorBienes, HERENCIA_OTROS_INMUEBLES_EXENCION_UVT * uvt);
    }

    const remanente = valorBienes - exencionBien;

    // 2. Exenciones por relación (Art. 307 Num 3 y 4)
    if (esPorcionConyugal) {
      exencionPersonal = Math.min(remanente, PORCION_CONYUGAL_EXENTA_UVT * uvt);
    } else if (relacionDirecta) {
      exencionPersonal = Math.min(remanente, HERENCIA_EXENCION_HEREDEROS_UVT * uvt);
    } else {
      exencionPersonal = Math.min(remanente * HERENCIA_EXENCION_OTROS_PCT, HERENCIA_EXENCION_OTROS_TOPE_UVT * uvt);
    }

    const totalExencion = exencionBien + exencionPersonal;
    const gananciaGravable = Math.max(0, valorBienes - totalExencion);
    const impuesto = gananciaGravable * GANANCIA_OCASIONAL_RATE;

    return {
      exencionBien,
      exencionPersonal,
      totalExencion,
      gananciaGravable,
      impuesto
    };
  }, [valorBienes, tipoBien, relacionDirecta, esPorcionConyugal, uvt]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-6 heading-serif text-3xl">Herencias y Donaciones</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">Perfeccionado con topes Ley 2277/2022.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 heading-serif text-lg">Datos de la Asignación</h2>
            <div className="space-y-4">
              <CurrencyInput id="valor-bienes" label="Valor de los Bienes" value={valorBienes} onChange={setValorBienes} />
              <SelectInput id="tipo-bien" label="Tipo de Bien" value={tipoBien} onChange={setTipoBien} options={TIPO_BIEN_OPTIONS} />
              
              <div className="flex flex-col gap-3 pt-2">
                <ToggleInput label="Heredero Directo / Cónyuge" pressed={relacionDirecta} onToggle={setRelacionDirecta} />
                {relacionDirecta && (
                  <ToggleInput label="Es Porción Conyugal" pressed={esPorcionConyugal} onToggle={setEsPorcionConyugal} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 heading-serif text-lg">Resultado</h2>
                <CalculatorResult items={[
                  { label: "Valor Recibido", value: formatCOP(valorBienes) },
                  { label: "Exención Total", value: formatCOP(results.totalExencion), sublabel: "Art. 307 ET" },
                  { label: "Base Gravable", value: formatCOP(results.gananciaGravable) },
                  { label: "Impuesto (15%)", value: formatCOP(results.impuesto) },
                ]} />
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-sm">
                <h3 className="mb-2 font-semibold tracking-tight">Desglose de Exenciones</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Exención por tipo de bien:</span>
                    <span>{formatCOP(results.exencionBien)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exención personal:</span>
                    <span>{formatCOP(results.exencionPersonal)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa los valores para ver el desglose.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["307", "314"]} />
      </div>
    </div>
  );
}
