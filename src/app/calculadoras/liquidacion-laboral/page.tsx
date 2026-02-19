"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Info } from "lucide-react";
import {
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
} from "@/config/tax-data";
import {
  INDEMNIZACION_INDEFINIDO,
  INDEMNIZACION_FIJO_MIN_DIAS,
  INTERES_CESANTIAS_RATE
} from "@/config/tax-data-laboral";
import { CurrencyInput, SelectInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { DateInput } from "@/components/calculators/date-input";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Inclusive
}

function diasEnSemestre(fechaInicio: string, fechaFin: string): number {
  if (!fechaInicio || !fechaFin) return 0;
  const fin = new Date(fechaFin);
  if (isNaN(fin.getTime())) return 0;
  const mes = fin.getMonth(); // 0-11
  const inicioSem = mes < 6
    ? new Date(fin.getFullYear(), 0, 1)
    : new Date(fin.getFullYear(), 6, 1);
  const inicio = new Date(fechaInicio);
  const start = inicio > inicioSem ? inicio : inicioSem;
  return Math.max(0, daysBetween(start.toISOString().split("T")[0], fechaFin));
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

export default function LiquidacionLaboralPage() {
  const [fechaInicio, setFechaInicio] = useState("2025-01-01");
  const [fechaTerminacion, setFechaTerminacion] = useState("2026-02-17");
  const [salario, setSalario] = useState(3000000);
  const [tipoContrato, setTipoContrato] = useState("indefinido");
  const [motivoTerminacion, setMotivoTerminacion] = useState("renuncia");
  const [fechaFinFijo, setFechaFinFijo] = useState("2026-12-31");

  const results = useMemo(() => {
    const smlmv = SMLMV_2026;
    const auxilio = salario <= 2 * smlmv ? AUXILIO_TRANSPORTE_2026 : 0;
    const baseCesantiasPrima = salario + auxilio;
    const baseVacaciones = salario;

    const diasTrabajados = daysBetween(fechaInicio, fechaTerminacion);
    const diasSemestre = diasEnSemestre(fechaInicio, fechaTerminacion);

    const cesantias = (baseCesantiasPrima * diasTrabajados) / 360;
    const interesesCesantias = (cesantias * diasTrabajados * INTERES_CESANTIAS_RATE) / 360;
    const prima = (baseCesantiasPrima * diasSemestre) / 360;
    const vacaciones = (baseVacaciones * diasTrabajados) / 720;

    let indemnizacion = 0;
    let applyIndem = false;

    if (motivoTerminacion === "despido_sin_justa") {
      applyIndem = true;
      const anosServicio = diasTrabajados / 360;
      if (tipoContrato === "indefinido") {
        if (salario < INDEMNIZACION_INDEFINIDO.umbralSMLMV * smlmv) {
          indemnizacion = (salario / 30) * INDEMNIZACION_INDEFINIDO.bajo.primerAno;
          if (anosServicio > 1) {
            const anosAdicionales = anosServicio - 1;
            indemnizacion += (salario / 30) * INDEMNIZACION_INDEFINIDO.bajo.adicionalPorAno * anosAdicionales;
          }
        } else {
          indemnizacion = (salario / 30) * INDEMNIZACION_INDEFINIDO.alto.primerAno;
          if (anosServicio > 1) {
            const anosAdicionales = anosServicio - 1;
            indemnizacion += (salario / 30) * INDEMNIZACION_INDEFINIDO.alto.adicionalPorAno * anosAdicionales;
          }
        }
      } else if (tipoContrato === "fijo") {
        const diasRestantes = Math.max(daysBetween(fechaTerminacion, fechaFinFijo) - 1, 0);
        indemnizacion = Math.max((salario / 30) * diasRestantes, (salario / 30) * INDEMNIZACION_FIJO_MIN_DIAS);
      } else if (tipoContrato === "obra_labor") {
        // Obra o labor: similar to fixed, min 15 days
        indemnizacion = (salario / 30) * INDEMNIZACION_FIJO_MIN_DIAS;
      }
    }

    const totalLiquidacion = cesantias + interesesCesantias + prima + vacaciones + indemnizacion;

    return {
      diasTrabajados,
      baseCesantiasPrima,
      auxilio,
      cesantias,
      interesesCesantias,
      prima,
      vacaciones,
      indemnizacion,
      totalLiquidacion,
      applyIndem,
      diasSemestre,
      baseVacaciones
    };
  }, [fechaInicio, fechaTerminacion, salario, tipoContrato, motivoTerminacion, fechaFinFijo]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a calculadoras
        </Link>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Liquidación de Contrato Laboral</h1>
        <p className="mt-2 text-muted-foreground">Calcula prestaciones sociales e indemnizaciones según la ley colombiana para 2026.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <DateInput id="inicio" label="Fecha de inicio" value={fechaInicio} onChange={setFechaInicio} />
          <DateInput id="terminacion" label="Fecha de terminación" value={fechaTerminacion} onChange={setFechaTerminacion} />
          <CurrencyInput id="salario" label="Salario mensual básico" value={salario} onChange={setSalario} />

          <SelectInput
            id="tipoContrato"
            label="Tipo de contrato"
            value={tipoContrato}
            onChange={setTipoContrato}
            options={[
              { value: "indefinido", label: "Término Indefinido" },
              { value: "fijo", label: "Término Fijo" },
              { value: "obra_labor", label: "Obra o Labor" },
            ]}
          />

          {tipoContrato === "fijo" && (
            <DateInput id="finFijo" label="Fecha fin pactada (Contrato Fijo)" value={fechaFinFijo} onChange={setFechaFinFijo} />
          )}

          <SelectInput
            id="motivo"
            label="Motivo de terminación"
            value={motivoTerminacion}
            onChange={setMotivoTerminacion}
            options={[
              { value: "renuncia", label: "Renuncia voluntaria" },
              { value: "mutuo_acuerdo", label: "Mutuo acuerdo" },
              { value: "despido_sin_justa", label: "Despido sin justa causa" },
              { value: "despido_con_justa", label: "Despido con justa causa" },
              { value: "fin_termino", label: "Fin de término / obra" },
            ]}
          />

          <div className="pt-2">
            <ToggleInput
              label={`Auxilio de transporte: ${results.auxilio > 0 ? "SI (Aplica)" : "NO (No aplica)"}`}
              pressed={results.auxilio > 0}
              onToggle={() => {}}
            />
            <p className="mt-1 text-xs text-muted-foreground italic">
              Se aplica automáticamente si el salario es ≤ 2 SMLMV.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <CalculatorResult
            items={[
              { label: "Días trabajados", value: results.diasTrabajados.toString() },
              { label: "Base prestaciones", value: formatCOP(results.baseCesantiasPrima) },
              { label: "Total Liquidación", value: formatCOP(results.totalLiquidacion) },
            ]}
          />

          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Concepto</th>
                  <th className="px-4 py-2">Fórmula / Días</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2">Cesantías</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">(Base × {results.diasTrabajados}) / 360</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.cesantias)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Intereses Cesantías</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">(Ces. × {results.diasTrabajados} × 12%) / 360</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.interesesCesantias)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Prima de Servicios</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">(Base × {results.diasSemestre} días sem.) / 360</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.prima)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Vacaciones</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">(Salario × {results.diasTrabajados}) / 720</td>
                  <td className="px-4 py-2 text-right">{formatCOP(results.vacaciones)}</td>
                </tr>
                {results.applyIndem && (
                  <tr className="bg-muted/50">
                    <td className="px-4 py-2 font-medium">Indemnización</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">Art. 64 CST</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCOP(results.indemnizacion)}</td>
                  </tr>
                )}
                <tr className="bg-muted/30 font-bold">
                  <td className="px-4 py-3" colSpan={2}>TOTAL LIQUIDACIÓN</td>
                  <td className="px-4 py-3 text-right text-foreground">{formatCOP(results.totalLiquidacion)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!results.applyIndem && motivoTerminacion !== "despido_sin_justa" && (
            <div className="flex gap-3 rounded-xl bg-muted/50 border border-border/60 p-4 text-sm text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              <p>No aplica indemnización por {motivoTerminacion.replace("_", " ")}. Solo aplica para despido sin justa causa.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <CollapsibleSection title="Tabla de Indemnización (Art. 64 CST)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Tipo de Contrato</th>
                  <th className="px-3 py-2">Condición</th>
                  <th className="px-3 py-2">Indemnización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="px-3 py-2" rowSpan={2}>Término Indefinido</td>
                  <td className="px-3 py-2">Salario &lt; 10 SMLMV</td>
                  <td className="px-3 py-2">30 días (1er año) + 20 días por c/u adicional</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Salario ≥ 10 SMLMV</td>
                  <td className="px-3 py-2">20 días (1er año) + 15 días por c/u adicional</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Término Fijo</td>
                  <td className="px-3 py-2">Cualquier salario</td>
                  <td className="px-3 py-2">Salarios faltantes hasta el fin del contrato (Min. 15 días)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Obra o Labor</td>
                  <td className="px-3 py-2">Cualquier salario</td>
                  <td className="px-3 py-2">Días faltantes según cronograma de obra (Min. 15 días)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Fórmulas Aplicadas">
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li><strong>Cesantías:</strong> (Salario + Auxilio) × Días Trabajados / 360</li>
            <li><strong>Intereses Cesantías:</strong> Cesantías × Días Trabajados × 0.12 / 360</li>
            <li><strong>Prima de Servicios:</strong> (Salario + Auxilio) × Días del Semestre / 360</li>
            <li><strong>Vacaciones:</strong> Salario Básico × Días Trabajados / 720</li>
          </ul>
        </CollapsibleSection>

        <div className="rounded-xl border border-border/40 bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-medium">Base legal:</p>
          <p>Código Sustantivo del Trabajo (CST) Art. 64 (indemnización), Art. 249 (cesantías), Art. 306 (prima), Art. 186 (vacaciones), Ley 50 de 1990 Art. 99 (intereses cesantías).</p>
        </div>
      </div>
    </div>
  );
}
