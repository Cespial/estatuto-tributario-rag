"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { BENEFICIO_AUDITORIA } from "@/config/tax-data-wave4";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function AuditoriaPage() {
  const [impuestoActual, setImpuestoActual] = useState(0);
  const [impuestoAnterior, setImpuestoAnterior] = useState(0);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const impuestoMinimo = BENEFICIO_AUDITORIA.impuestoMinUVT * uvt;

  const calculo = useMemo(() => {
    if (!impuestoActual || !impuestoAnterior) return null;

    const incremento = (impuestoActual - impuestoAnterior) / impuestoAnterior;
    const cumpleMinimo = impuestoActual >= impuestoMinimo;
    
    let resultado = "";
    let status: "success" | "warning" | "error" = "error";
    let meses = 0;

    if (!cumpleMinimo) {
      resultado = `No aplica: El impuesto neto debe ser ≥ ${BENEFICIO_AUDITORIA.impuestoMinUVT} UVT (${formatCOP(impuestoMinimo)})`;
      status = "error";
    } else if (incremento >= BENEFICIO_AUDITORIA.incremento6Meses) {
      resultado = "¡Aplica firmeza en 6 meses!";
      status = "success";
      meses = 6;
    } else if (incremento >= BENEFICIO_AUDITORIA.incremento12Meses) {
      resultado = "Aplica firmeza en 12 meses";
      status = "success";
      meses = 12;
    } else {
      resultado = `No aplica: El incremento fue del ${(incremento * 100).toFixed(2)}% (mínimo ${BENEFICIO_AUDITORIA.incremento12Meses * 100}%)`;
      status = "warning";
    }

    return {
      incremento,
      cumpleMinimo,
      resultado,
      status,
      meses,
      diferencia: impuestoActual - impuestoAnterior
    };
  }, [impuestoActual, impuestoAnterior, impuestoMinimo]);

  return (
    <div className="container max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Beneficio de Auditoría</h1>
        <p className="text-muted-foreground">
          Verifica si tu declaración de renta puede quedar en firme en 6 o 12 meses (Art. 689-3 ET).
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <CurrencyInput
            id="impuesto-actual"
            label="Impuesto neto de renta (Año Actual)"
            value={impuestoActual}
            onChange={setImpuestoActual}
            placeholder="Ej: 15.000.000"
          />

          <CurrencyInput
            id="impuesto-anterior"
            label="Impuesto neto de renta (Año Anterior)"
            value={impuestoAnterior}
            onChange={setImpuestoAnterior}
            placeholder="Ej: 10.000.000"
          />

          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <h4 className="mb-2 font-semibold">Requisitos Clave:</h4>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Impuesto neto ≥ 71 UVT ({formatCOP(impuestoMinimo)})</li>
              <li>Incremento ≥ 35% para firmeza de 6 meses</li>
              <li>Incremento ≥ 25% para firmeza de 12 meses</li>
              <li>Presentación y pago oportuno</li>
            </ul>
          </div>
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <div className={`rounded-xl border p-6 shadow-sm ${
                calculo.status === "success" ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20" : 
                calculo.status === "warning" ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20" :
                "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {calculo.status === "success" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  )}
                  <h3 className={`text-lg font-bold ${
                    calculo.status === "success" ? "text-green-800 dark:text-green-400" : 
                    calculo.status === "warning" ? "text-amber-800 dark:text-amber-400" :
                    "text-red-800 dark:text-red-400"
                  }`}>
                    {calculo.resultado}
                  </h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Incremento real:</span>
                    <span className="font-bold">{(calculo.incremento * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Impuesto en UVT:</span>
                    <span className="font-bold">{(impuestoActual / uvt).toFixed(1)} UVT</span>
                  </div>
                </div>
              </div>

              <CalculatorResult
                items={[
                  { 
                    label: "Incremento del Impuesto", 
                    value: formatCOP(calculo.diferencia),
                    sublabel: "Sobre el año anterior"
                  }
                ]}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              Ingresa los valores de los impuestos para validar el beneficio
            </div>
          )}
        </div>
      </div>

      <CalculatorSources articles={["689-3"]} />
    </div>
  );
}
