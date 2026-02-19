"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Globe } from "lucide-react";
import { TOPES_DECLARAR_RENTA_AG2025 } from "@/config/tax-data-corporativo";
import { CurrencyInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function DeboDeclararPage() {
  const [esResidente, setEsResidente] = useState(true);
  const [patrimonioBruto, setPatrimonioBruto] = useState(0);
  const [ingresosBrutos, setIngresosBrutos] = useState(0);
  const [consumosTarjeta, setConsumosTarjeta] = useState(0);
  const [compras, setCompras] = useState(0);
  const [consignaciones, setConsignaciones] = useState(0);

  const uvtAG = TOPES_DECLARAR_RENTA_AG2025.uvtAnoGravable;

  const thresholds = useMemo(() => ({
    patrimonio: TOPES_DECLARAR_RENTA_AG2025.patrimonioBrutoUVT * uvtAG,
    ingresos: TOPES_DECLARAR_RENTA_AG2025.ingresosBrutosUVT * uvtAG,
    consumos: TOPES_DECLARAR_RENTA_AG2025.consumosTarjetaUVT * uvtAG,
    compras: TOPES_DECLARAR_RENTA_AG2025.comprasTotalesUVT * uvtAG,
    consignaciones: TOPES_DECLARAR_RENTA_AG2025.consignacionesUVT * uvtAG,
  }), [uvtAG]);

  const evaluation = useMemo(() => {
    const exceeds = {
      patrimonio: patrimonioBruto > thresholds.patrimonio,
      ingresos: ingresosBrutos > thresholds.ingresos,
      consumos: consumosTarjeta > thresholds.consumos,
      compras: compras > thresholds.compras,
      consignaciones: consignaciones > thresholds.consignaciones,
    };

    // Si NO es residente, las reglas cambian (Art 9, 10 ET).
    // Para simplificar el "Debo Declarar" rapido, marcamos obligacion si hay ingresos fuente nacional sin retencion total.
    const debeDeclarar = !esResidente || Object.values(exceeds).some(v => v);

    return { exceeds, debeDeclarar };
  }, [patrimonioBruto, ingresosBrutos, consumosTarjeta, compras, consignaciones, thresholds, esResidente]);

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">¿Debo Declarar Renta 2025? (PN)</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Basado en los topes del Art. 592, 593 y 594-3 del ET para el año gravable 2025.
      </p>

      {/* Paso 0: Residencia */}
      <div className="mb-8 rounded-lg border border-border/60 bg-muted/50 p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Globe className="h-5 w-5 text-foreground/70" />
          <span>Paso 0: Residencia Fiscal</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">¿Permanecio en Colombia mas de 183 dias en 2025?</p>
          <ToggleInput
            label={esResidente ? "SI (Residente)" : "NO (No Residente)"}
            pressed={esResidente}
            onToggle={setEsResidente}
          />
        </div>
        {!esResidente && (
          <p className="mt-3 text-xs text-foreground bg-muted/50 border border-border/60 rounded-lg p-4">
            * Los no residentes estan obligados a declarar si sus ingresos de fuente nacional no estuvieron sujetos a la retencion total del Art. 407 a 411.
          </p>
        )}
      </div>

      <div className="mb-8 space-y-4">
        <CurrencyInput id="patrimonio" label="Patrimonio bruto a 31 dic 2025" value={patrimonioBruto} onChange={setPatrimonioBruto} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencyInput id="ingresos" label="Ingresos brutos 2025" value={ingresosBrutos} onChange={setIngresosBrutos} />
          <CurrencyInput id="consignaciones" label="Consignaciones bancarias 2025" value={consignaciones} onChange={setConsignaciones} />
          <CurrencyInput id="consumos-tarjeta" label="Consumos tarjeta de credito 2025" value={consumosTarjeta} onChange={setConsumosTarjeta} />
          <CurrencyInput id="compras" label="Compras y consumos totales 2025" value={compras} onChange={setCompras} />
        </div>
      </div>

      <div className={`mb-8 flex items-center gap-4 rounded-lg border p-6 ${evaluation.debeDeclarar
        ? "bg-muted/50 border-border/60"
        : "bg-muted/50 border-border/60"}`}>
        {evaluation.debeDeclarar ? (
          <>
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-bold text-foreground">ESTA OBLIGADO a declarar renta 2025</h2>
              <p className="text-sm text-muted-foreground">
                {!esResidente ? "Por ser No Residente (sujeto a validacion de retenciones)" : "Su situacion fiscal supera uno o mas topes."}
              </p>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-10 w-10 text-foreground" />
            <div>
              <h2 className="text-xl font-bold text-foreground">No esta obligado a declarar renta 2025</h2>
              <p className="text-sm text-muted-foreground">Sus valores se encuentran por debajo de los topes legales.</p>
            </div>
          </>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold tracking-tight">Tabla de verificacion (UVT $49,799)</h3>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Concepto</th>
                <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Tope ($)</th>
                <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Su valor</th>
                <th className="px-4 py-2 text-center text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Supera?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Patrimonio Bruto (4,500 UVT)", limit: thresholds.patrimonio, value: patrimonioBruto, exceeds: evaluation.exceeds.patrimonio },
                { label: "Ingresos Brutos (1,400 UVT)", limit: thresholds.ingresos, value: ingresosBrutos, exceeds: evaluation.exceeds.ingresos },
                { label: "Consignaciones (1,400 UVT)", limit: thresholds.consignaciones, value: consignaciones, exceeds: evaluation.exceeds.consignaciones },
                { label: "Consumos Tarjeta (1,400 UVT)", limit: thresholds.consumos, value: consumosTarjeta, exceeds: evaluation.exceeds.consumos },
                { label: "Compras y Consumos (1,400 UVT)", limit: thresholds.compras, value: compras, exceeds: evaluation.exceeds.compras },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-border last:border-0 ${row.exceeds ? "bg-muted/30" : ""}`}>
                  <td className="px-4 py-2 font-medium">{row.label}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{formatCOP(row.limit)}</td>
                  <td className="px-4 py-2 text-right">{formatCOP(row.value)}</td>
                  <td className="px-4 py-2 text-center">
                    {row.exceeds ? (
                      <span className="inline-block rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background">SI</span>
                    ) : (
                      <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CalculatorSources articles={["9", "10", "592", "594-3"]} />
    </>
  );
}
