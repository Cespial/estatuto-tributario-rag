"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, X, Info } from "lucide-react";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { trackEvent } from "@/lib/telemetry/events";

interface QuickCalculatorProps {
  concepto: string;
  tarifa: number;
  baseMinUVT: number;
  uvtValue: number;
  linkCalculadora?: string;
}

export function QuickCalculator({
  concepto,
  tarifa,
  baseMinUVT,
  uvtValue,
  linkCalculadora = "/calculadoras/retencion",
}: QuickCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentValue, setPaymentValue] = useState(0);
  const [isIvaIncluded, setIsIvaIncluded] = useState(false);
  const [ivaValue, setIvaValue] = useState(0);
  const [excludedBase, setExcludedBase] = useState(0);

  const baseMinPesos = baseMinUVT * uvtValue;
  const grossBase = Math.max(0, paymentValue - excludedBase);
  const taxableBase = Math.max(0, grossBase - (isIvaIncluded ? ivaValue : 0));
  const isBaseSufficient = taxableBase >= baseMinPesos;
  const retencion = isBaseSufficient ? taxableBase * tarifa : 0;
  const netToPay = paymentValue - retencion;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        title="Calcular retención rápida"
      >
        <Calculator className="h-3 w-3" />
        Calcular
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="heading-serif text-lg">Calculadora Rápida</h3>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-foreground">{concepto}</p>
          <p className="text-xs text-muted-foreground">
            Tarifa: {(tarifa * 100).toFixed(2)}% | Base Mínima: {formatCurrency(baseMinPesos)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <CurrencyInput
              id="base-calc"
              label="Valor total del pago"
              value={paymentValue}
              onChange={setPaymentValue}
              placeholder="Ingrese el valor del pago"
            />
          </div>

          <div>
            <CurrencyInput
              id="base-excluida"
              label="Base no sujeta (opcional)"
              value={excludedBase}
              onChange={setExcludedBase}
              placeholder="Valores excluidos de retención"
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isIvaIncluded}
                onChange={(e) => setIsIvaIncluded(e.target.checked)}
              />
              El pago incluye IVA
            </label>
            {isIvaIncluded && (
              <div className="mt-3">
                <CurrencyInput
                  id="iva-calc"
                  label="Valor del IVA"
                  value={ivaValue}
                  onChange={setIvaValue}
                  placeholder="Ingrese el IVA incluido"
                />
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="mb-2 grid gap-1 text-xs text-muted-foreground">
              <p>Base depurada: {formatCurrency(taxableBase)}</p>
              <p>Tarifa aplicada: {(tarifa * 100).toFixed(2)}%</p>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(retencion)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Neto estimado a pagar: {formatCurrency(netToPay)}
            </p>
            {!isBaseSufficient && paymentValue > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                * La base es inferior al mínimo ({formatCurrency(baseMinPesos)})
              </p>
            )}
          </div>

          <div className="rounded-md border border-border/60 bg-card p-3 text-xs text-muted-foreground">
            <p className="mb-1 inline-flex items-center gap-1 text-foreground/80">
              <Info className="h-3.5 w-3.5" />
              Resultado estimado para referencia operativa.
            </p>
            <p>Valide excepciones y convenios aplicables antes de practicar la retención.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link
            href={linkCalculadora}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            onClick={() => {
              trackEvent("retencion_calculated", {
                concepto,
                paymentValue,
                taxableBase,
                retencion,
                source: "quick-calculator",
              });
              setIsOpen(false);
            }}
          >
            Calculadora completa
          </Link>
          <button
            onClick={() => {
              trackEvent("retencion_calculated", {
                concepto,
                paymentValue,
                taxableBase,
                retencion,
                source: "quick-calculator",
              });
              setIsOpen(false);
            }}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
