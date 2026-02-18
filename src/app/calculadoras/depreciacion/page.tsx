"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Table as TableIcon } from "lucide-react";
import { SelectInput, CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { DEPRECIACION_TASAS } from "@/config/tax-data-wave4";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function DepreciacionPage() {
  const [tipo, setTipo] = useState("maquinaria");
  const [costo, setCosto] = useState(0);
  const [valorResidual, setValorResidual] = useState(0);
  const [metodo, setMetodo] = useState("linea_recta");

  const calculo = useMemo(() => {
    if (!costo) return null;

    const selectedType = DEPRECIACION_TASAS.find(t => t.tipo === tipo) || DEPRECIACION_TASAS[1];
    const baseDepreciable = Math.max(0, costo - valorResidual);
    const vidaUtil = selectedType.vidaUtil;
    const tabla = [];

    let depAnualBase = 0;

    if (metodo === "linea_recta") {
      depAnualBase = baseDepreciable / vidaUtil;
      for (let i = 1; i <= vidaUtil; i++) {
        const acumulada = depAnualBase * i;
        const libros = costo - acumulada;
        tabla.push({
          anio: i,
          depAnual: depAnualBase,
          acumulada: Math.min(acumulada, baseDepreciable),
          libros: Math.max(libros, valorResidual)
        });
      }
    } else {
      // Reduccion de saldos
      const tasa = selectedType.tasaMax;
      let saldo = baseDepreciable;
      depAnualBase = baseDepreciable * tasa; // Primer año
      
      for (let i = 1; i <= vidaUtil; i++) {
        const dep = saldo * tasa;
        saldo -= dep;
        const acumulada = baseDepreciable - saldo;
        tabla.push({
          anio: i,
          depAnual: dep,
          acumulada: Math.min(acumulada, baseDepreciable),
          libros: Math.max(costo - acumulada, valorResidual)
        });
      }
    }

    return {
      selectedType,
      depAnual: depAnualBase,
      vidaUtil,
      tabla,
      tasaFiscal: selectedType.tasaMax
    };
  }, [tipo, costo, valorResidual, metodo]);

  return (
    <div className="container max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Depreciación Fiscal</h1>
        <p className="text-muted-foreground">
          Calcula la alícuota de depreciación según los límites máximos del Art. 137 ET.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <SelectInput
            id="tipo-activo"
            label="Tipo de activo"
            value={tipo}
            onChange={setTipo}
            options={DEPRECIACION_TASAS.map(t => ({ value: t.tipo, label: t.label }))}
          />

          <CurrencyInput
            id="costo-adquisicion"
            label="Costo de adquisición"
            value={costo}
            onChange={setCosto}
            placeholder="Ej: 50.000.000"
          />

          <CurrencyInput
            id="valor-residual"
            label="Valor residual (Salvamento)"
            value={valorResidual}
            onChange={setValorResidual}
            placeholder="Ej: 5.000.000"
          />

          <SelectInput
            id="metodo-depreciacion"
            label="Método de depreciación"
            value={metodo}
            onChange={setMetodo}
            options={[
              { value: "linea_recta", label: "Línea Recta" },
              { value: "reduccion_saldos", label: "Reducción de Saldos" }
            ]}
          />
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <CalculatorResult
                items={[
                  {
                    label: "Depreciación Año 1",
                    value: formatCOP(calculo.depAnual),
                    sublabel: `Vida útil: ${calculo.vidaUtil} años | Tasa fiscal máx: ${(calculo.tasaFiscal * 100).toFixed(2)}%`
                  }
                ]}
              />

              <div className="rounded-xl border bg-card p-6 shadow-sm overflow-hidden">
                <div className="mb-4 flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Tabla de Amortización</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b">
                        <th className="pb-2">Año</th>
                        <th className="pb-2 text-right">Dep. Anual</th>
                        <th className="pb-2 text-right">V. Libros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculo.tabla.map((fila, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 font-medium">{fila.anio}</td>
                          <td className="py-2 text-right">{formatCOP(fila.depAnual)}</td>
                          <td className="py-2 text-right font-mono">{formatCOP(fila.libros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              Ingresa los datos del activo para generar la tabla de depreciación
            </div>
          )}
        </div>
      </div>

      <CalculatorSources articles={["128", "131", "137"]} />
    </div>
  );
}
