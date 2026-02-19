"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Baby, Info } from "lucide-react";
import { CurrencyInput, SelectInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import {
  LICENCIA_MATERNIDAD,
  LICENCIA_PATERNIDAD_PROGRESIVA,
  LICENCIA_COMPARTIDA,
} from "@/config/tax-data-laboral-sprint2";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export default function LicenciaMaternidadPage() {
  const [tipoLicencia, setTipoLicencia] = useState("maternidad");
  const [salarioMensual, setSalarioMensual] = useState(0);
  const [fechaParto, setFechaParto] = useState(new Date().toISOString().split("T")[0]);
  const [semanasTransferir, setSemanasTransferir] = useState(0);

  const results = useMemo(() => {
    let diasLicencia = 0;
    let semanasLicencia = 0;
    let nota = "";
    let diasMadre = 0;
    let diasPadre = 0;

    if (tipoLicencia === "maternidad") {
      semanasLicencia = LICENCIA_MATERNIDAD.semanas;
      diasLicencia = LICENCIA_MATERNIDAD.dias;
    } else if (tipoLicencia === "paternidad") {
      const fecha = new Date(fechaParto);
      const config = LICENCIA_PATERNIDAD_PROGRESIVA.find(c => {
        const d = new Date(c.desde);
        const h = new Date(c.hasta);
        return fecha >= d && fecha <= h;
      }) || LICENCIA_PATERNIDAD_PROGRESIVA[2];

      semanasLicencia = config.semanas;
      diasLicencia = config.dias;
      nota = `Ley 2365 de 2024: ${semanasLicencia} semanas para partos en esta fecha.`;
    } else if (tipoLicencia === "compartida") {
      const transferidas = Math.min(semanasTransferir, LICENCIA_COMPARTIDA.semanasTransferibles);

      // Determine padre base days using LICENCIA_PATERNIDAD_PROGRESIVA
      const fecha = new Date(fechaParto);
      const configPadre = LICENCIA_PATERNIDAD_PROGRESIVA.find(c => {
        const d = new Date(c.desde);
        const h = new Date(c.hasta);
        return fecha >= d && fecha <= h;
      }) || LICENCIA_PATERNIDAD_PROGRESIVA[2];

      diasMadre = LICENCIA_MATERNIDAD.dias - transferidas * 7;
      diasPadre = configPadre.dias + transferidas * 7;
      semanasLicencia = LICENCIA_MATERNIDAD.semanas - transferidas;
      diasLicencia = diasMadre;
      nota = `Madre: ${Math.round(diasMadre / 7)} semanas (${diasMadre} dias) | Padre: ${Math.round(diasPadre / 7)} semanas (${diasPadre} dias).`;
    }

    const valorDiario = salarioMensual / 30;
    const valorLicencia = valorDiario * diasLicencia;

    // Calculate dates if fecha is provided
    let fechaInicio = "";
    let fechaFin = "";
    if (fechaParto && tipoLicencia === "maternidad") {
      // Maternity starts ~2 weeks before due date (1 week mandatory before birth)
      const partoDate = new Date(fechaParto);
      const inicio = new Date(partoDate);
      inicio.setDate(inicio.getDate() - 14);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + diasLicencia - 1);
      fechaInicio = inicio.toLocaleDateString("es-CO");
      fechaFin = fin.toLocaleDateString("es-CO");
    } else if (fechaParto && tipoLicencia === "paternidad") {
      const partoDate = new Date(fechaParto);
      const fin = new Date(partoDate);
      fin.setDate(fin.getDate() + diasLicencia - 1);
      fechaInicio = partoDate.toLocaleDateString("es-CO");
      fechaFin = fin.toLocaleDateString("es-CO");
    }

    return {
      semanasLicencia,
      diasLicencia,
      valorDiario,
      valorLicencia,
      nota,
      diasMadre,
      diasPadre,
      fechaInicio,
      fechaFin,
    };
  }, [tipoLicencia, salarioMensual, fechaParto, semanasTransferir]);

  const resultItems = [
    { label: "Semanas de Licencia", value: `${results.semanasLicencia} Semanas` },
    { label: "Dias Totales", value: `${results.diasLicencia} Dias` },
    { label: "Valor Diario", value: formatCOP(results.valorDiario) },
    {
      label: "Valor Total del Auxilio",
      value: formatCOP(results.valorLicencia),
      sublabel: "Pagado por la EPS / Empleador",
    },
  ];

  if (results.fechaInicio && results.fechaFin) {
    resultItems.push(
      { label: "Fecha Estimada Inicio", value: results.fechaInicio },
      { label: "Fecha Estimada Fin", value: results.fechaFin },
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="heading-serif text-3xl">Licencia de Maternidad y Paternidad</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Calcule el tiempo y el auxilio economico por el nacimiento de su hijo.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold border-b pb-2 flex items-center gap-2">
              <Baby className="h-4 w-4 text-foreground/70" /> Informacion de la Licencia
            </h3>

            <SelectInput
              id="tipo"
              label="Tipo de Licencia"
              value={tipoLicencia}
              onChange={setTipoLicencia}
              options={[
                { value: "maternidad", label: "Maternidad (Madre)" },
                { value: "paternidad", label: "Paternidad (Padre)" },
                { value: "compartida", label: "Parental Compartida" },
              ]}
            />

            <CurrencyInput id="salario" label="Salario Mensual" value={salarioMensual} onChange={setSalarioMensual} />

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Fecha Probable de Parto</label>
              <input
                type="date"
                value={fechaParto}
                onChange={(e) => setFechaParto(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {tipoLicencia === "compartida" && (
              <NumberInput
                id="transferir"
                label="Semanas a transferir al padre (Max 6)"
                value={semanasTransferir}
                onChange={setSemanasTransferir}
                min={0}
                max={6}
              />
            )}
          </div>

          <div className="text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 text-xs flex gap-3">
            <Info className="h-4 w-4 shrink-0 text-foreground/70" />
            <div className="space-y-2">
              <p><strong>Maternidad:</strong> 18 semanas remuneradas con el 100% del salario.</p>
              <p><strong>Paternidad:</strong> Aumenta progresivamente hasta llegar a 6 semanas en 2026 (Ley 2365/2024).</p>
              <p><strong>Compartida:</strong> Las ultimas 6 semanas de la licencia de la madre pueden ser distribuidas entre los dos padres.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CalculatorResult items={resultItems} />

          {results.nota && (
            <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-sm font-medium">
              {results.nota}
            </div>
          )}

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Requisitos Legales</h3>
            <ul className="text-xs space-y-3 text-muted-foreground list-disc pl-4">
              <li>Estar afiliado a salud como cotizante.</li>
              <li>Haber cotizado durante el periodo de gestacion (proporcional si es menor).</li>
              <li>Presentar el certificado de nacido vivo o registro civil ante el empleador/EPS dentro de los 30 dias siguientes al parto.</li>
              <li>En licencia compartida, el padre no debe tener antecedentes de violencia intrafamiliar.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CalculatorSources articles={["Ley 1822/2017", "Ley 2114/2021", "Ley 2365/2024"]} />
      </div>
    </div>
  );
}
