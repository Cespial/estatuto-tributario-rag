"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, User } from "lucide-react";
import {
  CurrencyInput,
  SelectInput,
  ToggleInput,
} from "@/components/calculators/shared-inputs";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { CalculatorBreadcrumb } from "@/components/calculators/calculator-breadcrumb";
import { ScenarioSlider } from "@/components/calculators/scenario-slider";
import { CalculationStepsTable } from "@/components/calculators/calculation-steps-table";
import { CalculatorActions } from "@/components/calculators/calculator-actions";
import { CalculatorDisclaimer } from "@/components/calculators/calculator-disclaimer";
import { RelatedCalculators } from "@/components/calculators/related-calculators";
import { NominaCostChart } from "@/components/calculators/charts/nomina-cost-chart";
import {
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
  EMPLOYER_RATES,
  EMPLOYEE_RATES,
  ARL_CLASSES,
  FSP_BRACKETS,
} from "@/config/tax-data";
import { NOMINA_RATES } from "@/config/tax-data-laboral-sprint2";
import { buildShareUrl, readBooleanParam, readNumberParam, readStringParam, replaceUrlQuery } from "@/lib/calculators/url-state";
import { formatCOP } from "@/lib/calculators/format";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

interface NominaResults {
  ibc: number;
  ingresos: { totalDevengado: number; auxTransporte: number };
  empleador: {
    saludEmpleador: number;
    pensionEmpleador: number;
    arlEmpleador: number;
    sena: number;
    icbf: number;
    ccf: number;
    totalSSParafiscalesEmp: number;
  };
  trabajador: {
    saludTrabajador: number;
    pensionTrabajador: number;
    fsp: number;
    netoTrabajador: number;
  };
  prestaciones: {
    cesantias: number;
    intCesantias: number;
    prima: number;
    vacaciones: number;
    totalPrestaciones: number;
  };
  costoEmpleador: number;
  costoAnual: number;
}

function buildNominaResult(input: {
  salarioBasico: number;
  comisiones: number;
  claseARL: string;
  aplicaExoneracion: boolean;
}): NominaResults {
  const ibc = input.salarioBasico + input.comisiones;
  const aplicaAuxTransporte = input.salarioBasico <= SMLMV_2026 * 2;
  const auxTransporte = aplicaAuxTransporte ? AUXILIO_TRANSPORTE_2026 : 0;
  const totalDevengado = ibc + auxTransporte;

  const exoneraSalud = input.aplicaExoneracion && ibc < 10 * SMLMV_2026;
  const saludEmpleador = exoneraSalud ? 0 : ibc * EMPLOYER_RATES.salud;
  const pensionEmpleador = ibc * EMPLOYER_RATES.pension;
  const arlRate = ARL_CLASSES.find((c) => c.clase === input.claseARL)?.rate || 0.00522;
  const arlEmpleador = ibc * arlRate;

  const saludTrabajador = ibc * EMPLOYEE_RATES.salud;
  const pensionTrabajador = ibc * EMPLOYEE_RATES.pension;

  const exoneraParafiscales = input.aplicaExoneracion && ibc < 10 * SMLMV_2026;
  const sena = exoneraParafiscales ? 0 : ibc * EMPLOYER_RATES.sena;
  const icbf = exoneraParafiscales ? 0 : ibc * EMPLOYER_RATES.icbf;
  const ccf = ibc * EMPLOYER_RATES.ccf;

  const basePrestaciones = ibc + auxTransporte;
  const cesantias = basePrestaciones * NOMINA_RATES.cesantias;
  const intCesantias = cesantias * NOMINA_RATES.interesCesantias;
  const prima = basePrestaciones * NOMINA_RATES.prima;
  const vacaciones = ibc * NOMINA_RATES.vacaciones;

  let fsp = 0;
  const smVal = ibc / SMLMV_2026;
  for (const b of FSP_BRACKETS) {
    if (smVal >= b.fromSMLMV && smVal < b.toSMLMV) {
      fsp = ibc * b.rate;
      break;
    }
  }

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
}

