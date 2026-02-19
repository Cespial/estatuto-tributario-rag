"use client";

import { useState } from "react";
import { Calculator, X } from "lucide-react";
import { CurrencyInput } from "@/components/calculators/shared-inputs";

interface QuickCalculatorProps {
  concepto: string;
  tarifa: number;
  baseMinUVT: number;
  uvtValue: number;
}

export function QuickCalculator({ concepto, tarifa, baseMinUVT, uvtValue }: QuickCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [base, setBase] = useState(0);

  const baseMinPesos = baseMinUVT * uvtValue;
  const isBaseSufficient = base >= baseMinPesos;
  const retencion = isBaseSufficient ? base * tarifa : 0;

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
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold tracking-tight">Calculadora Rápida</h3>
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
              label="Base del Pago"
              value={base}
              onChange={setBase}
              placeholder="Ingrese el valor del pago"
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Retención a practicar:</span>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(retencion)}
            </div>
            {!isBaseSufficient && base > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                * La base es inferior al mínimo ({formatCurrency(baseMinPesos)})
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
