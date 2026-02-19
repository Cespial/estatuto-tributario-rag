"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock } from "lucide-react";
import { CurrencyInput, SelectInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { RECARGOS, DOMINICAL_PROGRESIVO, JORNADA_SEMANAL } from "@/config/tax-data-laboral";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

export default function HorasExtrasPage() {
  const [salario, setSalario] = useState(2500000);
  const [periodo, setPeriodo] = useState("2026_h1");
  
  const [hExtraDiurna, setHExtraDiurna] = useState(0);
  const [hExtraNocturna, setHExtraNocturna] = useState(0);
  const [hRecargoNocturno, setHRecargoNocturno] = useState(0);
  const [hDomDiurno, setHDomDiurno] = useState(0);
  const [hDomNocturno, setHDomNocturno] = useState(0);
  const [hExtraDiurnaDom, setHExtraDiurnaDom] = useState(0);
  const [hExtraNocturnaDom, setHExtraNocturnaDom] = useState(0);

  const results = useMemo(() => {
    // Buscar info de jornada según periodo
    let jornadaInfo;
    if (periodo === "2025_h2") {
      jornadaInfo = JORNADA_SEMANAL[0]; // 46h (en realidad h2 2024 - h1 2025) - Adjusting to matching logical mapping
    } else if (periodo === "2026_h1") {
      jornadaInfo = JORNADA_SEMANAL[1]; // 44h
    } else if (periodo === "2026_h2") {
      jornadaInfo = JORNADA_SEMANAL[2]; // 42h (Starts July 2026)
    } else {
      jornadaInfo = JORNADA_SEMANAL[2]; // 42h
    }

    // Dominical recargo
    let domRecargo = 0.75;
    if (periodo === "2025_h2") domRecargo = 0.80;
    else if (periodo === "2026_h1") domRecargo = 0.80;
    else if (periodo === "2026_h2") domRecargo = 0.90; // Starting July 2026
    else if (periodo === "2027_plus") domRecargo = 1.00;

    const divisor = jornadaInfo.divisor;
    const valorHoraOrdinaria = salario / divisor;

    const calculate = (hours: number, factor: number) => hours * valorHoraOrdinaria * factor;

    const details = [
      { label: "Extra Diurna", factor: 1 + RECARGOS.extraDiurna, hours: hExtraDiurna, value: calculate(hExtraDiurna, 1 + RECARGOS.extraDiurna) },
      { label: "Extra Nocturna", factor: 1 + RECARGOS.extraNocturna, hours: hExtraNocturna, value: calculate(hExtraNocturna, 1 + RECARGOS.extraNocturna) },
      { label: "Recargo Nocturno", factor: RECARGOS.recargoNocturno, hours: hRecargoNocturno, value: calculate(hRecargoNocturno, RECARGOS.recargoNocturno) },
      { label: "Dominical/Festivo Diurno", factor: 1 + domRecargo, hours: hDomDiurno, value: calculate(hDomDiurno, 1 + domRecargo) },
      { label: "Dominical/Festivo Nocturno", factor: 1 + domRecargo + RECARGOS.recargoNocturno, hours: hDomNocturno, value: calculate(hDomNocturno, 1 + domRecargo + RECARGOS.recargoNocturno) },
      { label: "Extra Diurna Dominical", factor: 1 + domRecargo + RECARGOS.extraDiurna, hours: hExtraDiurnaDom, value: calculate(hExtraDiurnaDom, 1 + domRecargo + RECARGOS.extraDiurna) },
      { label: "Extra Nocturna Dominical", factor: 1 + domRecargo + RECARGOS.extraNocturna, hours: hExtraNocturnaDom, value: calculate(hExtraNocturnaDom, 1 + domRecargo + RECARGOS.extraNocturna) },
    ];

    const totalExtras = details.reduce((acc, curr) => acc + curr.value, 0);

    return {
      valorHoraOrdinaria,
      totalExtras,
      jornada: jornadaInfo.horas,
      domRecargo: Math.round(domRecargo * 100) + "%",
      details
    };
  }, [salario, periodo, hExtraDiurna, hExtraNocturna, hRecargoNocturno, hDomDiurno, hDomNocturno, hExtraDiurnaDom, hExtraNocturnaDom]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a calculadoras
        </Link>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Horas Extras y Recargos</h1>
        <p className="mb-10 text-muted-foreground">Calcula recargos según la Reforma Laboral (Ley 2466/2025) y reducción de jornada (Ley 2101/2021).</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <CurrencyInput id="salario" label="Salario mensual básico" value={salario} onChange={setSalario} />
          
          <SelectInput 
            id="periodo" 
            label="Periodo de cálculo" 
            value={periodo} 
            onChange={setPeriodo} 
            options={[
              { value: "2025_h2", label: "Segundo Semestre 2025 (80% dom / 44h)" },
              { value: "2026_h1", label: "Primer Semestre 2026 (80% dom / 44h)" },
              { value: "2026_h2", label: "Segundo Semestre 2026 (90% dom / 42h)" },
              { value: "2027_plus", label: "2027 en adelante (100% dom / 42h)" },
            ]} 
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput id="hed" label="Extra Diurna (1.25)" value={hExtraDiurna} onChange={setHExtraDiurna} min={0} />
            <NumberInput id="hen" label="Extra Nocturna (1.75)" value={hExtraNocturna} onChange={setHExtraNocturna} min={0} />
            <NumberInput id="rn" label="Recargo Nocturno (0.35)" value={hRecargoNocturno} onChange={setHRecargoNocturno} min={0} />
            <NumberInput id="dfd" label="Dom/Fest Diurno" value={hDomDiurno} onChange={setHDomDiurno} min={0} />
            <NumberInput id="dfn" label="Dom/Fest Nocturno" value={hDomNocturno} onChange={setHDomNocturno} min={0} />
            <NumberInput id="edd" label="Extra Diurna Dom" value={hExtraDiurnaDom} onChange={setHExtraDiurnaDom} min={0} />
            <NumberInput id="end" label="Extra Nocturna Dom" value={hExtraNocturnaDom} onChange={setHExtraNocturnaDom} min={0} />
          </div>
        </div>

        <div className="space-y-6">
          <CalculatorResult 
            items={[
              { label: "Valor Hora Ordinaria", value: formatCOP(results.valorHoraOrdinaria) },
              { label: "Jornada Semanal", value: `${results.jornada} horas` },
              { label: "Total Recargos", value: formatCOP(results.totalExtras) },
            ]} 
          />

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-2 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-2 text-center text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Factor</th>
                  <th className="px-4 py-2 text-center text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Horas</th>
                  <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.details.map((row, i) => (
                  <tr key={i} className={row.hours > 0 ? "bg-muted/50" : ""}>
                    <td className="px-4 py-2">{row.label}</td>
                    <td className="px-4 py-2 text-center text-xs text-muted-foreground">{row.factor.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center font-mono">{row.hours}</td>
                    <td className="px-4 py-2 text-right">{formatCOP(row.value)}</td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-bold">
                  <td className="px-4 py-3" colSpan={3}>TOTAL EXTRAS Y RECARGOS</td>
                  <td className="px-4 py-3 text-right text-foreground">{formatCOP(results.totalExtras)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
            <Clock className="h-4 w-4 shrink-0 text-foreground/70" />
            <div>
              <p className="font-semibold">Nota sobre Jornada Nocturna:</p>
              <p>Inicia a las 7:00 p.m. (Ley 2466/2025 Art. 13, vigente desde el 25 de diciembre de 2025).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <CollapsibleSection title="Jornada Laboral Progresiva (Ley 2101/2021)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2">Periodo</th>
                  <th className="px-3 py-2 text-center">Horas Semanales</th>
                  <th className="px-3 py-2 text-center">Divisor Mensual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                {JORNADA_SEMANAL.map((j, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">Desde {j.desde}</td>
                    <td className="px-3 py-2 text-center">{j.horas}h</td>
                    <td className="px-3 py-2 text-center">{j.divisor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Recargo Dominical Progresivo (Ley 2466/2025)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2">Periodo</th>
                  <th className="px-3 py-2 text-center">Recargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                {DOMINICAL_PROGRESIVO.map((d, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{d.label}</td>
                    <td className="px-3 py-2 text-center">{Math.round(d.recargo * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">Base legal:</p>
          <p>CST Art. 168 (recargos), Ley 2101 de 2021 (jornada), Ley 2466 de 2025 Reforma Laboral (jornada nocturna y dominical).</p>
        </div>
      </div>
    </div>
  );
}
