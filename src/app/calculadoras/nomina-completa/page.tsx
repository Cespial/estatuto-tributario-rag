"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, User } from "lucide-react";
import { CurrencyInput, SelectInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import {
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
  EMPLOYER_RATES,
  EMPLOYEE_RATES,
  ARL_CLASSES,
  FSP_BRACKETS,
} from "@/config/tax-data";
import { NOMINA_RATES } from "@/config/tax-data-laboral-sprint2";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function NominaCompletaPage() {
  const [salarioBasico, setSalarioBasico] = useState(0);
  const [comisiones, setComisiones] = useState(0);
  const [claseARL, setClaseARL] = useState("I");
  const [aplicaExoneracion, setAplicaExoneracion] = useState(true);

  const results = useMemo(() => {
    const ibc = salarioBasico + comisiones;
    const aplicaAuxTransporte = salarioBasico <= SMLMV_2026 * 2;
    const auxTransporte = aplicaAuxTransporte ? AUXILIO_TRANSPORTE_2026 : 0;
    const totalDevengado = ibc + auxTransporte;

    // SS Empleador
    const exoneraSalud = aplicaExoneracion && ibc < 10 * SMLMV_2026;
    const saludEmpleador = exoneraSalud ? 0 : ibc * EMPLOYER_RATES.salud;
    const pensionEmpleador = ibc * EMPLOYER_RATES.pension;
    const arlRate = ARL_CLASSES.find(c => c.clase === claseARL)?.rate || 0.00522;
    const arlEmpleador = ibc * arlRate;

    // SS Trabajador
    const saludTrabajador = ibc * EMPLOYEE_RATES.salud;
    const pensionTrabajador = ibc * EMPLOYEE_RATES.pension;

    // Parafiscales
    const exoneraParafiscales = aplicaExoneracion && ibc < 10 * SMLMV_2026;
    const sena = exoneraParafiscales ? 0 : ibc * EMPLOYER_RATES.sena;
    const icbf = exoneraParafiscales ? 0 : ibc * EMPLOYER_RATES.icbf;
    const ccf = ibc * EMPLOYER_RATES.ccf; // CCF nunca se exonera

    // Prestaciones (base incluye auxilio transporte para cesantias y prima)
    const basePrestaciones = ibc + auxTransporte;
    const cesantias = basePrestaciones * NOMINA_RATES.cesantias;
    const intCesantias = cesantias * NOMINA_RATES.interesCesantias;
    const prima = basePrestaciones * NOMINA_RATES.prima;
    const vacaciones = ibc * NOMINA_RATES.vacaciones;

    // FSP
    let fsp = 0;
    const smVal = ibc / SMLMV_2026;
    for (const b of FSP_BRACKETS) {
      if (smVal >= b.fromSMLMV && smVal < b.toSMLMV) {
        fsp = ibc * b.rate;
        break;
      }
    }

    // Totales
    const totalSSParafiscalesEmp = saludEmpleador + pensionEmpleador + arlEmpleador + sena + icbf + ccf;
    const totalPrestaciones = cesantias + intCesantias + prima + vacaciones;

    const costoEmpleador = ibc + auxTransporte + totalSSParafiscalesEmp + totalPrestaciones;
    const netoTrabajador = totalDevengado - saludTrabajador - pensionTrabajador - fsp;
    const costoAnual = costoEmpleador * 12;

    return {
      ibc,
      ingresos: { totalDevengado, auxTransporte },
      empleador: { saludEmpleador, pensionEmpleador, arlEmpleador, sena, icbf, ccf, totalSSParafiscalesEmp },
      trabajador: { saludTrabajador, pensionTrabajador, fsp, netoTrabajador },
      prestaciones: { cesantias, intCesantias, prima, vacaciones, totalPrestaciones },
      costoEmpleador,
      costoAnual,
    };
  }, [salarioBasico, comisiones, aplicaExoneracion, claseARL]);

  return (
    <div className="container max-w-5xl py-10">
      <Link href="/calculadoras" className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calculadora de Nomina Completa 2026</h1>
        <p className="text-muted-foreground">Calculo integral de costos laborales y deducciones de ley.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* INPUTS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-semibold border-b pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Datos del Trabajador
            </h3>
            <CurrencyInput id="salario" label="Salario Basico" value={salarioBasico} onChange={setSalarioBasico} />
            <CurrencyInput id="comisiones" label="Comisiones / Horas Extras" value={comisiones} onChange={setComisiones} />
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-semibold border-b pb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Configuracion Empresa
            </h3>
            <SelectInput
              id="arl"
              label="Clase de Riesgo ARL"
              value={claseARL}
              onChange={setClaseARL}
              options={ARL_CLASSES.map(c => ({ value: c.clase, label: `Riesgo ${c.clase} (${(c.rate * 100).toFixed(3)}%)` }))}
            />
            <ToggleInput label="Exoneracion Parafiscales (Art. 114-1)" pressed={aplicaExoneracion} onToggle={setAplicaExoneracion} />
            <p className="text-[10px] text-muted-foreground italic">
              * Aplica para empleados que ganen menos de 10 SMLMV. Exonera de Salud, SENA e ICBF.
            </p>
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-primary/5 p-4 border-primary/20">
              <span className="text-xs font-bold uppercase text-muted-foreground">Neto Mensual Trabajador</span>
              <div className="text-2xl font-bold text-primary">{formatCOP(results.trabajador.netoTrabajador)}</div>
            </div>
            <div className="rounded-xl border bg-card p-4 border-border shadow-sm">
              <span className="text-xs font-bold uppercase text-muted-foreground">Costo Mensual Empresa</span>
              <div className="text-2xl font-bold">{formatCOP(results.costoEmpleador)}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  <th className="px-4 py-2 text-left">Desglose de Nomina</th>
                  <th className="px-4 py-2 text-right">Valor Unitario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* INGRESOS */}
                <tr className="bg-muted/20 font-semibold"><td colSpan={2} className="px-4 py-1.5 text-xs">1. INGRESOS</td></tr>
                <TableRow label="Salario" value={salarioBasico} />
                <TableRow label="Comisiones / Otros" value={comisiones} />
                <TableRow label="Auxilio de Transporte" value={results.ingresos.auxTransporte} />
                <TableRow label="Total Devengado" value={results.ingresos.totalDevengado} bold />

                {/* SEGURIDAD SOCIAL Y PARAFISCALES EMPLEADOR */}
                <tr className="bg-muted/20 font-semibold"><td colSpan={2} className="px-4 py-1.5 text-xs">2. CARGA PRESTACIONAL (EMPRESA)</td></tr>
                <TableRow label="Salud (8.5%)" value={results.empleador.saludEmpleador} />
                <TableRow label="Pension (12%)" value={results.empleador.pensionEmpleador} />
                <TableRow label={`ARL (${claseARL})`} value={results.empleador.arlEmpleador} />
                <TableRow label="SENA (2%)" value={results.empleador.sena} />
                <TableRow label="ICBF (3%)" value={results.empleador.icbf} />
                <TableRow label="Caja Compensacion (4%)" value={results.empleador.ccf} />

                {/* PRESTACIONES */}
                <tr className="bg-muted/20 font-semibold"><td colSpan={2} className="px-4 py-1.5 text-xs">3. PRESTACIONES SOCIALES</td></tr>
                <TableRow label="Cesantias (8.33%)" value={results.prestaciones.cesantias} />
                <TableRow label="Intereses Cesantias (12% anual)" value={results.prestaciones.intCesantias} />
                <TableRow label="Prima de Servicios (8.33%)" value={results.prestaciones.prima} />
                <TableRow label="Vacaciones (4.17%)" value={results.prestaciones.vacaciones} />

                {/* DEDUCCIONES TRABAJADOR */}
                <tr className="bg-muted/20 font-semibold"><td colSpan={2} className="px-4 py-1.5 text-xs">4. DEDUCCIONES TRABAJADOR</td></tr>
                <TableRow label="Salud (4%)" value={results.trabajador.saludTrabajador} negative />
                <TableRow label="Pension (4%)" value={results.trabajador.pensionTrabajador} negative />
                {results.trabajador.fsp > 0 && <TableRow label="Fondo Solidaridad Pensional" value={results.trabajador.fsp} negative />}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border bg-muted/30 p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">COSTO TOTAL ANUAL</span>
              <span className="text-2xl font-black text-foreground">{formatCOP(results.costoAnual)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              * El costo anual incluye 12 meses de salarios, prestaciones sociales y cargas de ley proyectadas.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CalculatorSources articles={["204", "114-1"]} />
      </div>
    </div>
  );
}

function TableRow({ label, value, bold, negative }: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <tr className={bold ? "font-bold" : ""}>
      <td className="px-4 py-2 text-muted-foreground">{label}</td>
      <td className={`px-4 py-2 text-right font-mono ${negative ? "text-red-500" : ""}`}>
        {negative ? "-" : ""}{formatCOP(value)}
      </td>
    </tr>
  );
}
