"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Table as TableIcon } from "lucide-react";
import { SelectInput, CurrencyInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { CalculatorBreadcrumb } from "@/components/calculators/calculator-breadcrumb";
import { CalculatorActions } from "@/components/calculators/calculator-actions";
import { CalculatorDisclaimer } from "@/components/calculators/calculator-disclaimer";
import { RelatedCalculators } from "@/components/calculators/related-calculators";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { formatCOP } from "@/lib/calculators/format";
import {
  buildShareUrl,
  readNumberParam,
  readStringParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";
import { DEPRECIACION_TASAS } from "@/config/tax-data-wave4";

function DepreciacionPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    return {
      tipo: readStringParam(searchParams, "t", "maquinaria"),
      costo: readNumberParam(searchParams, "c", 0, { min: 0 }),
      valorResidual: readNumberParam(searchParams, "r", 0, { min: 0 }),
      metodo: readStringParam(searchParams, "m", "linea_recta"),
    };
  }, [searchParams]);

  const [tipo, setTipo] = useState(initialValues.tipo);
  const [costo, setCosto] = useState(initialValues.costo);
  const [valorResidual, setValorResidual] = useState(initialValues.valorResidual);
  const [metodo, setMetodo] = useState(initialValues.metodo);

  const { contentRef, handlePrint } = usePrintExport({ title: "Depreciacion Fiscal" });

  useEffect(() => {
    trackCalculatorUsage("depreciacion");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      t: tipo,
      c: costo,
      r: valorResidual,
      m: metodo,
    });
  }, [tipo, costo, valorResidual, metodo]);

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
      // Reduccion de saldos (Doble cuota sobre saldo decreciente generalmente, pero aqui usaremos tasa fiscal maxima como base?)
      // El codigo original usaba `selectedType.tasaMax` como factor de depreciacion.
      // Tasa fiscal maxima es el limite lineal (e.g. 10% anual).
      // Reduccion de saldos suele ser mas acelerada.
      // Asumiremos que el usuario quiere usar la tasa maxima permitida aplicada al saldo.
      
      const tasa = selectedType.tasaMax; 
      let saldo = baseDepreciable;
      depAnualBase = baseDepreciable * tasa; // Primer ano (referencial)

      for (let i = 1; i <= vidaUtil; i++) {
        const dep = saldo * tasa;
        // En reduccion de saldos a veces se cambia a linea recta al final, aqui simplificado.
        // Ademas la vida util fiscal limita la tasa anual.
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

  const shareUrl = buildShareUrl("/calculadoras/depreciacion", {
    t: tipo,
    c: costo,
    r: valorResidual,
    m: metodo,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Depreciacion Fiscal" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Depreciacion Fiscal</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula la alicuota de depreciacion y genera la tabla de amortizacion segun limites del Art. 137 ET.
      </p>

      <CalculatorActions
        title="Depreciacion Fiscal"
        shareText="Consulta esta tabla de depreciacion"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 md:grid-cols-2 mb-6">
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
            label="Costo de adquisicion"
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
            label="Metodo de depreciacion"
            value={metodo}
            onChange={setMetodo}
            options={[
              { value: "linea_recta", label: "Linea Recta" },
              { value: "reduccion_saldos", label: "Reduccion de Saldos" }
            ]}
          />
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <CalculatorResult
                items={[
                  {
                    label: "Depreciacion Ano 1",
                    value: formatCOP(calculo.tabla[0].depAnual),
                    sublabel: `Vida util: ${calculo.vidaUtil} anos | Tasa fiscal max: ${(calculo.tasaFiscal * 100).toFixed(2)}%`
                  }
                ]}
              />

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm overflow-hidden">
                <div className="mb-4 flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-foreground/70" />
                  <h3 className="font-semibold tracking-tight text-foreground">Tabla de Amortizacion</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b border-border/60">
                        <th className="pb-2 font-medium text-muted-foreground">Ano</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">Dep. Anual</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">V. Libros</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {calculo.tabla.map((fila, i) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="py-2 font-medium text-foreground">{fila.anio}</td>
                          <td className="py-2 text-right text-muted-foreground">{formatCOP(fila.depAnual)}</td>
                          <td className="py-2 text-right font-mono text-foreground">{formatCOP(fila.libros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              Ingresa los datos del activo para generar la tabla de depreciacion.
            </div>
          )}
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "128", reason: "Deduccion por depreciacion." },
          { id: "131", reason: "Base para calcular la depreciacion." },
          { id: "137", reason: "Limitacion a la deduccion por depreciacion." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 128 ET", "Art. 131 ET", "Art. 137 ET"]}
      />

      <RelatedCalculators currentId="depreciacion" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Tabla de Depreciacion Fiscal"
            subtitle={`Activo: ${calculo?.selectedType.label} | Metodo: ${metodo === "linea_recta" ? "Linea Recta" : "Reduccion de Saldos"}`}
          >
            {calculo && (
              <div className="space-y-2 text-sm">
                <p>Costo adquisicion: {formatCOP(costo)}</p>
                <p>Valor residual: {formatCOP(valorResidual)}</p>
                <p>Vida util: {calculo.vidaUtil} anos</p>
                <p>Depreciacion acumulada final: {formatCOP(calculo.tabla[calculo.tabla.length - 1].acumulada)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function DepreciacionPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <DepreciacionPageContent />
    </Suspense>
  );
}
