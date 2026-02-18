# CLI-C: Wave 2 — 3 Calculadoras Laborales + DateInput Component

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously.

## OBJECTIVE
Build 3 labor law calculators and 1 new shared DateInput component. Create ONLY NEW files. NEVER modify existing files.

## PROJECT
- Path: `/Users/cristianespinal/estatuto-tributario-rag`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Node/npm already installed. Do NOT run `npm install`.

## CRITICAL ANTI-CONFLICT RULES
1. **NEVER modify** any existing file. Not `tax-data.ts`, not `shared-inputs.tsx`, not ANY existing file.
2. **ONLY create** new files listed below.
3. Do NOT run `npm run build` or `git` commands.
4. You CAN run `npx tsc --noEmit` to type-check your files.

## FILES TO CREATE (and ONLY these)
```
src/config/tax-data-laboral.ts                  ← NEW config
src/components/calculators/date-input.tsx        ← NEW shared component
src/app/calculadoras/liquidacion-laboral/page.tsx ← Calculator 1
src/app/calculadoras/horas-extras/page.tsx       ← Calculator 2
src/app/calculadoras/retencion-salarios/page.tsx ← Calculator 3
```

## EXISTING IMPORTS (read-only)
```typescript
import { UVT_VALUES, CURRENT_UVT_YEAR, SMLMV_2026, AUXILIO_TRANSPORTE_2026, SALARIO_INTEGRAL_MIN_SMLMV,
  EMPLOYER_RATES, EMPLOYEE_RATES, RETENCION_SALARIOS_BRACKETS, LEY_2277_LIMITS } from "@/config/tax-data";
import { CurrencyInput, SelectInput, ToggleInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
```

## EXISTING CONSTANTS (from tax-data.ts — for reference, do NOT modify):
```
SMLMV_2026 = 1,750,905
AUXILIO_TRANSPORTE_2026 = 249,095
EMPLOYER_RATES = { salud: 0.085, pension: 0.12, arl: 0.00522,
  sena: 0.02, icbf: 0.03, ccf: 0.04,
  cesantias: 0.0833, intCesantias: 0.01, prima: 0.0833, vacaciones: 0.0417 }
EMPLOYEE_RATES = { salud: 0.04, pension: 0.05 }
RETENCION_SALARIOS_BRACKETS = [
  { from: 0, to: 95, rate: 0, base: 0 },
  { from: 95, to: 150, rate: 0.19, base: 0 },
  { from: 150, to: 360, rate: 0.28, base: 10 },
  { from: 360, to: 640, rate: 0.33, base: 69 },
  { from: 640, to: 945, rate: 0.35, base: 161 },
  { from: 945, to: 2_300, rate: 0.37, base: 268 },
  { from: 2_300, to: Infinity, rate: 0.39, base: 770 },
]
LEY_2277_LIMITS = { rentasExentasMaxUVT: 790, deduccionesExentasMaxUVT: 1_340, dependienteUVT: 72, maxDependientes: 4 }
```

## COMPONENT SIGNATURES (reference)
```typescript
<CurrencyInput id="id" label="Label" value={n} onChange={setN} />
<SelectInput id="id" label="Label" value={s} onChange={setS} options={[{value:"a",label:"A"}]} />
<ToggleInput label="Text" pressed={b} onToggle={setB} />
<NumberInput id="id" label="Label" value={n} onChange={setN} min={0} max={99} />
<CalculatorResult items={[{ label: "X", value: "$1,000", sublabel: "note" }]} />
<CalculatorSources articles={["64"]} />
```

## PAGE STRUCTURE PATTERN
```tsx
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}
```

## STYLE RULES
- 2-space indentation, double quotes, semicolons, `const` over `let`
- All UI text in Spanish, `"es-CO"` locale
- Tailwind CSS only, dark mode classes: `text-muted-foreground`, `border-border`, `bg-muted/50`
- Tables: `overflow-x-auto` wrapper for responsiveness
- Warnings: `text-yellow-600 dark:text-yellow-400`

---

## NEW COMPONENT: `src/components/calculators/date-input.tsx`

Create this shared DateInput component (used by labor calculators):

