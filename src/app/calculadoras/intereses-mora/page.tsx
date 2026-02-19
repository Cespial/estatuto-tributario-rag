"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Info } from "lucide-react";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { INTERES_MORA_RATES } from "@/config/tax-data-wave4";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

export default function InteresesMoraPage() {
  const [deuda, setDeuda] = useState(0);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  const calculo = useMemo(() => {
    if (!deuda || !fechaVencimiento || !fechaPago) return null;

    const inicio = new Date(fechaVencimiento);
    const fin = new Date(fechaPago);
    
    if (fin <= inicio) return { totalIntereses: 0, diasMora: 0, totalPagar: deuda, labelTasa: "N/A" };

    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diasMoraTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rateEntry = INTERES_MORA_RATES.find(r => {
      const d = new Date(r.desde);
      const h = new Date(r.hasta);
      return fin >= d && fin <= h;
    }) || INTERES_MORA_RATES[INTERES_MORA_RATES.length - 1];

    const tasaEA = rateEntry.tasaEA;
    const tasaDiaria = tasaEA / 365;
    const intereses = deuda * tasaDiaria * diasMoraTotal;

    return {
      totalIntereses: intereses,
      diasMora: diasMoraTotal,
      tasaAplicada: tasaEA,
      labelTasa: rateEntry.label,
      totalPagar: deuda + intereses
    };
  }, [deuda, fechaVencimiento, fechaPago]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="heading-serif text-3xl">Intereses Moratorios DIAN</h1>
        <p className="mb-10 text-base leading-relaxed text-muted-foreground">
          Calcula los intereses de mora para deudas tributarias nacionales (Art. 634 y 635 ET).
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <CurrencyInput
            id="deuda"
            label="Valor de la deuda principal"
            value={deuda}
            onChange={setDeuda}
            placeholder="Ej: 1.000.000"
          />

          <div className="grid gap-4">
            <label htmlFor="vencimiento" className="text-sm font-medium">Fecha de vencimiento</label>
            <input
              id="vencimiento"
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            <label htmlFor="pago" className="text-sm font-medium">Fecha de pago (proyectada)</label>
            <input
              id="pago"
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/50 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-foreground/70" />
              <div className="text-sm text-foreground">
                <p className="font-semibold">Nota sobre el cálculo:</p>
                <p>Esta calculadora aplica la tasa vigente a la fecha de pago sobre el total de días de mora, siguiendo la metodología de interés simple establecida en el Estatuto Tributario.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <CalculatorResult
                items={[
                  {
                    label: "Total Intereses de Mora",
                    value: formatCOP(calculo.totalIntereses),
                    sublabel: `Por ${calculo.diasMora} días de retraso`
                  }
                ]}
              />

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold tracking-tight">Resumen de Liquidación</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Capital:</span>
                    <span className="font-medium">{formatCOP(deuda)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Días de mora:</span>
                    <span className="font-medium">{calculo.diasMora}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tasa aplicada:</span>
                    <span className="font-medium">{calculo.labelTasa}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold">
                    <span>Total a pagar:</span>
                    <span className="text-foreground">{formatCOP(calculo.totalPagar)}</span>
                  </div>
                </div>
              </div>

              <CollapsibleSection title="Tasas Históricas 2025-2026">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2">Periodo</th>
                        <th className="pb-2 text-right">Tasa EA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INTERES_MORA_RATES.map((r, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 text-muted-foreground">{r.label}</td>
                          <td className="py-2 text-right font-medium">{(r.tasaEA * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CollapsibleSection>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Ingresa los datos para ver la liquidación de intereses
            </div>
          )}
        </div>
      </div>

      <CalculatorSources articles={["634", "635"]} />
    </div>
  );
}
