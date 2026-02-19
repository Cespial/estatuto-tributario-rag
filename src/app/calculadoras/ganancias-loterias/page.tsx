"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { LOTERIAS_RATE, LOTERIAS_MIN_RETENCION } from "@/config/tax-data-sprint2";
import { CurrencyInput, SelectInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function LoteriasPage() {
  const [premioBruto, setPremioBruto] = useState(0);
  const [tipoJuego, setTipoJuego] = useState("loteria");
  const [valorApuesta, setValorApuesta] = useState(0);
  const [yaRetenido, setYaRetenido] = useState(false);

  const results = useMemo(() => {
    if (premioBruto <= 0) return null;

    // Art. 306: En apuestas hípicas se resta el valor de la apuesta
    const baseGravable = tipoJuego === "apuesta_hipica"
      ? Math.max(0, premioBruto - valorApuesta)
      : premioBruto;

    const impuesto = baseGravable * LOTERIAS_RATE;
    const retencionCalculada = yaRetenido ? impuesto : 0;
    const saldoAPagar = Math.max(0, impuesto - retencionCalculada);

    const sujetoRetencion = premioBruto >= LOTERIAS_MIN_RETENCION;

    return {
      baseGravable,
      impuesto,
      retencionCalculada,
      saldoAPagar,
      sujetoRetencion
    };
  }, [premioBruto, tipoJuego, valorApuesta, yaRetenido]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-6 heading-serif text-3xl">Loterías, Rifas y Apuestas</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">Calcula el impuesto a las ganancias ocasionales sobre premios y sorteos.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 heading-serif text-lg">Datos del Premio</h2>
            <div className="space-y-4">
              <CurrencyInput id="premio" label="Valor Bruto del Premio" value={premioBruto} onChange={setPremioBruto} />

              <SelectInput
                id="tipo"
                label="Tipo de Juego"
                value={tipoJuego}
                onChange={setTipoJuego}
                options={[
                  { value: "loteria", label: "Lotería o Rifa" },
                  { value: "apuesta_hipica", label: "Apuesta Hípica" },
                  { value: "otra", label: "Otra Apuesta o Sorteo" }
                ]}
              />

              {tipoJuego === "apuesta_hipica" && (
                <CurrencyInput id="apuesta" label="Valor de la Apuesta" value={valorApuesta} onChange={setValorApuesta} />
              )}

              <div className="pt-2">
                <ToggleInput label="¿Ya le practicaron retención?" pressed={yaRetenido} onToggle={setYaRetenido} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
            <Info className="h-5 w-5 shrink-0 text-foreground/70" />
            <div>
              <p className="font-semibold">Retención en la fuente (Art. 317)</p>
              <p>Solo se practica retención si el premio es igual o superior a 48 UVT ({formatCOP(LOTERIAS_MIN_RETENCION)}).</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 heading-serif text-lg">Resultado</h2>
                <CalculatorResult items={[
                  { label: "Base Gravable", value: formatCOP(results.baseGravable) },
                  { label: "Impuesto (20%)", value: formatCOP(results.impuesto) },
                  { label: "Saldo a Pagar", value: formatCOP(results.saldoAPagar) },
                ]} />
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sujeto a retención:</span>
                    {results.sujetoRetencion ? (
                      <span className="inline-block rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background">SÍ</span>
                    ) : (
                      <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">NO</span>
                    )}
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground text-xs italic">
                      {tipoJuego === "apuesta_hipica" ? "Nota: Se restó el valor de la apuesta según Art. 306" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa el valor del premio para calcular el impuesto.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["304", "306", "317"]} />
      </div>
    </div>
  );
}
