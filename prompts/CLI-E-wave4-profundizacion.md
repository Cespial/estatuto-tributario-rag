# CLI-E: Wave 4 — 6 Calculadoras de Profundizacion

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously.

## OBJECTIVE
Build 6 calculators. Create ONLY NEW files. NEVER modify existing files.

## PROJECT
- Path: `/Users/cristianespinal/estatuto-tributario-rag`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4

## CRITICAL ANTI-CONFLICT RULES
1. **NEVER modify** any existing file.
2. **ONLY create** new files listed below.
3. Do NOT run `npm run build` or `git` commands.

## FILES TO CREATE
```
src/config/tax-data-wave4.ts
src/app/calculadoras/intereses-mora/page.tsx
src/app/calculadoras/simple/page.tsx
src/app/calculadoras/beneficio-auditoria/page.tsx
src/app/calculadoras/pension/page.tsx
src/app/calculadoras/depreciacion/page.tsx
src/app/calculadoras/consumo/page.tsx
```

## EXISTING IMPORTS (read-only)
```typescript
import { UVT_VALUES, CURRENT_UVT_YEAR, SMLMV_2026, SIMPLE_GROUPS, SIMPLE_BRACKETS } from "@/config/tax-data";
import { CurrencyInput, SelectInput, ToggleInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
```

## EXISTING SIMPLE DATA (from tax-data.ts):
```
SIMPLE_GROUPS = [
  { id: 1, label: "Grupo 1: Tiendas, mini y micromercados" },
  { id: 2, label: "Grupo 2: Comerciales, industriales" },
  { id: 3, label: "Grupo 3: Servicios profesionales, consultoria" },
  { id: 4, label: "Grupo 4: Expendio comidas y bebidas" },
  { id: 5, label: "Grupo 5: Educacion y salud" },
]
SIMPLE_BRACKETS = [
  { from: 0,      to: 6_000,   rates: [0.017, 0.032, 0.059, 0.032, 0.019] },
  { from: 6_000,  to: 15_000,  rates: [0.019, 0.038, 0.073, 0.038, 0.025] },
  { from: 15_000, to: 30_000,  rates: [0.054, 0.039, 0.120, 0.039, 0.042] },
  { from: 30_000, to: 100_000, rates: [0.067, 0.052, 0.145, 0.052, 0.052] },
]
```

## PAGE/TABLE/STYLE PATTERNS — Same as other CLIs:
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
// Page pattern: Link back to /calculadoras, h1, inputs in mb-6, useMemo for calc, results, CalculatorSources
```

---

## CONFIG FILE: `src/config/tax-data-wave4.ts`

```typescript
// ── Wave 4: Intereses Mora, SIMPLE, Auditoria, Pension, Depreciacion, Consumo — 2026 ──

/** Intereses moratorios DIAN — Art. 634-635 ET
 *  Tasa = equivalente diario de tasa de usura para credito de consumo
 *  Tasa efectiva anual usura vigente al momento (aproximada, cambia trimestralmente) */
export const INTERES_MORA_RATES = [
  { desde: "2025-10-01", hasta: "2025-12-31", tasaEA: 0.2683, label: "26.83% EA (Oct-Dic 2025)" },
  { desde: "2026-01-01", hasta: "2026-03-31", tasaEA: 0.2567, label: "25.67% EA (Ene-Mar 2026)" },
  { desde: "2026-04-01", hasta: "2026-06-30", tasaEA: 0.2450, label: "24.50% EA (Abr-Jun 2026)" },
  { desde: "2026-07-01", hasta: "2026-09-30", tasaEA: 0.2350, label: "23.50% EA (Jul-Sep 2026)" },
  { desde: "2026-10-01", hasta: "2026-12-31", tasaEA: 0.2350, label: "23.50% EA (Oct-Dic 2026)" },
] as const;

/** Beneficio de auditoria — Art. 689-3 ET (vigente 2022-2026) */
export const BENEFICIO_AUDITORIA = {
  incremento6Meses: 0.35,   // 35% incremento → firmeza 6 meses
  incremento12Meses: 0.25,  // 25% incremento → firmeza 12 meses
  impuestoMinUVT: 71,       // Impuesto neto >= 71 UVT para aplicar
  vigencia: "2022-2026",
} as const;

/** Pension — Ley 100/1993, Ley 797/2003, Ley 2381/2024 */
export const PENSION_REQUISITOS = {
  edadHombreActual: 62,
  edadMujerActual: 57,
  semanasBase: 1300,
} as const;

/** Reduccion semanas mujeres — Ley 2381/2024 (vigente desde 1 ene 2026) */
export const SEMANAS_MUJERES_PROGRESIVO = [
  { anio: 2025, semanas: 1300 },
  { anio: 2026, semanas: 1250 },
  { anio: 2027, semanas: 1200 },
  { anio: 2028, semanas: 1150 },
  { anio: 2029, semanas: 1100 },
  { anio: 2030, semanas: 1050 },
  { anio: 2031, semanas: 1000 },
  { anio: 2032, semanas: 1000 },
  { anio: 2033, semanas: 1000 },
  { anio: 2034, semanas: 1000 },
  { anio: 2035, semanas: 1000 },
  { anio: 2036, semanas: 1000 },
] as const;