```typescript
"use client";

interface DateInputProps {
  id: string;
  label: string;
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (v: string) => void;
}

export function DateInput({ id, label, value, onChange }: DateInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
```

---

## CONFIG FILE: `src/config/tax-data-laboral.ts`

```typescript
// ── Laboral: Liquidacion, Horas Extras, Retencion Proc 1 — 2026 ──

/** Indemnizacion por despido sin justa causa — CST Art. 64 (Ley 789/2002 Art. 28) */
export const INDEMNIZACION_INDEFINIDO = {
  /** Salario < 10 SMLMV */
  bajo: { primerAno: 30, adicionalPorAno: 20 },
  /** Salario >= 10 SMLMV */
  alto: { primerAno: 20, adicionalPorAno: 15 },
  umbralSMLMV: 10,
} as const;

/** Indemnizacion contrato fijo — CST Art. 64 num. 3 */
export const INDEMNIZACION_FIJO_MIN_DIAS = 15;

/** Intereses sobre cesantias — Ley 50/1990 Art. 99 */
export const INTERES_CESANTIAS_RATE = 0.12; // 12% anual

/** Horas extras y recargos — CST Art. 168-170 + Ley 2466/2025 */
export const RECARGOS = {
  extraDiurna: 0.25,        // 25%
  extraNocturna: 0.75,      // 75%
  recargoNocturno: 0.35,    // 35% (solo el recargo)
} as const;

/** Recargo dominical/festivo progresivo — Ley 2466/2025 Art. 14 */
export const DOMINICAL_PROGRESIVO = [
  { desde: "2025-07-01", hasta: "2026-06-30", recargo: 0.80, label: "80% (Jul 2025 - Jun 2026)" },
  { desde: "2026-07-01", hasta: "2027-06-30", recargo: 0.90, label: "90% (Jul 2026 - Jun 2027)" },
  { desde: "2027-07-01", hasta: "9999-12-31", recargo: 1.00, label: "100% (Jul 2027 en adelante)" },
] as const;

/** Jornada laboral — Ley 2101/2021 (reduccion progresiva) */
export const JORNADA_SEMANAL = [
  { desde: "2024-07-16", hasta: "2025-07-15", horas: 46, divisor: 230 },
  { desde: "2025-07-16", hasta: "2026-07-15", horas: 44, divisor: 220 },
  { desde: "2026-07-16", hasta: "9999-12-31", horas: 42, divisor: 210 },
] as const;

/** Jornada nocturna — Ley 2466/2025 Art. 13: desde las 7:00 p.m. (antes 9:00 p.m.) */
export const JORNADA_NOCTURNA_INICIO = "19:00";

/** Retencion salarios Proc 1 — Art. 388 depuracion completa */
export const DEPURACION_LIMITS = {
  dependientePct: 0.10,
  dependienteMaxUVTMensual: 32.5, // 72 UVT / 12 months ≈ but actually the limit is separate
  medicinaPrepagadaMaxUVTMensual: 16,
  rentaExenta25Pct: 0.25,
  limiteGlobalPct: 0.40, // 40% del ingreso neto
} as const;
```

---

## CALCULATOR 1: Liquidacion de Contrato Laboral

