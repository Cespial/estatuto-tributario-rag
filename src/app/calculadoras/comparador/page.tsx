"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RENTA_BRACKETS,
  RETENCION_SALARIOS_BRACKETS,
  LEY_2277_LIMITS,
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
  SALARIO_INTEGRAL_MIN_SMLMV,
  EMPLOYER_RATES,
  EMPLOYEE_RATES,
  INDEPENDENT_RATES,
  SALARIO_INTEGRAL_RATES,
  IVA_THRESHOLD_UVT_ANNUAL,
  SIMPLE_GROUPS,
  SIMPLE_BRACKETS,
} from "@/config/tax-data";
import { CurrencyInput, ToggleInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

// ── Helpers ──

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function calcRetencionMensual(baseGravableUVT: number): number {
  if (baseGravableUVT <= 0) return 0;
  for (let i = RETENCION_SALARIOS_BRACKETS.length - 1; i >= 0; i--) {
    const b = RETENCION_SALARIOS_BRACKETS[i];
    if (baseGravableUVT > b.from) {
      return (baseGravableUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

function calcImpuestoRenta(rentaLiquidaUVT: number): number {
  if (rentaLiquidaUVT <= 0) return 0;
  for (let i = RENTA_BRACKETS.length - 1; i >= 0; i--) {
    const b = RENTA_BRACKETS[i];
    if (rentaLiquidaUVT > b.from) {
      return (rentaLiquidaUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

function calcSimple(ingresoBrutoAnualUVT: number, groupIndex: number): number {
  let impuesto = 0;
  let remaining = ingresoBrutoAnualUVT;
  for (const bracket of SIMPLE_BRACKETS) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.to - bracket.from);
    impuesto += taxableInBracket * bracket.rates[groupIndex];
    remaining -= taxableInBracket;
  }
  return impuesto;
}

// ── Collapsible ──

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

// ── Main Page ──

export default function ComparadorPage() {
  const [presupuesto, setPresupuesto] = useState(0);
  const [esPensionado, setEsPensionado] = useState(false);
  const [grupoSimple, setGrupoSimple] = useState("2");

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const groupIndex = parseInt(grupoSimple) - 1;

  const result = useMemo(() => {
    if (presupuesto <= 0) return null;

    // ── Rates adjusted for pensionado ──
    const empPension = esPensionado ? 0 : EMPLOYER_RATES.pension;
    const workerPension = esPensionado ? 0 : EMPLOYEE_RATES.pension;
    const indPension = esPensionado ? 0 : INDEPENDENT_RATES.pension;

    // ════════════════════════════════════
    // A. LABORAL ORDINARIO
    // ════════════════════════════════════
    const factorSSLaboral = EMPLOYER_RATES.salud + empPension + EMPLOYER_RATES.arl;
    const factorParafiscales = EMPLOYER_RATES.sena + EMPLOYER_RATES.icbf + EMPLOYER_RATES.ccf;
    const factorPrestaciones =
      EMPLOYER_RATES.cesantias + EMPLOYER_RATES.intCesantias + EMPLOYER_RATES.prima + EMPLOYER_RATES.vacaciones;

    // First estimate without auxilio
    const factorTotal = factorSSLaboral + factorParafiscales + factorPrestaciones;
    let salarioLaboral = presupuesto / (1 + factorTotal);

    // Check if auxilio transporte applies (≤ 2 SMLMV)
    let auxilioTransporte = 0;
    if (salarioLaboral <= 2 * SMLMV_2026) {
      // With auxilio: presupuesto = salario + auxilio + SS*salario + paraf*salario
      //   + cesantias*(sal+aux) + intCes*(sal+aux) + prima*(sal+aux) + vac*sal
      const factorConAux =
        factorSSLaboral +
        factorParafiscales +
        EMPLOYER_RATES.vacaciones +
        (EMPLOYER_RATES.cesantias + EMPLOYER_RATES.intCesantias + EMPLOYER_RATES.prima); // these apply to sal+aux
      // presupuesto = sal*(1+factorConAux) + aux*(1 + ces + intCes + prima)
      const factorAux = 1 + EMPLOYER_RATES.cesantias + EMPLOYER_RATES.intCesantias + EMPLOYER_RATES.prima;
      salarioLaboral = (presupuesto - AUXILIO_TRANSPORTE_2026 * factorAux) / (1 + factorConAux);
      if (salarioLaboral > 2 * SMLMV_2026) {
        // Recalculate without auxilio
        salarioLaboral = presupuesto / (1 + factorTotal);
        auxilioTransporte = 0;
      } else {
        auxilioTransporte = AUXILIO_TRANSPORTE_2026;
      }
    }

    const basePrestaciones = salarioLaboral + auxilioTransporte;

    const labSaludEmp = salarioLaboral * EMPLOYER_RATES.salud;
    const labPensionEmp = salarioLaboral * empPension;
    const labArlEmp = salarioLaboral * EMPLOYER_RATES.arl;
    const labSena = salarioLaboral * EMPLOYER_RATES.sena;
    const labIcbf = salarioLaboral * EMPLOYER_RATES.icbf;
    const labCcf = salarioLaboral * EMPLOYER_RATES.ccf;
    const labCesantias = basePrestaciones * EMPLOYER_RATES.cesantias;
    const labIntCesantias = basePrestaciones * EMPLOYER_RATES.intCesantias;
    const labPrima = basePrestaciones * EMPLOYER_RATES.prima;
    const labVacaciones = salarioLaboral * EMPLOYER_RATES.vacaciones;

    const labCostoEmpresa =
      salarioLaboral + auxilioTransporte + labSaludEmp + labPensionEmp + labArlEmp +
      labSena + labIcbf + labCcf + labCesantias + labIntCesantias + labPrima + labVacaciones;

    const labSaludWorker = salarioLaboral * EMPLOYEE_RATES.salud;
    const labPensionWorker = salarioLaboral * workerPension;
    const labTotalSSWorker = labSaludWorker + labPensionWorker;

    const labNetoMensual = salarioLaboral + auxilioTransporte - labTotalSSWorker;
    const labPrestacionesAnuales = labCesantias * 12 + labIntCesantias * 12 + labPrima * 12;
    const labNetoAnualSinReteFte = labNetoMensual * 12 + labPrestacionesAnuales;

    // ════════════════════════════════════
    // B. SALARIO INTEGRAL
    // ════════════════════════════════════
    const minIntegral = SALARIO_INTEGRAL_MIN_SMLMV * SMLMV_2026;
    const factorSSIntegral =
      (EMPLOYER_RATES.salud + empPension + EMPLOYER_RATES.arl) * SALARIO_INTEGRAL_RATES.baseSS;
    const factorIntegral = factorSSIntegral + factorParafiscales;
    const salarioIntegral = presupuesto / (1 + factorIntegral);
    const integralNA = salarioIntegral < minIntegral;

    const intBase70 = salarioIntegral * SALARIO_INTEGRAL_RATES.baseSS;
    const intSaludEmp = intBase70 * EMPLOYER_RATES.salud;
    const intPensionEmp = intBase70 * empPension;
    const intArlEmp = intBase70 * EMPLOYER_RATES.arl;
    const intSena = salarioIntegral * EMPLOYER_RATES.sena;
    const intIcbf = salarioIntegral * EMPLOYER_RATES.icbf;
    const intCcf = salarioIntegral * EMPLOYER_RATES.ccf;

    const intCostoEmpresa = salarioIntegral + intSaludEmp + intPensionEmp + intArlEmp + intSena + intIcbf + intCcf;

    const intSaludWorker = intBase70 * EMPLOYEE_RATES.salud;
    const intPensionWorker = intBase70 * workerPension;
    const intTotalSSWorker = intSaludWorker + intPensionWorker;

    const intNetoMensual = salarioIntegral - intTotalSSWorker;
    const intNetoAnualSinReteFte = intNetoMensual * 12;

    // ════════════════════════════════════
    // C. PRESTACION DE SERVICIOS
    // ════════════════════════════════════
    const honorario = presupuesto;
    const indBaseSS = honorario * INDEPENDENT_RATES.baseSS;
    const indSalud = indBaseSS * INDEPENDENT_RATES.salud;
    const indPensionVal = indBaseSS * indPension;
    const indArl = indBaseSS * INDEPENDENT_RATES.arl;
    const indTotalSS = indSalud + indPensionVal + indArl;

    const ingresoAnualUVT = (honorario * 12) / uvt;
    const indIVA = ingresoAnualUVT > IVA_THRESHOLD_UVT_ANNUAL ? honorario * 0.19 : 0;

    const indNetoMensual = honorario - indTotalSS;
    const indNetoAnualSinReteFte = indNetoMensual * 12;

    // ════════════════════════════════════
    // RETENCION EN LA FUENTE — Proc. 1 Art. 383
    // ════════════════════════════════════
    const topeExentasMensual = (LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt) / 12;

    // Laboral
    const labIngresoMensual = salarioLaboral;
    const labSSIncrngo = labTotalSSWorker;
    const labIngresoNeto = labIngresoMensual - labSSIncrngo;
    const labExenta25 = Math.min(labIngresoNeto * 0.25, topeExentasMensual);
    const labBaseGravable = Math.max(0, labIngresoNeto - labExenta25);
    const labBaseGravableUVT = labBaseGravable / uvt;
    const labReteFteUVT = calcRetencionMensual(labBaseGravableUVT);
    const labReteFte = labReteFteUVT * uvt;

    // Integral
    const intIngresoMensual = intBase70;
    const intSSIncrngo = intTotalSSWorker;
    const intIngresoNeto = intIngresoMensual - intSSIncrngo;
    const intExenta25 = Math.min(intIngresoNeto * 0.25, topeExentasMensual);
    const intBaseGravable = Math.max(0, intIngresoNeto - intExenta25);
    const intBaseGravableUVT = intBaseGravable / uvt;
    const intReteFteUVT = calcRetencionMensual(intBaseGravableUVT);
    const intReteFte = intReteFteUVT * uvt;

    // Independiente
    const indIngresoMensual = honorario;
    const indSSIncrngo = indTotalSS;
    const indIngresoNeto = indIngresoMensual - indSSIncrngo;
    const indExenta25 = Math.min(indIngresoNeto * 0.25, topeExentasMensual);
    const indBaseGravable = Math.max(0, indIngresoNeto - indExenta25);
    const indBaseGravableUVT = indBaseGravable / uvt;
    const indReteFteUVT = calcRetencionMensual(indBaseGravableUVT);
    const indReteFte = indReteFteUVT * uvt;

    // ════════════════════════════════════
    // RENTA ANUAL — Art. 241
    // ════════════════════════════════════
    const topeExentasAnual = LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt;

    // Laboral
    const labIngresoBrutoAnual = salarioLaboral * 12 + labPrestacionesAnuales;
    const labSSAnual = labTotalSSWorker * 12;
    const labIngresoNetoAnual = labIngresoBrutoAnual - labSSAnual;
    const labExenta25Anual = Math.min(labIngresoNetoAnual * 0.25, topeExentasAnual);
    const labRentaLiquida = Math.max(0, labIngresoNetoAnual - labExenta25Anual);
    const labRentaLiquidaUVT = labRentaLiquida / uvt;
    const labImpuestoRentaUVT = calcImpuestoRenta(labRentaLiquidaUVT);
    const labImpuestoRenta = labImpuestoRentaUVT * uvt;
    const labRetencionesAnuales = labReteFte * 12;
    const labSaldoRenta = labImpuestoRenta - labRetencionesAnuales;
    const labTasaEfectiva = labIngresoBrutoAnual > 0 ? labImpuestoRenta / labIngresoBrutoAnual : 0;

    // Integral
    const intIngresoBrutoAnual = salarioIntegral * 12;
    const intSSAnual = intTotalSSWorker * 12;
    const intIngresoNetoAnual = intBase70 * 12 - intSSAnual;
    const intExenta25Anual = Math.min(intIngresoNetoAnual * 0.25, topeExentasAnual);
    const intRentaLiquida = Math.max(0, intIngresoNetoAnual - intExenta25Anual);
    const intRentaLiquidaUVT = intRentaLiquida / uvt;
    const intImpuestoRentaUVT = calcImpuestoRenta(intRentaLiquidaUVT);
    const intImpuestoRenta = intImpuestoRentaUVT * uvt;
    const intRetencionesAnuales = intReteFte * 12;
    const intSaldoRenta = intImpuestoRenta - intRetencionesAnuales;
    const intTasaEfectiva = intIngresoBrutoAnual > 0 ? intImpuestoRenta / intIngresoBrutoAnual : 0;

    // Independiente
    const indIngresoBrutoAnual = honorario * 12;
    const indSSAnual = indTotalSS * 12;
    const indIngresoNetoAnual = indIngresoBrutoAnual - indSSAnual;
    const indExenta25Anual = Math.min(indIngresoNetoAnual * 0.25, topeExentasAnual);
    const indRentaLiquida = Math.max(0, indIngresoNetoAnual - indExenta25Anual);
    const indRentaLiquidaUVT = indRentaLiquida / uvt;
    const indImpuestoRentaUVT = calcImpuestoRenta(indRentaLiquidaUVT);
    const indImpuestoRenta = indImpuestoRentaUVT * uvt;
    const indRetencionesAnuales = indReteFte * 12;
    const indSaldoRenta = indImpuestoRenta - indRetencionesAnuales;
    const indTasaEfectiva = indIngresoBrutoAnual > 0 ? indImpuestoRenta / indIngresoBrutoAnual : 0;

    // ════════════════════════════════════
    // SIMPLE vs Ordinaria
    // ════════════════════════════════════
    const indBrutoAnualUVT = indIngresoBrutoAnual / uvt;
    const simpleImpuestoUVT = calcSimple(indBrutoAnualUVT, groupIndex);
    const simpleImpuesto = simpleImpuestoUVT * uvt;

    // Best for worker
    const netos = [labNetoAnualSinReteFte, integralNA ? -Infinity : intNetoAnualSinReteFte, indNetoAnualSinReteFte];
    const bestIndex = netos.indexOf(Math.max(...netos));

    return {
      // Laboral
      lab: {
        salario: salarioLaboral, auxilio: auxilioTransporte, basePrestaciones,
        saludEmp: labSaludEmp, pensionEmp: labPensionEmp, arlEmp: labArlEmp,
        sena: labSena, icbf: labIcbf, ccf: labCcf,
        cesantias: labCesantias, intCesantias: labIntCesantias, prima: labPrima, vacaciones: labVacaciones,
        costoEmpresa: labCostoEmpresa,
        saludWorker: labSaludWorker, pensionWorker: labPensionWorker, totalSSWorker: labTotalSSWorker,
        netoMensual: labNetoMensual, prestacionesAnuales: labPrestacionesAnuales, netoAnual: labNetoAnualSinReteFte,
        // ReteFte
        ingresoMensual: labIngresoMensual, ssIncrngo: labSSIncrngo, ingresoNeto: labIngresoNeto,
        exenta25: labExenta25, baseGravable: labBaseGravable, baseGravableUVT: labBaseGravableUVT,
        reteFte: labReteFte,
        // Renta
        ingresoBrutoAnual: labIngresoBrutoAnual, ssAnual: labSSAnual,
        exenta25Anual: labExenta25Anual, rentaLiquida: labRentaLiquida, rentaLiquidaUVT: labRentaLiquidaUVT,
        impuestoRenta: labImpuestoRenta, retencionesAnuales: labRetencionesAnuales,
        saldoRenta: labSaldoRenta, tasaEfectiva: labTasaEfectiva,
      },
      // Integral
      int: {
        salario: salarioIntegral, na: integralNA, base70: intBase70,
        saludEmp: intSaludEmp, pensionEmp: intPensionEmp, arlEmp: intArlEmp,
        sena: intSena, icbf: intIcbf, ccf: intCcf,
        costoEmpresa: intCostoEmpresa,
        saludWorker: intSaludWorker, pensionWorker: intPensionWorker, totalSSWorker: intTotalSSWorker,
        netoMensual: intNetoMensual, netoAnual: intNetoAnualSinReteFte,
        ingresoMensual: intIngresoMensual, ssIncrngo: intSSIncrngo, ingresoNeto: intIngresoNeto,
        exenta25: intExenta25, baseGravable: intBaseGravable, baseGravableUVT: intBaseGravableUVT,
        reteFte: intReteFte,
        ingresoBrutoAnual: intIngresoBrutoAnual, ssAnual: intSSAnual,
        exenta25Anual: intExenta25Anual, rentaLiquida: intRentaLiquida, rentaLiquidaUVT: intRentaLiquidaUVT,
        impuestoRenta: intImpuestoRenta, retencionesAnuales: intRetencionesAnuales,
        saldoRenta: intSaldoRenta, tasaEfectiva: intTasaEfectiva,
      },
      // Independiente
      ind: {
        honorario, baseSS: indBaseSS, salud: indSalud, pension: indPensionVal, arl: indArl, totalSS: indTotalSS,
        iva: indIVA,
        netoMensual: indNetoMensual, netoAnual: indNetoAnualSinReteFte,
        ingresoMensual: indIngresoMensual, ssIncrngo: indSSIncrngo, ingresoNeto: indIngresoNeto,
        exenta25: indExenta25, baseGravable: indBaseGravable, baseGravableUVT: indBaseGravableUVT,
        reteFte: indReteFte,
        ingresoBrutoAnual: indIngresoBrutoAnual, ssAnual: indSSAnual,
        exenta25Anual: indExenta25Anual, rentaLiquida: indRentaLiquida, rentaLiquidaUVT: indRentaLiquidaUVT,
        impuestoRenta: indImpuestoRenta, retencionesAnuales: indRetencionesAnuales,
        saldoRenta: indSaldoRenta, tasaEfectiva: indTasaEfectiva,
      },
      simple: { impuesto: simpleImpuesto, ordinaria: indImpuestoRenta, diferencia: indImpuestoRenta - simpleImpuesto },
      bestIndex,
    };
  }, [presupuesto, esPensionado, groupIndex, uvt]);

  const bestCol = (i: number) =>
    result && result.bestIndex === i ? "bg-muted/50 font-semibold" : "";

  return (
    <>
      <Link
        href="/calculadoras"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 heading-serif text-3xl">Comparador de Contratacion</h1>

      {/* ── Inputs ── */}
      <div className="mb-6 space-y-4">
        <CurrencyInput
          id="comp-presupuesto"
          label="Presupuesto empresa mensual"
          value={presupuesto}
          onChange={setPresupuesto}
        />
        <div className="flex flex-wrap items-end gap-4">
          <ToggleInput label="Es pensionado" pressed={esPensionado} onToggle={setEsPensionado} />
          <div className="min-w-[260px] flex-1">
            <SelectInput
              id="comp-grupo-simple"
              label="Grupo SIMPLE (para comparativo)"
              value={grupoSimple}
              onChange={setGrupoSimple}
              options={SIMPLE_GROUPS.map((g) => ({ value: String(g.id), label: g.label }))}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Integral N/A warning */}
          {result.int.na && (
            <p className="text-sm text-foreground bg-muted/50 border border-border/60 rounded-lg p-4">
              Salario Integral no aplica: el salario calculado ({formatCOP(result.int.salario)}) es inferior al minimo
              de {SALARIO_INTEGRAL_MIN_SMLMV} SMLMV ({formatCOP(SALARIO_INTEGRAL_MIN_SMLMV * SMLMV_2026)}).
            </p>
          )}

          {/* ════ A. TABLA COMPARATIVA PRINCIPAL ════ */}
          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Tabla Comparativa</h2>
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Concepto</th>
                    <th className={`px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground ${bestCol(0)}`}>Laboral</th>
                    <th className={`px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground ${bestCol(1)}`}>Integral</th>
                    <th className={`px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground ${bestCol(2)}`}>Independiente</th>
                  </tr>
                </thead>
                <tbody>
                  {/* INGRESOS */}
                  <tr className="border-b border-border bg-muted/30">
                    <td colSpan={4} className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground">
                      Ingresos
                    </td>
                  </tr>
                  <Row label="Salario / Honorario" lab={result.lab.salario} int_={result.int.na ? null : result.int.salario} ind={result.ind.honorario} best={result.bestIndex} />
                  <Row label="Auxilio transporte" lab={result.lab.auxilio} int_={result.int.na ? null : 0} ind={0} best={result.bestIndex} />

                  {/* COSTO EMPRESA */}
                  <tr className="border-b border-border bg-muted/30">
                    <td colSpan={4} className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground">
                      Costo Empresa
                    </td>
                  </tr>
                  <Row label="Salud (8.5%)" lab={result.lab.saludEmp} int_={result.int.na ? null : result.int.saludEmp} ind={0} best={result.bestIndex} />
                  <Row label={`Pension (${esPensionado ? "0%" : "12%"})`} lab={result.lab.pensionEmp} int_={result.int.na ? null : result.int.pensionEmp} ind={0} best={result.bestIndex} />
                  <Row label="ARL (0.522%)" lab={result.lab.arlEmp} int_={result.int.na ? null : result.int.arlEmp} ind={0} best={result.bestIndex} />
                  <Row label="SENA (2%)" lab={result.lab.sena} int_={result.int.na ? null : result.int.sena} ind={0} best={result.bestIndex} />
                  <Row label="ICBF (3%)" lab={result.lab.icbf} int_={result.int.na ? null : result.int.icbf} ind={0} best={result.bestIndex} />
                  <Row label="CCF (4%)" lab={result.lab.ccf} int_={result.int.na ? null : result.int.ccf} ind={0} best={result.bestIndex} />
                  <Row label="Cesantias (8.33%)" lab={result.lab.cesantias} int_={result.int.na ? null : 0} ind={0} best={result.bestIndex} />
                  <Row label="Int. Cesantias (1%)" lab={result.lab.intCesantias} int_={result.int.na ? null : 0} ind={0} best={result.bestIndex} />
                  <Row label="Prima (8.33%)" lab={result.lab.prima} int_={result.int.na ? null : 0} ind={0} best={result.bestIndex} />
                  <Row label="Vacaciones (4.17%)" lab={result.lab.vacaciones} int_={result.int.na ? null : 0} ind={0} best={result.bestIndex} />
                  <RowTotal label="Total costo empresa" lab={result.lab.costoEmpresa} int_={result.int.na ? null : result.int.costoEmpresa} ind={result.ind.honorario} best={result.bestIndex} />

                  {/* DESCUENTOS TRABAJADOR */}
                  <tr className="border-b border-border bg-muted/30">
                    <td colSpan={4} className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground">
                      Descuentos Trabajador / SS Independiente
                    </td>
                  </tr>
                  <Row label="Salud" lab={result.lab.saludWorker} int_={result.int.na ? null : result.int.saludWorker} ind={result.ind.salud} best={result.bestIndex} />
                  <Row label="Pension" lab={result.lab.pensionWorker} int_={result.int.na ? null : result.int.pensionWorker} ind={result.ind.pension} best={result.bestIndex} />
                  <Row label="ARL" lab={0} int_={result.int.na ? null : 0} ind={result.ind.arl} best={result.bestIndex} />
                  <RowTotal label="Total SS trabajador" lab={result.lab.totalSSWorker} int_={result.int.na ? null : result.int.totalSSWorker} ind={result.ind.totalSS} best={result.bestIndex} />

                  {/* IVA */}
                  <tr className="border-b border-border bg-muted/30">
                    <td colSpan={4} className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground">
                      IVA
                    </td>
                  </tr>
                  <Row label="IVA (19%)" lab={0} int_={result.int.na ? null : 0} ind={result.ind.iva} best={result.bestIndex} note={result.ind.iva > 0 ? `Ingreso anual > ${IVA_THRESHOLD_UVT_ANNUAL.toLocaleString("es-CO")} UVT` : undefined} />

                  {/* NETO */}
                  <tr className="border-b border-border bg-muted/30">
                    <td colSpan={4} className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground">
                      Neto (sin ReteFte)
                    </td>
                  </tr>
                  <Row label="Neto mensual" lab={result.lab.netoMensual} int_={result.int.na ? null : result.int.netoMensual} ind={result.ind.netoMensual} best={result.bestIndex} />
                  <Row label="(+) Prestaciones anuales" lab={result.lab.prestacionesAnuales} int_={result.int.na ? null : 0} ind={0} best={result.bestIndex} />
                  <RowTotal label="Neto anual sin ReteFte" lab={result.lab.netoAnual} int_={result.int.na ? null : result.int.netoAnual} ind={result.ind.netoAnual} best={result.bestIndex} highlight />
                </tbody>
              </table>
            </div>
            {result.bestIndex !== -1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                La columna destacada es la de mayor neto anual para el trabajador.
              </p>
            )}
          </div>

          {/* ════ B. RETENCION EN LA FUENTE ════ */}
          <CollapsibleSection title="Retencion en la Fuente — Proc. 1 Art. 383">
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Concepto</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Laboral</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Integral</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Independiente</th>
                  </tr>
                </thead>
                <tbody>
                  <SimpleRow label="Ingreso mensual" vals={[result.lab.ingresoMensual, result.int.na ? null : result.int.ingresoMensual, result.ind.ingresoMensual]} />
                  <SimpleRow label="(-) Aportes SS (INCRNGO)" vals={[result.lab.ssIncrngo, result.int.na ? null : result.int.ssIncrngo, result.ind.ssIncrngo]} negative />
                  <SimpleRow label="= Ingreso neto" vals={[result.lab.ingresoNeto, result.int.na ? null : result.int.ingresoNeto, result.ind.ingresoNeto]} />
                  <SimpleRow label="(-) Renta exenta 25%" vals={[result.lab.exenta25, result.int.na ? null : result.int.exenta25, result.ind.exenta25]} negative />
                  <SimpleRow label="= Base gravable" vals={[result.lab.baseGravable, result.int.na ? null : result.int.baseGravable, result.ind.baseGravable]} />
                  <SimpleRow label="Base gravable (UVT)" vals={[result.lab.baseGravableUVT, result.int.na ? null : result.int.baseGravableUVT, result.ind.baseGravableUVT]} isUVT />
                  <tr className="border-b border-border bg-muted/20 font-semibold">
                    <td className="px-4 py-2">Retencion mensual</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.lab.reteFte)}</td>
                    <td className="px-4 py-2 text-right">{result.int.na ? "N/A" : formatCOP(result.int.reteFte)}</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.ind.reteFte)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Nota: Depuracion simplificada solo con renta exenta 25% (Art. 206 num. 10). Tope combinado {LEY_2277_LIMITS.deduccionesExentasMaxUVT.toLocaleString("es-CO")} UVT/12 mensual.
              Para integral la base es el 70% del salario.
            </p>
          </CollapsibleSection>

          {/* ════ C. RENTA ANUAL ════ */}
          <CollapsibleSection title="Proyeccion Renta Anual — Art. 241">
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Concepto</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Laboral</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Integral</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Independiente</th>
                  </tr>
                </thead>
                <tbody>
                  <SimpleRow label="Ingresos brutos anuales" vals={[result.lab.ingresoBrutoAnual, result.int.na ? null : result.int.ingresoBrutoAnual, result.ind.ingresoBrutoAnual]} />
                  <SimpleRow label="(-) INCRNGO (SS anual)" vals={[result.lab.ssAnual, result.int.na ? null : result.int.ssAnual, result.ind.ssAnual]} negative />
                  <SimpleRow label="(-) Renta exenta 25%" vals={[result.lab.exenta25Anual, result.int.na ? null : result.int.exenta25Anual, result.ind.exenta25Anual]} negative />
                  <SimpleRow label="= Renta liquida gravable" vals={[result.lab.rentaLiquida, result.int.na ? null : result.int.rentaLiquida, result.ind.rentaLiquida]} />
                  <SimpleRow label="Renta liquida (UVT)" vals={[result.lab.rentaLiquidaUVT, result.int.na ? null : result.int.rentaLiquidaUVT, result.ind.rentaLiquidaUVT]} isUVT />
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-semibold">Impuesto de renta</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCOP(result.lab.impuestoRenta)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{result.int.na ? "N/A" : formatCOP(result.int.impuestoRenta)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCOP(result.ind.impuestoRenta)}</td>
                  </tr>
                  <SimpleRow label="(-) Retenciones anuales" vals={[result.lab.retencionesAnuales, result.int.na ? null : result.int.retencionesAnuales, result.ind.retencionesAnuales]} negative />
                  <tr className="border-b border-border bg-muted/20 font-semibold">
                    <td className="px-4 py-2">Saldo a pagar / (a favor)</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.lab.saldoRenta)}</td>
                    <td className="px-4 py-2 text-right">{result.int.na ? "N/A" : formatCOP(result.int.saldoRenta)}</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.ind.saldoRenta)}</td>
                  </tr>
                  <tr className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-muted-foreground">Tasa efectiva</td>
                    <td className="px-4 py-2 text-right">{(result.lab.tasaEfectiva * 100).toFixed(2)}%</td>
                    <td className="px-4 py-2 text-right">{result.int.na ? "N/A" : `${(result.int.tasaEfectiva * 100).toFixed(2)}%`}</td>
                    <td className="px-4 py-2 text-right">{(result.ind.tasaEfectiva * 100).toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          {/* ════ D. SIMPLE vs ORDINARIA ════ */}
          <CollapsibleSection title="SIMPLE vs Ordinaria — Solo Independiente">
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Concepto</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2">Ingresos brutos anuales</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.ind.ingresoBrutoAnual)}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2">Impuesto SIMPLE ({SIMPLE_GROUPS[groupIndex].label})</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.simple.impuesto)}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2">Impuesto Renta Ordinaria</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.simple.ordinaria)}</td>
                  </tr>
                  <tr className="border-b border-border bg-muted/20 font-semibold">
                    <td className="px-4 py-2">Diferencia (Ordinaria - SIMPLE)</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.simple.diferencia)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm">
              {result.simple.diferencia > 0
                ? `SIMPLE ahorra ${formatCOP(result.simple.diferencia)} frente a Renta Ordinaria para este nivel de ingresos.`
                : result.simple.diferencia < 0
                  ? `Renta Ordinaria es mas favorable por ${formatCOP(Math.abs(result.simple.diferencia))}.`
                  : "Ambos regimenes resultan en el mismo impuesto."}
            </p>
          </CollapsibleSection>

          {/* ════ E. PROS Y CONTRAS ════ */}
          <CollapsibleSection title="Pros y Contras por Modalidad">
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Aspecto</th>
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Laboral</th>
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Integral</th>
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Independiente</th>
                  </tr>
                </thead>
                <tbody>
                  {PROS_CONTRAS.map((row) => (
                    <tr key={row.aspecto} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium">{row.aspecto}</td>
                      <td className="px-4 py-2">{row.laboral}</td>
                      <td className="px-4 py-2">{row.integral}</td>
                      <td className="px-4 py-2">{row.independiente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        </div>
      )}

      <div className="mt-6">
        <CalculatorSources articles={["383", "241", "905", "206"]} />
      </div>
    </>
  );
}