function NominaCompletaPageContent() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    const parsedARL = readStringParam(searchParams, "arl", "I");

    return {
      salarioBasico: readNumberParam(searchParams, "sal", 0, { min: 0 }),
      comisiones: readNumberParam(searchParams, "com", 0, { min: 0 }),
      claseARL: ARL_CLASSES.some((item) => item.clase === parsedARL) ? parsedARL : "I",
      aplicaExoneracion: readBooleanParam(searchParams, "exo", true),
      escenarioDelta: readNumberParam(searchParams, "delta", 0),
    };
  }, [searchParams]);

  const [salarioBasico, setSalarioBasico] = useState(initialValues.salarioBasico);
  const [comisiones, setComisiones] = useState(initialValues.comisiones);
  const [claseARL, setClaseARL] = useState(initialValues.claseARL);
  const [aplicaExoneracion, setAplicaExoneracion] = useState(initialValues.aplicaExoneracion);
  const [escenarioDelta, setEscenarioDelta] = useState(initialValues.escenarioDelta);

  const { contentRef, handlePrint } = usePrintExport({ title: "Nomina Completa" });

  useEffect(() => {
    trackCalculatorUsage("nomina-completa");
  }, []);

  useEffect(() => {
    replaceUrlQuery({
      sal: salarioBasico,
      com: comisiones,
      arl: claseARL,
      exo: aplicaExoneracion,
      delta: escenarioDelta,
    });
  }, [salarioBasico, comisiones, claseARL, aplicaExoneracion, escenarioDelta]);

  const results = useMemo(
    () =>
      buildNominaResult({
        salarioBasico,
        comisiones,
        claseARL,
        aplicaExoneracion,
      }),
    [salarioBasico, comisiones, claseARL, aplicaExoneracion],
  );

  const escenarioSalario = Math.max(0, salarioBasico + escenarioDelta);
  const escenarioResults = useMemo(
    () =>
      buildNominaResult({
        salarioBasico: escenarioSalario,
        comisiones,
        claseARL,
        aplicaExoneracion,
      }),
    [escenarioSalario, comisiones, claseARL, aplicaExoneracion],
  );

  const steps = [
    {
      id: "devengado",
      label: "Total devengado (IBC + auxilio)",
      value: formatCOP(results.ingresos.totalDevengado),
      explanation:
        "El IBC corresponde al salario basico mas comisiones. Si aplica, se suma auxilio de transporte.",
      tone: "subtotal" as const,
    },
    {
      id: "ss-empresa",
      label: "SS y parafiscales empresa",
      value: formatCOP(results.empleador.totalSSParafiscalesEmp),
      explanation:
        "Incluye salud, pension, ARL, SENA, ICBF y caja de compensacion con reglas de exoneracion.",
    },
    {
      id: "prestaciones",
      label: "Prestaciones sociales",
      value: formatCOP(results.prestaciones.totalPrestaciones),
      explanation:
        "Cesantias, intereses, prima y vacaciones calculadas sobre su base legal correspondiente.",
    },
    {
      id: "costo-empresa",
      label: "Costo mensual empresa",
      value: formatCOP(results.costoEmpleador),
      explanation:
        "Es la suma de devengado, cargas de seguridad social/parafiscales y prestaciones.",
      tone: "total" as const,
    },
    {
      id: "descuentos-trabajador",
      label: "Deducciones trabajador (salud, pension, FSP)",
      value: formatCOP(results.trabajador.saludTrabajador + results.trabajador.pensionTrabajador + results.trabajador.fsp),
      explanation:
        "Aportes obligatorios del trabajador descontados del devengado mensual.",
      tone: "muted" as const,
    },
    {
      id: "neto-trabajador",
      label: "Neto mensual trabajador",
      value: formatCOP(results.trabajador.netoTrabajador),
      explanation:
        "Valor efectivamente recibido por el trabajador despues de deducciones obligatorias.",
      tone: "total" as const,
    },
  ];

  const shareUrl = buildShareUrl("/calculadoras/nomina-completa", {
    sal: salarioBasico,
    com: comisiones,
    arl: claseARL,
    exo: aplicaExoneracion,
    delta: escenarioDelta,
  });

  return (
    <>
      <CalculatorBreadcrumb
        items={[
          { label: "Calculadoras", href: "/calculadoras" },
          { label: "Nomina Completa" },
        ]}
      />

      <h1 className="mb-2 heading-serif text-3xl">Calculadora de Nomina Completa 2026</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Calculo integral de costos laborales mensuales y anuales para empresa y trabajador.
      </p>

      <CalculatorActions
        title="Nomina Completa"
        shareText="Consulta este escenario de nomina completa"
        shareUrl={shareUrl}
        onExportPdf={handlePrint}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-4 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 border-b pb-2 font-semibold">
              <User className="h-4 w-4 text-foreground/70" /> Datos del trabajador
            </h3>
            <CurrencyInput id="salario" label="Salario basico" value={salarioBasico} onChange={setSalarioBasico} />
            <CurrencyInput id="comisiones" label="Comisiones / horas extras" value={comisiones} onChange={setComisiones} />
          </div>

          <div className="space-y-4 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 border-b pb-2 font-semibold">
              <Building2 className="h-4 w-4 text-foreground/70" /> Configuracion empresa
            </h3>
            <SelectInput
              id="arl"
              label="Clase de riesgo ARL"
              value={claseARL}
              onChange={setClaseARL}
              options={ARL_CLASSES.map((c) => ({
                value: c.clase,
                label: `Riesgo ${c.clase} (${(c.rate * 100).toFixed(3)}%)`,
              }))}
            />
            <ToggleInput
              label="Exoneracion parafiscales (Art. 114-1)"
              pressed={aplicaExoneracion}
              onToggle={setAplicaExoneracion}
            />
            <p className="text-[11px] text-muted-foreground">
              Aplica para trabajadores con IBC inferior a 10 SMLMV. Exonera salud empleador, SENA e ICBF.
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
              <span className="text-xs font-bold uppercase text-muted-foreground">Neto mensual trabajador</span>
              <div className="text-2xl font-bold text-foreground">{formatCOP(results.trabajador.netoTrabajador)}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
              <span className="text-xs font-bold uppercase text-muted-foreground">Costo mensual empresa</span>
              <div className="text-2xl font-bold text-foreground">{formatCOP(results.costoEmpleador)}</div>
            </div>
          </div>

          <ScenarioSlider
            label="Escenario: Que pasa si el salario sube o baja?"
            helper="Ajusta el salario basico y observa el impacto en costo empresa y neto trabajador."
            min={-2_000_000}
            max={8_000_000}
            step={100_000}
            value={escenarioDelta}
            onChange={setEscenarioDelta}
            formatValue={formatCOP}
          />

          <NominaCostChart
            salario={results.ibc}
            auxilio={results.ingresos.auxTransporte}
            ssParafiscales={results.empleador.totalSSParafiscalesEmp}
            prestaciones={results.prestaciones.totalPrestaciones}
            netoTrabajador={results.trabajador.netoTrabajador}
            descuentosTrabajador={results.trabajador.saludTrabajador + results.trabajador.pensionTrabajador + results.trabajador.fsp}
          />

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Escenario comparativo</p>
            <p className="mt-1">
              Con salario basico de <strong>{formatCOP(escenarioSalario)}</strong>, el costo mensual empresa seria
              <strong> {formatCOP(escenarioResults.costoEmpleador)}</strong> y el neto trabajador
              <strong> {formatCOP(escenarioResults.trabajador.netoTrabajador)}</strong>.
            </p>
          </div>

          <CalculationStepsTable title="Paso a paso del calculo" rows={steps} valueColumnTitle="Valor mensual" />

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">
                  <th className="px-4 py-3 text-left">Desglose de nomina</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <TableRow label="Salario + comisiones (IBC)" value={results.ibc} />
                <TableRow label="Auxilio transporte" value={results.ingresos.auxTransporte} />
                <TableRow label="Salud empleador" value={results.empleador.saludEmpleador} />
                <TableRow label="Pension empleador" value={results.empleador.pensionEmpleador} />
                <TableRow label={`ARL (${claseARL})`} value={results.empleador.arlEmpleador} />
                <TableRow label="SENA" value={results.empleador.sena} />
                <TableRow label="ICBF" value={results.empleador.icbf} />
                <TableRow label="Caja compensacion" value={results.empleador.ccf} />
                <TableRow label="Cesantias" value={results.prestaciones.cesantias} />
                <TableRow label="Intereses cesantias" value={results.prestaciones.intCesantias} />
                <TableRow label="Prima" value={results.prestaciones.prima} />
                <TableRow label="Vacaciones" value={results.prestaciones.vacaciones} />
                <TableRow label="Costo mensual total empresa" value={results.costoEmpleador} bold />
                <TableRow
                  label="Descuentos trabajador"
                  value={results.trabajador.saludTrabajador + results.trabajador.pensionTrabajador + results.trabajador.fsp}
                  negative
                />
                <TableRow label="Neto trabajador" value={results.trabajador.netoTrabajador} bold />
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Costo total anual</span>
              <span className="text-2xl font-black text-foreground">{formatCOP(results.costoAnual)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Incluye 12 meses de salario, prestaciones y cargas de ley proyectadas.
            </p>
          </div>
        </div>
      </div>

      <CalculatorSources
        articles={[
          { id: "114-1", reason: "Exoneracion de aportes parafiscales y salud empleador." },
          { id: "204", reason: "Reglas de aportes al sistema de seguridad social." },
        ]}
      />

      <CalculatorDisclaimer
        references={[
          "Art. 114-1 ET",
          "Art. 204 Ley 100",
          "CST arts. prestaciones sociales",
        ]}
        message="Los resultados son una simulacion mensual y pueden variar segun novedades de nomina, incapacidades, vacaciones reales y acuerdos contractuales." 
      />

      <RelatedCalculators currentId="nomina-completa" />

      <div className="hidden">
        <div ref={contentRef}>
          <PrintWrapper title="Nomina Completa" subtitle="Resumen del escenario laboral mensual">
            <div className="space-y-2 text-sm">
              <p>Salario basico: {formatCOP(salarioBasico)}</p>
              <p>Comisiones: {formatCOP(comisiones)}</p>
              <p>Clase ARL: {claseARL}</p>
              <p>Costo mensual empresa: {formatCOP(results.costoEmpleador)}</p>
              <p>Neto mensual trabajador: {formatCOP(results.trabajador.netoTrabajador)}</p>
              <p>Costo anual empresa: {formatCOP(results.costoAnual)}</p>
            </div>
          </PrintWrapper>
        </div>
      </div>
    </>
  );
}

function TableRow({ label, value, bold, negative }: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <tr className={bold ? "font-bold" : ""}>
      <td className="px-4 py-3 text-muted-foreground">{label}</td>
      <td className={`px-4 py-3 text-right font-mono ${negative ? "text-muted-foreground" : ""}`}>
        {negative ? "-" : ""}
        {formatCOP(value)}
      </td>
    </tr>
  );
}

export default function NominaCompletaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando calculadora...</div>}>
      <NominaCompletaPageContent />
    </Suspense>
  );
}