**Route:** `/calculadoras/liquidacion-laboral/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Fecha de inicio del contrato | DateInput | NEW component |
| Fecha de terminacion | DateInput | |
| Salario mensual basico | CurrencyInput | |
| Tipo de contrato | SelectInput | "indefinido", "fijo", "obra_labor" |
| Motivo de terminacion | SelectInput | "renuncia", "mutuo_acuerdo", "despido_sin_justa", "despido_con_justa", "fin_termino" |
| Salario <= 2 SMLMV (aplica auxilio) | ToggleInput | Auto-calculate from salary |
| Fecha fin contrato fijo (si aplica) | DateInput | Only visible if tipo === "fijo" |

### Date Helpers
```typescript
function daysBetween(start: string, end: string): number {
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function diasEnSemestre(fechaInicio: string, fechaFin: string): number {
  // For prima: count days in current semester (Jan-Jun or Jul-Dec)
  const fin = new Date(fechaFin);
  const mes = fin.getMonth(); // 0-11
  const inicioSem = mes < 6
    ? new Date(fin.getFullYear(), 0, 1)
    : new Date(fin.getFullYear(), 6, 1);
  const start = new Date(fechaInicio) > inicioSem ? new Date(fechaInicio) : inicioSem;
  return Math.max(0, daysBetween(start.toISOString().split("T")[0], fechaFin));
}
```

### Calculation Logic
```
smlmv = SMLMV_2026
auxilio = salario <= 2 × smlmv ? AUXILIO_TRANSPORTE_2026 : 0
baseCesantiasPrima = salario + auxilio  // includes auxilio
baseVacaciones = salario               // does NOT include auxilio

diasTrabajados = daysBetween(fechaInicio, fechaTerminacion)
diasSemestre = diasEnSemestre(fechaInicio, fechaTerminacion) // for prima

// 1. Cesantias proporcionales
cesantias = (baseCesantiasPrima × diasTrabajados) / 360

// 2. Intereses sobre cesantias
interesesCesantias = (cesantias × diasTrabajados × INTERES_CESANTIAS_RATE) / 360

// 3. Prima proporcional (del semestre en curso)
prima = (baseCesantiasPrima × diasSemestre) / 360

// 4. Vacaciones compensadas
vacaciones = (baseVacaciones × diasTrabajados) / 720

// 5. Indemnizacion (only if despido_sin_justa)
indemnizacion = 0
If motivo === "despido_sin_justa":
  anosServicio = diasTrabajados / 360
  If tipo === "indefinido":
    If salario < INDEMNIZACION_INDEFINIDO.umbralSMLMV × smlmv:
      indemnizacion = (salario / 30) × INDEMNIZACION_INDEFINIDO.bajo.primerAno
      If anosServicio > 1:
        anosAdicionales = anosServicio - 1
        indemnizacion += (salario / 30) × INDEMNIZACION_INDEFINIDO.bajo.adicionalPorAno × anosAdicionales
    Else:
      indemnizacion = (salario / 30) × INDEMNIZACION_INDEFINIDO.alto.primerAno
      If anosServicio > 1:
        anosAdicionales = anosServicio - 1
        indemnizacion += (salario / 30) × INDEMNIZACION_INDEFINIDO.alto.adicionalPorAno × anosAdicionales
  If tipo === "fijo":
    diasRestantes = max(daysBetween(fechaTerminacion, fechaFinFijo), 0)
    indemnizacion = max((salario / 30) × diasRestantes, (salario / 30) × INDEMNIZACION_FIJO_MIN_DIAS)

totalLiquidacion = cesantias + interesesCesantias + prima + vacaciones + indemnizacion
```

### Output Sections
- **CalculatorResult**: Dias trabajados, Salario base, Auxilio transporte, Total liquidacion
- **Tabla desglose completo**:
  - Cesantias proporcionales | formula | valor
  - Intereses sobre cesantias | formula | valor
  - Prima proporcional | formula | valor
  - Vacaciones compensadas | formula | valor
  - Indemnizacion (if applicable) | formula | valor
  - **TOTAL LIQUIDACION** | | valor
- **Warning** if no indemnization: "No aplica indemnizacion: {motivo}. Solo aplica para despido sin justa causa."
- **CollapsibleSection "Tabla de Indemnizacion Art. 64 CST"**: Show the rules table
- **CollapsibleSection "Formulas Aplicadas"**: Show each formula with the actual numbers
- **CalculatorSources** articles: ["249", "306", "186", "64"]
  (Note: these are CST articles, not ET. Since CalculatorSources links to /articulo/, and the app contains ET articles, adjust the articles array to reference relevant ET articles if any, or use an empty array and add a manual note about CST articles.)

Actually, for CalculatorSources, since the app only has Estatuto Tributario articles, use an empty array and add a manual "Base legal" section:
```tsx
<div className="mt-6 text-sm text-muted-foreground">
  <p className="font-medium">Base legal:</p>
  <p>CST Art. 64 (indemnizacion), Art. 249 (cesantias), Art. 306 (prima), Art. 186 (vacaciones), Ley 50/1990 Art. 99 (intereses cesantias)</p>
</div>
```

---

## CALCULATOR 2: Horas Extras y Recargos

**Route:** `/calculadoras/horas-extras/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Salario mensual basico | CurrencyInput | |
| Periodo de calculo | SelectInput | "2025_h2" (Jul-Dec 2025), "2026_h1" (Jan-Jun 2026), "2026_h2" (Jul-Dec 2026), "2027_plus" (Jul 2027+) |
| Horas extra diurnas | NumberInput | min 0 |
| Horas extra nocturnas | NumberInput | min 0 |
| Horas recargo nocturno | NumberInput | min 0 |
| Horas dominical/festivo diurno | NumberInput | min 0 |
| Horas dominical/festivo nocturno | NumberInput | min 0 |
| Horas extra diurna dominical | NumberInput | min 0 |
| Horas extra nocturna dominical | NumberInput | min 0 |

### Calculation Logic
```
// Determine jornada and dominical recargo based on periodo
jornadaInfo = JORNADA_SEMANAL.find matching periodo
dominicalInfo = DOMINICAL_PROGRESIVO.find matching periodo
dominicalRecargo = dominicalInfo.recargo  // 0.80, 0.90, or 1.00

divisor = jornadaInfo.divisor  // 230, 220, or 210
valorHoraOrdinaria = salario / divisor

// Calculate each type
extraDiurnaVal = horasExtraDiurnas × valorHoraOrdinaria × (1 + RECARGOS.extraDiurna)  // ×1.25
extraNocturnaVal = horasExtraNocturnas × valorHoraOrdinaria × (1 + RECARGOS.extraNocturna)  // ×1.75
recargoNocturnoVal = horasRecargoNocturno × valorHoraOrdinaria × RECARGOS.recargoNocturno  // ×0.35 (only surcharge)

domDiurnoVal = horasDomDiurno × valorHoraOrdinaria × (1 + dominicalRecargo)
domNocturnoVal = horasDomNocturno × valorHoraOrdinaria × (1 + dominicalRecargo + RECARGOS.recargoNocturno)
extraDiurnaDomVal = horasExtraDiurnaDom × valorHoraOrdinaria × (1 + dominicalRecargo + RECARGOS.extraDiurna)
extraNocturnaDomVal = horasExtraNocturnaDom × valorHoraOrdinaria × (1 + dominicalRecargo + RECARGOS.extraNocturna)

totalExtras = sum of all
```

### Output Sections
- **CalculatorResult**: Valor hora ordinaria, Total horas extras y recargos, Jornada semanal vigente
- **Tabla completa**: 7 rows (one per type):
  - Tipo | Factor | Horas | Valor hora | Subtotal
- **Totals row**
- **CollapsibleSection "Jornada Laboral Progresiva — Ley 2101/2021"**: Timeline table
- **CollapsibleSection "Recargo Dominical Progresivo — Ley 2466/2025"**: Timeline table
- **Note**: "Jornada nocturna: desde las 7:00 p.m. (Ley 2466/2025 Art. 13, vigente desde 25 dic 2025)"
- **Manual base legal section** (CST articles, not ET)

---

## CALCULATOR 3: Retencion en la Fuente Salarios — Procedimiento 1 Detallado

**Route:** `/calculadoras/retencion-salarios/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Ingreso mensual bruto laboral | CurrencyInput | All salary payments |
| Aportes obligatorios salud (4%) | CurrencyInput | Pre-fill: ingreso × 0.04 |
| Aportes obligatorios pension (4%) | CurrencyInput | Pre-fill: ingreso × 0.04 |
| Aportes voluntarios pension | CurrencyInput | Optional, 0 default |
| Aportes AFC / AVC | CurrencyInput | Optional, 0 default |
| Numero de dependientes | NumberInput | 0-4 |
| Intereses de vivienda mensual | CurrencyInput | Optional |
| Medicina prepagada mensual | CurrencyInput | Optional |

### Calculation Logic (Art. 388 Full Depuration)
```
uvt = UVT_VALUES[CURRENT_UVT_YEAR]  // 52,374

// Step 1: Total pagos laborales
totalPagos = ingresoBruto

// Step 2: INCRNGO (no constituyen renta)
incrngo = aporteSalud + aportePension  // mandatory SS contributions
// Also: aportes voluntarios pensión up to non-taxable limit
// Simplified: mandatory SS only for INCRNGO

// Step 3: Subtotal 1
subtotal1 = totalPagos - incrngo

// Step 4: Deducciones Art. 387
dependienteDeduccion = min(
  subtotal1 × DEPURACION_LIMITS.dependientePct,
  DEPURACION_LIMITS.dependienteMaxUVTMensual × uvt
) × min(numDependientes, 4) / max(numDependientes, 1)
// Actually: deduccion = min(10% of total income, 32.5 UVT/month) regardless of number of dependents
// Just having 1+ dependents activates it
dependienteDeduccion = numDependientes > 0
  ? min(subtotal1 × 0.10, 32.5 × uvt)
  : 0

medicinaLimitada = min(medicinaPrepagada, DEPURACION_LIMITS.medicinaPrepagadaMaxUVTMensual × uvt)
totalDeducciones = dependienteDeduccion + interesesVivienda + medicinaLimitada

// Step 5: Aportes voluntarios (pension + AFC)
totalVoluntarios = aportesVoluntariosPension + aportesAFC

// Step 6: Renta exenta 25%
subtotal2 = subtotal1 - totalDeducciones - totalVoluntarios
rentaExenta25 = subtotal2 × DEPURACION_LIMITS.rentaExenta25Pct

// Step 7: Global limit 40%
totalDeduccionesExentas = totalDeducciones + totalVoluntarios + rentaExenta25
limiteGlobal = subtotal1 × DEPURACION_LIMITS.limiteGlobalPct  // 40%
// Also limited to 1,340 UVT / 12 monthly
limiteUVTMensual = (LEY_2277_LIMITS.deduccionesExentasMaxUVT × uvt) / 12

totalAplicado = min(totalDeduccionesExentas, limiteGlobal, limiteUVTMensual)

// Step 8: Base gravable
baseGravable = max(0, subtotal1 - totalAplicado)
baseGravableUVT = baseGravable / uvt

// Step 9: Apply Art. 383 table
retencionUVT = 0
for bracket in RETENCION_SALARIOS_BRACKETS (from highest to lowest):
  if baseGravableUVT > bracket.from:
    retencionUVT = (baseGravableUVT - bracket.from) × bracket.rate + bracket.base
    break

retencionCOP = retencionUVT × uvt
tasaEfectiva = ingresoBruto > 0 ? retencionCOP / ingresoBruto : 0
```

### Output Sections
- **CalculatorResult**: Base gravable, Base en UVT, Retencion mensual, Tasa efectiva
- **Tabla de depuracion completa** (most important — the full chain):
  - (+) Total pagos laborales | valor
  - (-) Aportes obligatorios SS (INCRNGO) | valor
  - (=) Subtotal 1 | valor
  - (-) Dependientes (10%, max 32.5 UVT) | valor
  - (-) Intereses vivienda | valor
  - (-) Medicina prepagada (max 16 UVT) | valor
  - (-) Aportes voluntarios pension | valor
  - (-) Aportes AFC/AVC | valor
  - (-) Renta exenta 25% | valor
  - **Subtotal deducciones + exentas** | valor
  - **Limite global 40%** | valor
  - **Limite 1,340 UVT/12 mensual** | valor
  - **Total aplicado (menor de los 3)** | valor
  - **(=) Base gravable** | valor
  - **Base gravable en UVT** | valor
  - **Retencion en la fuente** | valor
- **Warning** if limit was applied: "Las deducciones y rentas exentas fueron limitadas al {X}% por {razon}"
- **CollapsibleSection "Tabla Art. 383"**: Show bracket table with current highlighted
- **CollapsibleSection "Limites Ley 2277/2022"**: Explain the 40% / 1,340 UVT limits
- **CalculatorSources** articles: ["383", "385", "387", "388", "206"]

---

## VERIFICATION
```bash
npx tsc --noEmit src/config/tax-data-laboral.ts src/components/calculators/date-input.tsx src/app/calculadoras/liquidacion-laboral/page.tsx src/app/calculadoras/horas-extras/page.tsx src/app/calculadoras/retencion-salarios/page.tsx
```
Fix any TypeScript errors. Do NOT run lint, build, or git commands.