// ── Table helper components ──

function Row({
  label,
  lab,
  int_,
  ind,
  best,
  note,
}: {
  label: string;
  lab: number;
  int_: number | null;
  ind: number;
  best: number;
  note?: string;
}) {
  const bestColFn = (i: number) => (best === i ? "bg-muted/50" : "");
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-2">
        {label}
        {note && <span className="ml-1 text-xs text-muted-foreground">({note})</span>}
      </td>
      <td className={`px-4 py-2 text-right ${bestColFn(0)}`}>{formatCOP(lab)}</td>
      <td className={`px-4 py-2 text-right ${bestColFn(1)}`}>{int_ === null ? "N/A" : formatCOP(int_)}</td>
      <td className={`px-4 py-2 text-right ${bestColFn(2)}`}>{formatCOP(ind)}</td>
    </tr>
  );
}

function RowTotal({
  label,
  lab,
  int_,
  ind,
  best,
  highlight,
}: {
  label: string;
  lab: number;
  int_: number | null;
  ind: number;
  best: number;
  highlight?: boolean;
}) {
  const bestColFn = (i: number) => (best === i ? "bg-muted/50" : "");
  return (
    <tr className={`border-b border-border font-semibold ${highlight ? "bg-muted/20" : ""}`}>
      <td className="px-4 py-2">{label}</td>
      <td className={`px-4 py-2 text-right ${bestColFn(0)}`}>{formatCOP(lab)}</td>
      <td className={`px-4 py-2 text-right ${bestColFn(1)}`}>{int_ === null ? "N/A" : formatCOP(int_)}</td>
      <td className={`px-4 py-2 text-right ${bestColFn(2)}`}>{formatCOP(ind)}</td>
    </tr>
  );
}