/** Depreciacion fiscal — Art. 137 ET */
export const DEPRECIACION_TASAS = [
  { tipo: "edificios", label: "Edificaciones y construcciones", tasaMax: 0.0222, vidaUtil: 45 },
  { tipo: "maquinaria", label: "Maquinaria y equipo", tasaMax: 0.10, vidaUtil: 10 },
  { tipo: "muebles", label: "Muebles y enseres", tasaMax: 0.10, vidaUtil: 10 },
  { tipo: "vehiculos", label: "Equipo de transporte", tasaMax: 0.10, vidaUtil: 10 },
  { tipo: "computadores", label: "Equipo de computacion y comunicacion", tasaMax: 0.20, vidaUtil: 5 },
  { tipo: "redes", label: "Redes de procesamiento de datos", tasaMax: 0.20, vidaUtil: 5 },
  { tipo: "semovientes", label: "Semovientes productivos", tasaMax: 0.10, vidaUtil: 10 },
] as const;

/** Impuesto nacional al consumo — Art. 512-1 ET */
export const CONSUMO_TARIFAS = [
  { tipo: "restaurantes", label: "Servicio de restaurante y bares", tarifa: 0.08, articulo: "512-1" },
  { tipo: "telefonia", label: "Servicio de telefonia movil", tarifa: 0.04, articulo: "512-2" },
  { tipo: "vehiculos_bajo", label: "Vehiculos (menos de USD 30,000)", tarifa: 0.08, articulo: "512-3" },
  { tipo: "vehiculos_alto", label: "Vehiculos (USD 30,000 o mas)", tarifa: 0.16, articulo: "512-3" },
  { tipo: "motos_alto", label: "Motocicletas > 200cc", tarifa: 0.08, articulo: "512-3", notas: "Puede aumentar a 19% por Dto 1474" },
  { tipo: "aeronaves", label: "Aeronaves, botes y similares", tarifa: 0.16, articulo: "512-4" },
] as const;
```

---

## CALCULATOR 1: Intereses Moratorios DIAN

**Route:** `/calculadoras/intereses-mora/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Valor de la deuda tributaria | CurrencyInput | |
| Fecha de vencimiento | Input type date (use native HTML, no import needed) | |
| Fecha de pago | Input type date | |

### Calculation Logic
```
diasMora = daysBetween(fechaVencimiento, fechaPago)
If diasMora <= 0: no interest

// Find applicable rate periods between the two dates
// For simplicity, use the rate that covers most of the period
// More accurate: split by quarters and apply each rate

// Simplified approach (acceptable):
tasaEA = find rate for fechaPago quarter from INTERES_MORA_RATES
tasaDiaria = (1 + tasaEA)^(1/365) - 1
intereses = deuda × tasaDiaria × diasMora

// Total to pay
totalPagar = deuda + intereses
```

### Output: CalculatorResult + table showing calculation breakdown, rate periods

### Articles: ["634", "635"]

---

## CALCULATOR 2: Regimen SIMPLE Detallado

**Route:** `/calculadoras/simple/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Ingreso bruto anual | CurrencyInput | |
| Grupo de actividad economica | SelectInput | From SIMPLE_GROUPS |
| Tarifa ICA del municipio (por mil) | NumberInput | Default 0, for consolidated calculation |

### Calculation Logic
```
uvt = UVT_VALUES[CURRENT_UVT_YEAR]
ingresoUVT = ingresoAnual / uvt
groupIndex = selectedGroup - 1

// Progressive calculation across brackets
impuestoUVT = 0
remaining = ingresoUVT
for bracket in SIMPLE_BRACKETS:
  if remaining <= 0: break
  taxable = min(remaining, bracket.to - bracket.from)
  impuestoUVT += taxable × bracket.rates[groupIndex]
  remaining -= taxable

impuestoCOP = impuestoUVT × uvt

// ICA consolidated (if applicable)
icaConsolidado = ingresoAnual × (tarifaICA / 1000)

// Comparison with Renta Ordinaria (simplified)
// Use Art. 241 brackets for comparison (import RENTA_BRACKETS)
// ... or compute simplified estimate

tasaEfectivaSIMPLE = ingresoAnual > 0 ? impuestoCOP / ingresoAnual : 0

// Validation: max 100,000 UVT
if ingresoUVT > 100_000: warning "Supera el tope de 100,000 UVT para SIMPLE"
```

### Output: CalculatorResult, progressive breakdown table by bracket, comparison vs ordinario, articles: ["903", "905", "908"]

---

## CALCULATOR 3: Beneficio de Auditoria

**Route:** `/calculadoras/beneficio-auditoria/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Impuesto neto de renta ano actual | CurrencyInput | |
| Impuesto neto de renta ano anterior | CurrencyInput | |

