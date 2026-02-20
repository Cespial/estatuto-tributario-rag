"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import {
  CurrencyInput,
  NumberInput,
  ToggleInput,
} from "@/components/calculators/shared-inputs";
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
  readBooleanParam,
  readNumberParam,
  replaceUrlQuery,
} from "@/lib/calculators/url-state";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

function SancionesPageContent() {
  const searchParams = useSearchParams();
  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const sancionMinima = 10 * uvt;

  const initialValues = useMemo(() => {
    return {
      impuesto: readNumberParam(searchParams, "imp", 0, { min: 0 }),
      meses: readNumberParam(searchParams, "meses", 0, { min: 0 }),
      emplazamiento: readBooleanParam(searchParams, "emp", false),
      primeraInfraccion: readBooleanParam(searchParams, "red", false),
      ingresoBruto: readNumberParam(searchParams, "ing", 0, { min: 0 }),
      patrimonioLiquido: readNumberParam(searchParams, "pat", 0, { min: 0 }),
    };
  }, [searchParams]);

  const [impuesto, setImpuesto] = useState(initialValues.impuesto);
  const [meses, setMeses] = useState(initialValues.meses);
  const [emplazamiento, setEmplazamiento] = useState(initialValues.emplazamiento);
  const [primeraInfraccion, setPrimeraInfraccion] = useState(initialValues.primeraInfraccion);
  const [ingresoBruto, setIngresoBruto] = useState(initialValues.ingresoBruto);
  const [patrimonioLiquido, setPatrimonioLiquido] = useState(initialValues.patrimonioLiquido);

  const { contentRef, handlePrint } = usePrintExport({ title: "Sancion por Extemporaneidad" });

  useEffect(() => {
    trackCalculatorUsage("sanciones");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      imp: impuesto,
      meses,
      emp: emplazamiento,
      red: primeraInfraccion,
      ing: ingresoBruto,
      pat: patrimonioLiquido,
    });
  }, [impuesto, meses, emplazamiento, primeraInfraccion, ingresoBruto, patrimonioLiquido]);

  const result = useMemo(() => {
    if (meses <= 0) return null;

    const tasaPorMes = emplazamiento ? 0.10 : 0.05;
    let sancionBruta: number;
    let tope: number;

    if (impuesto > 0) {
      // Art. 641/642: sancion = impuesto * tasa * meses
      sancionBruta = impuesto * tasaPorMes * meses;
      tope = emplazamiento ? impuesto * 2 : impuesto;
    } else {
      // Cuando impuesto = 0: base es 0.5% ingresos brutos o 1% patrimonio liquido (el mayor)
      const baseIngreso = ingresoBruto * 0.005 * meses;
      const basePatrimonio = patrimonioLiquido * 0.01 * meses;
      sancionBruta = Math.max(baseIngreso, basePatrimonio);
      
      const topeIngreso = emplazamiento ? ingresoBruto * 0.10 : ingresoBruto * 0.05;
      const topePatrimonio = emplazamiento ? patrimonioLiquido * 0.20 : patrimonioLiquido * 0.10;
      tope = Math.max(topeIngreso, topePatrimonio);
    }

    // Aplicar tope
    const sancionConTope = Math.min(sancionBruta, tope || Infinity);

    // Reduccion Art. 640: primera infraccion en 2 anos = 50%
    const reduccion = primeraInfraccion ? 0.5 : 1;
    const sancionReducida = sancionConTope * reduccion;

    // Minimo 10 UVT
    const sancionFinal = Math.max(sancionReducida, sancionMinima);

    return {
      sancionBruta,
      tope,
      sancionConTope,
      reduccion: primeraInfraccion,
      sancionReducida,
      sancionFinal,
    };
  }, [impuesto, meses, emplazamiento, primeraInfraccion, ingresoBruto, patrimonioLiquido, sancionMinima]);

  const resultItems = useMemo(() => {
    if (!result) return [];
    return [
      { label: "Sancion calculada", value: formatCOP(result.sancionBruta) },
      ...(result.tope > 0 ? [{ label: "Tope aplicable", value: formatCOP(result.tope) }] : []),
      ...(result.reduccion
        ? [{ label: "Reduccion 50% (Art. 640)", value: formatCOP(result.sancionReducida) }]
        : []),
      { label: `Sancion minima (10 UVT)`, value: formatCOP(sancionMinima) },
      { label: "Sancion final", value: formatCOP(result.sancionFinal) },
    ];
  }, [result, sancionMinima]);

  const shareUrl = buildShareUrl("/calculadoras/sanciones", {
    imp: impuesto,
    meses,
    emp: emplazamiento,
    red: primeraInfraccion,
    ing: ingresoBruto,
    pat: patrimonioLiquido,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Sancion por Extemporaneidad" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Sancion por Extemporaneidad</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calcula la sancion por declarar fuera de plazo (Art. 641 y 642 ET). Incluye sancion minima y reducciones.
      </p>

      <CalculatorActions
        title="Sancion Extemporaneidad"
        shareText="Consulta este calculo de sancion tributaria"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="mb-6 space-y-4">
        <CurrencyInput
          id="sancion-impuesto"
          label="Impuesto a cargo"
          value={impuesto}
          onChange={setImpuesto}
          placeholder="Ej: 2.000.000"
        />
        <NumberInput
          id="sancion-meses"
          label="Meses o fraccion de retraso"
          value={meses}
          onChange={setMeses}
          min={0}
          max={120}
          placeholder="Ej: 3"
        />

        {impuesto === 0 && (
          <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-4">
            <p className="text-sm font-medium">Bases alternativas (cuando no hay impuesto a cargo)</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CurrencyInput
                id="sancion-ingreso"
                label="Ingresos brutos del periodo"
                value={ingresoBruto}
                onChange={setIngresoBruto}
              />
              <CurrencyInput
                id="sancion-patrimonio"
                label="Patrimonio liquido ano anterior"
                value={patrimonioLiquido}
                onChange={setPatrimonioLiquido}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2">
          <ToggleInput
            label="Emplazamiento previo (Art. 642)"
            helperText="Duplica las tarifas y topes sancionatorios."
            pressed={emplazamiento}
            onToggle={setEmplazamiento}
          />
          <ToggleInput
            label="Primera infraccion en 2 anos (Art. 640)"
            helperText="Aplica reduccion del 50%."
            pressed={primeraInfraccion}
            onToggle={setPrimeraInfraccion}
          />
        </div>
      </div>

      {resultItems.length > 0 ? (
        <div className="mb-6">
          <CalculatorResult items={resultItems} />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Ingresa el impuesto a cargo y los meses de retraso.</p>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold tracking-tight">Reglas de Juego</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li><strong>Sin emplazamiento (Art. 641):</strong> 5% del impuesto por mes, tope 100%.</li>
          <li><strong>Con emplazamiento (Art. 642):</strong> 10% del impuesto por mes, tope 200%.</li>
          <li><strong>Sin impuesto:</strong> Se liquida sobre ingresos (0.5%) o patrimonio (1%).</li>
          <li><strong>Minima:</strong> Nunca inferior a {formatCOP(sancionMinima)} (10 UVT).</li>
        </ul>
      </div>

      <CalculatorSources
        articles={[
          { id: "641", reason: "Extemporaneidad antes de emplazamiento." },
          { id: "642", reason: "Extemporaneidad despues de emplazamiento." },
          { id: "640", reason: "Gradualidad y reduccion de sanciones." },
        ]}
      />

      <CalculatorDisclaimer
        references={["Art. 641 ET", "Art. 642 ET", "Art. 640 ET"]}
      />

      <RelatedCalculators currentId="sanciones" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper
            title="Sancion por Extemporaneidad"
            subtitle={`Retraso: ${meses} meses | Emplazamiento: ${emplazamiento ? "Si" : "No"}`}
          >
            {meses > 0 && (
              <div className="space-y-2 text-sm">
                <p>Impuesto a cargo: {formatCOP(impuesto)}</p>
                <p>Sancion bruta: {formatCOP(result?.sancionBruta ?? 0)}</p>
                <p>Reduccion aplicada: {primeraInfraccion ? "50%" : "0%"}</p>
                <p>Sancion final: {formatCOP(result?.sancionFinal ?? 0)}</p>
              </div>
            )}
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

export default function SancionesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <SancionesPageContent />
    </Suspense>
  );
}