function SimpleRow({
  label,
  vals,
  negative,
  isUVT,
}: {
  label: string;
  vals: [number, number | null, number];
  negative?: boolean;
  isUVT?: boolean;
}) {
  const fmt = (v: number | null) => {
    if (v === null) return "N/A";
    if (isUVT) return v.toFixed(2);
    return formatCOP(v);
  };
  return (
    <tr className="border-b border-border last:border-0">
      <td className={`px-4 py-2 ${negative ? "text-muted-foreground" : ""}`}>{label}</td>
      <td className="px-4 py-2 text-right">{fmt(vals[0])}</td>
      <td className="px-4 py-2 text-right">{fmt(vals[1])}</td>
      <td className="px-4 py-2 text-right">{fmt(vals[2])}</td>
    </tr>
  );
}

// ── Static data: Pros y contras ──

const PROS_CONTRAS = [
  {
    aspecto: "Estabilidad laboral",
    laboral: "Alta — contrato indefinido, despido con indemnizacion",
    integral: "Alta — mismas protecciones del contrato laboral",
    independiente: "Baja — sin vinculo laboral, terminacion libre",
  },
  {
    aspecto: "Seguridad social",
    laboral: "Empleador asume mayor parte",
    integral: "Empleador asume SS sobre 70%",
    independiente: "Independiente asume 100% de su SS",
  },
  {
    aspecto: "Prestaciones sociales",
    laboral: "Todas: cesantias, prima, vacaciones",
    integral: "Incluidas en el salario (factor 30%)",
    independiente: "No aplica",
  },
  {
    aspecto: "Costo empresa",
    laboral: "Mas alto (~52% sobre salario)",
    integral: "Medio (~17% sobre salario)",
    independiente: "Mas bajo (0% adicional, pago directo)",
  },
  {
    aspecto: "Retencion en la fuente",
    laboral: "Proc. 1 Art. 383 sobre salario",
    integral: "Proc. 1 Art. 383 sobre 70%",
    independiente: "Proc. 1 Art. 383 sobre honorario",
  },
  {
    aspecto: "IVA",
    laboral: "No aplica",
    integral: "No aplica",
    independiente: "Si supera 3,500 UVT anuales",
  },
  {
    aspecto: "Pensionado",
    laboral: "No cotiza pension, reduce costo",
    integral: "No cotiza pension sobre 70%",
    independiente: "No cotiza pension sobre 40%",
  },
];
