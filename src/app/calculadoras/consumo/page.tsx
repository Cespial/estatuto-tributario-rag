"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { SelectInput, CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { CONSUMO_TARIFAS } from "@/config/tax-data-wave4";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function ConsumoPage() {
  const [tipo, setTipo] = useState("restaurantes");
  const [valor, setValor] = useState(0);

  const calculo = useMemo(() => {
    if (!valor) return null;

    const selected = (CONSUMO_TARIFAS.find(t => t.tipo === tipo) || CONSUMO_TARIFAS[0]) as {
      tipo: string;
      label: string;
      tarifa: number;
      articulo: string;
      notas?: string;
    };
    const impuesto = valor * selected.tarifa;
    const total = valor + impuesto;

    return {
      selected,
      impuesto,
      total,
      tarifaLabel: (selected.tarifa * 100).toFixed(0) + "%"
    };
  }, [tipo, valor]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Impuesto Nacional al Consumo</h1>
        <p className="mt-2 mb-10 text-muted-foreground">
          Calcula el INC para servicios de restaurante, telefonía y vehículos (Art. 512-1 ET).
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <SelectInput
            id="tipo-consumo"
            label="Tipo de bien o servicio"
            value={tipo}
            onChange={setTipo}
            options={CONSUMO_TARIFAS.map(t => ({ value: t.tipo, label: t.label }))}
          />

          <CurrencyInput
            id="valor-base"
            label="Valor de la operación (Base)"
            value={valor}
            onChange={setValor}
            placeholder="Ej: 100.000"
          />

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-foreground/70" />
              Información de Tarifa
            </h4>
            {calculo?.selected && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong>Artículo:</strong> {calculo.selected.articulo} ET</p>
                <p><strong>Tarifa aplicable:</strong> {calculo.tarifaLabel}</p>
                {calculo.selected.notas && <p className="italic mt-2">{calculo.selected.notas}</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <CalculatorResult
                items={[
                  {
                    label: "Impuesto al Consumo",
                    value: formatCOP(calculo.impuesto),
                    sublabel: `Tarifa del ${calculo.tarifaLabel}`
                  }
                ]}
              />

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold tracking-tight">Resumen de Operación</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Base gravable:</span>
                    <span className="font-medium">{formatCOP(valor)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Impuesto ({calculo.tarifaLabel}):</span>
                    <span className="font-medium">{formatCOP(calculo.impuesto)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold text-foreground">
                    <span>Total a pagar:</span>
                    <span>{formatCOP(calculo.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Selecciona el tipo de operación e ingresa el valor base
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Hecho Generador</th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Tarifa</th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Art. ET</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {CONSUMO_TARIFAS.map((t, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">{t.label}</td>
                <td className="px-4 py-3 font-medium">{(t.tarifa * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-muted-foreground">{t.articulo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CalculatorSources articles={["512-1", "512-2", "512-3", "512-4"]} />
    </div>
  );
}
