"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { TIMBRE_RATE, TIMBRE_THRESHOLD_UVT, TIMBRE_INMUEBLES_UVT } from "@/config/tax-data-corporativo";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function TimbrePage() {
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState("contrato_general");

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const valorUVT = valor / uvt;

  const result = useMemo(() => {
    const threshold = tipo === "escritura_publica" ? TIMBRE_INMUEBLES_UVT : TIMBRE_THRESHOLD_UVT;
    const thresholdCOP = threshold * uvt;
    const noAplica = valorUVT < threshold;
    const impuesto = noAplica ? 0 : valor * TIMBRE_RATE;

    return {
      threshold,
      thresholdCOP,
      noAplica,
      impuesto,
    };
  }, [valor, tipo, uvt, valorUVT]);

  const resultItems = [
    { label: "Valor documento", value: formatCOP(valor), sublabel: `${valorUVT.toFixed(2)} UVT` },
    { label: "Umbral aplicable", value: `${result.threshold.toLocaleString("es-CO")} UVT`, sublabel: formatCOP(result.thresholdCOP) },
    { label: "Impuesto de timbre", value: formatCOP(result.impuesto), sublabel: "Tarifa 1%" },
  ];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 heading-serif text-3xl">Impuesto de Timbre Nacional</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">
        Decreto 175/2025 reactivo el impuesto de timbre al 1%. Aplica sobre instrumentos publicos y documentos privados que superen el umbral.
      </p>

      <div className="mb-6 space-y-4">
        <CurrencyInput id="valor-documento" label="Valor del documento/instrumento" value={valor} onChange={setValor} />
        <SelectInput
          id="tipo-documento"
          label="Tipo de documento"
          value={tipo}
          onChange={setTipo}
          options={[
            { value: "contrato_general", label: "Contratos y documentos generales" },
            { value: "escritura_publica", label: "Escrituras publicas de inmuebles" },
            { value: "cesion_acciones", label: "Cesion de acciones" },
          ]}
        />
      </div>

      <div className="mb-6">
        <CalculatorResult items={resultItems} />
      </div>

      {result.noAplica && valor > 0 && (
        <div className="mb-6 text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <div className="text-sm">
            <p className="font-semibold">No aplica impuesto de timbre</p>
            <p>El valor del documento ({formatCOP(valor)}) es inferior al umbral de {result.threshold.toLocaleString("es-CO")} UVT ({formatCOP(result.thresholdCOP)}).</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Umbrales de Impuesto de Timbre</h3>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                <th className="px-4 py-2 text-left">Tipo de Instrumento</th>
                <th className="px-4 py-2 text-right">Umbral (UVT)</th>
                <th className="px-4 py-2 text-right">Umbral ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b border-border ${tipo !== "escritura_publica" ? "bg-muted/50 font-medium" : ""}`}>
                <td className="px-4 py-2">General (Documentos privados/publicos)</td>
                <td className="px-4 py-2 text-right">{TIMBRE_THRESHOLD_UVT.toLocaleString("es-CO")}</td>
                <td className="px-4 py-2 text-right text-muted-foreground">{formatCOP(TIMBRE_THRESHOLD_UVT * uvt)}</td>
              </tr>
              <tr className={`border-b border-border ${tipo === "escritura_publica" ? "bg-muted/50 font-medium" : ""}`}>
                <td className="px-4 py-2">Escrituras publicas (Bienes raices)</td>
                <td className="px-4 py-2 text-right">{TIMBRE_INMUEBLES_UVT.toLocaleString("es-CO")}</td>
                <td className="px-4 py-2 text-right text-muted-foreground">{formatCOP(TIMBRE_INMUEBLES_UVT * uvt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <CalculatorSources articles={["519", "520", "530"]} />
    </>
  );
}