### Calculation Logic
```
uvt = UVT_VALUES[CURRENT_UVT_YEAR]
impuestoMinimo = BENEFICIO_AUDITORIA.impuestoMinUVT × uvt  // 71 UVT

if impuestoActual < impuestoMinimo:
  resultado = "No aplica: impuesto < 71 UVT"
else:
  incremento = (impuestoActual - impuestoAnterior) / impuestoAnterior
  if incremento >= BENEFICIO_AUDITORIA.incremento6Meses:  // >= 35%
    resultado = "Firmeza en 6 meses"
  elif incremento >= BENEFICIO_AUDITORIA.incremento12Meses:  // >= 25%
    resultado = "Firmeza en 12 meses"
  else:
    resultado = "No aplica beneficio (incremento insuficiente)"
```

### Output: CalculatorResult showing increment %, applicable benefit, comparison table
### Articles: ["689-3"]

---

## CALCULATOR 4: Verificador Requisitos de Pension

**Route:** `/calculadoras/pension/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Genero | SelectInput | "hombre", "mujer" |
| Fecha de nacimiento | Input type date | |
| Semanas cotizadas a la fecha | NumberInput | |
| Ano estimado de retiro | NumberInput | min: current year |

### Calculation Logic
```
edadActual = calculateAge(fechaNacimiento)
edadRequerida = genero === "hombre" ? 62 : 57

// Weeks required
if genero === "hombre":
  semanasRequeridas = 1300
else:
  // Progressive reduction for women
  entry = SEMANAS_MUJERES_PROGRESIVO.find(e => e.anio === anoRetiro)
  semanasRequeridas = entry ? entry.semanas : 1000 // default to minimum after 2031

cumpleEdad = edadActual >= edadRequerida || (calculateAgeAt(fechaNacimiento, anoRetiro) >= edadRequerida)
cumpleSemanas = semanasCotizadas >= semanasRequeridas
semanasRestantes = max(0, semanasRequeridas - semanasCotizadas)
anosRestantes = semanasRestantes / 52

// Year when age requirement met
anoEdad = fechaNacimiento year + edadRequerida
```

### Output: Big result (cumple / no cumple), breakdown: edad actual vs requerida, semanas vs requeridas, semanas faltantes, año estimado cumplimiento
### CollapsibleSection: tabla de semanas mujeres por año (Ley 2381/2024)
### Note: "Reforma pensional Ley 2381/2024 vigente desde 1 julio 2025. Sistema de 4 pilares."
### Manual base legal (not ET articles): Ley 100/1993, Ley 797/2003, Ley 2381/2024

---

## CALCULATOR 5: Depreciacion Fiscal

**Route:** `/calculadoras/depreciacion/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Tipo de activo | SelectInput | From DEPRECIACION_TASAS |
| Costo de adquisicion | CurrencyInput | |
| Valor residual | CurrencyInput | Default 0 |
| Metodo | SelectInput | "linea_recta", "reduccion_saldos" |

### Calculation Logic
```
selectedType = DEPRECIACION_TASAS.find(t => t.tipo === tipo)
baseDepreciable = costo - valorResidual
vidaUtil = selectedType.vidaUtil

if metodo === "linea_recta":
  depreciacionAnual = baseDepreciable / vidaUtil
  // Generate table: Año | Dep. anual | Dep. acumulada | Valor en libros
  tabla = []
  for year 1 to vidaUtil:
    acumulada = depreciacionAnual × year
    libros = costo - acumulada
    tabla.push({ anio: year, depAnual: depreciacionAnual, acumulada, libros })

if metodo === "reduccion_saldos":
  tasa = selectedType.tasaMax
  tabla = []
  saldo = baseDepreciable
  for year 1 to vidaUtil:
    dep = saldo × tasa
    saldo -= dep
    tabla.push({ anio: year, depAnual: dep, acumulada: baseDepreciable - saldo, libros: costo - (baseDepreciable - saldo) })
```

### Output: CalculatorResult (dep. anual, vida util, tasa), full depreciation table, reference table of all asset types
### Articles: ["128", "131", "137"]

---

## CALCULATOR 6: Impuesto Nacional al Consumo

**Route:** `/calculadoras/consumo/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Tipo de bien/servicio | SelectInput | From CONSUMO_TARIFAS |
| Valor de la operacion | CurrencyInput | |

### Calculation Logic
```
selected = CONSUMO_TARIFAS.find(t => t.tipo === tipo)
impuesto = valor × selected.tarifa
total = valor + impuesto
```

### Output: CalculatorResult (valor base, impuesto, total con impuesto), reference table of all tariffs
### Articles: ["512-1", "512-2", "512-3"]

---

## VERIFICATION
```bash
npx tsc --noEmit src/config/tax-data-wave4.ts src/app/calculadoras/intereses-mora/page.tsx src/app/calculadoras/simple/page.tsx src/app/calculadoras/beneficio-auditoria/page.tsx src/app/calculadoras/pension/page.tsx src/app/calculadoras/depreciacion/page.tsx src/app/calculadoras/consumo/page.tsx
```
