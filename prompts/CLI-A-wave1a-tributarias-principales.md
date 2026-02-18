# CLI-A: Wave 1A — 4 Calculadoras Tributarias Principales

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously.

## OBJECTIVE
Build 4 new tax calculator pages for a Next.js Colombian tax law app. You must create ONLY NEW files. NEVER modify any existing file.

## PROJECT
- Path: `/Users/cristianespinal/estatuto-tributario-rag`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Node/npm already installed. Do NOT run `npm install`.

## CRITICAL ANTI-CONFLICT RULES
You are one of 6 parallel agents. To avoid merge conflicts:
1. **NEVER modify** any existing file. Not `tax-data.ts`, not `page.tsx`, not `shared-inputs.tsx`, not ANY existing file.
2. **ONLY create** new files listed in the "Files to Create" section below.
3. Do NOT run `npm run build` or `git` commands. Another agent handles that.
4. You CAN run `npx tsc --noEmit` to type-check your files.
5. You CAN import from existing files (read-only usage).

## FILES TO CREATE (and ONLY these)
```
src/config/tax-data-ganancias.ts          ← NEW config with constants
src/app/calculadoras/ganancias-ocasionales/page.tsx  ← Calculator 1
src/app/calculadoras/herencias/page.tsx              ← Calculator 2
src/app/calculadoras/dividendos/page.tsx             ← Calculator 3
src/app/calculadoras/patrimonio/page.tsx             ← Calculator 4
```

## EXISTING FILES YOU CAN IMPORT FROM (but NEVER modify)
```typescript
// From src/config/tax-data.ts — already exported:
import { UVT_VALUES, CURRENT_UVT_YEAR, SMLMV_2026 } from "@/config/tax-data";

// From src/components/calculators/shared-inputs.tsx:
import { CurrencyInput, SelectInput, ToggleInput, NumberInput } from "@/components/calculators/shared-inputs";

// From src/components/calculators/calculator-result.tsx:
import { CalculatorResult } from "@/components/calculators/calculator-result";

// From src/components/calculators/calculator-sources.tsx:
import { CalculatorSources } from "@/components/calculators/calculator-sources";
```

## COMPONENT SIGNATURES (for reference — do NOT modify these files)

```typescript
// CurrencyInput — currency formatted input
<CurrencyInput id="unique-id" label="Label text" value={numberState} onChange={setNumberState} />

// SelectInput — dropdown
<SelectInput id="unique-id" label="Label" value={stringState} onChange={setStringState}
  options={[{ value: "key", label: "Display" }]} />

// ToggleInput — boolean button
<ToggleInput label="Button text" pressed={boolState} onToggle={setBoolState} />

// NumberInput — numeric without currency formatting
<NumberInput id="unique-id" label="Label" value={numberState} onChange={setNumberState} min={0} max={100} />

// CalculatorResult — grid of result cards
<CalculatorResult items={[
  { label: "Label", value: "$1,234,567", sublabel: "optional note" },
]} />

// CalculatorSources — article links footer
<CalculatorSources articles={["241", "242"]} />
```

## PAGE STRUCTURE PATTERN (follow this exactly)

```tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
// ... other imports

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

export default function CalculatorPage() {
  const [input1, setInput1] = useState(0);

  const result = useMemo(() => {
    if (input1 <= 0) return null;
    // ... calculations
    return { /* computed values */ };
  }, [input1]);

  return (
    <>
      <Link href="/calculadoras"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Calculator Title</h1>
      <div className="mb-6 space-y-4">
        {/* inputs here */}
      </div>
      {result && (
        <div className="space-y-6">
          {/* result sections here */}
        </div>
      )}
      <div className="mt-6">
        <CalculatorSources articles={["241"]} />
      </div>
    </>
  );
}
```

## TABLE PATTERN
```tsx
<div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/50">
        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Header</th>
        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-2">Label</td>
        <td className="px-4 py-2 text-right">{formatCOP(value)}</td>
      </tr>
      {/* Total row */}
      <tr className="border-b border-border bg-muted/20 font-semibold">
        <td className="px-4 py-2">TOTAL</td>
        <td className="px-4 py-2 text-right">{formatCOP(total)}</td>
      </tr>
    </tbody>
  </table>
</div>
```

## STYLE RULES
- 2-space indentation, double quotes, semicolons
- Use `const` not `let` where possible
- All text in Spanish (labels, descriptions, warnings)
- Use `"es-CO"` locale for number formatting
- Tailwind CSS only — no inline styles
- Dark mode support: use `text-muted-foreground`, `border-border`, `bg-muted/50`, etc.
- Responsive: tables must have `overflow-x-auto` wrapper
- Warnings in yellow: `text-yellow-600 dark:text-yellow-400`
- Highlighted rows: `bg-primary/10 font-semibold`

---

## CONFIG FILE: `src/config/tax-data-ganancias.ts`

Create this file with ALL constants needed by calculators 1-4:

```typescript
// ── Ganancias Ocasionales, Dividendos & Patrimonio — 2026 ──

import { UVT_VALUES, CURRENT_UVT_YEAR } from "./tax-data";

const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

/** Ganancias Ocasionales — Art. 313, 314 ET */
export const GANANCIA_OCASIONAL_RATE = 0.15;

/** Exencion vivienda — Art. 311-1 ET: primeras 7,500 UVT */
export const VIVIENDA_EXENCION_UVT = 7_500;

/** Exenciones herencias — Art. 307 ET */
export const HERENCIA_EXENCION_HEREDEROS_UVT = 3_250;
export const HERENCIA_EXENCION_OTROS_PCT = 0.20;
export const HERENCIA_EXENCION_OTROS_TOPE_UVT = 2_290;

/** Porcion conyugal exenta — Art. 307 Par. ET */
export const PORCION_CONYUGAL_EXENTA_UVT = 3_250;

/** Factores de ajuste fiscal Art. 73 — IPC acumulado por año de adquisicion
 *  Fuente: DANE. Factor = IPC acumulado desde año adquisicion hasta 2025
 *  Simplificado: se usa % reajuste fiscal anual (Art. 70) */
export const REAJUSTE_FISCAL_2025 = 0.0581; // 5.81% para 2025

/** Dividendos Art. 242 — Tabla personas naturales residentes (sobre dividendos gravados a nivel societario) */
export const DIVIDENDOS_PN_BRACKETS = [
  { from: 0,    to: 1_090, rate: 0,    base: 0 },
  { from: 1_090, to: Infinity, rate: 0.20, base: 0 },
] as const;

/** Dividendos no gravados a nivel societario — Art. 242 Inc. 2: tarifa 35% primero */
export const DIVIDENDOS_NO_GRAVADOS_RATE = 0.35;

/** Impuesto al Patrimonio 2026 — Decreto 1474/2025
 *  Umbral: 40,000 UVT. Tabla marginal progresiva. */
export const PATRIMONIO_THRESHOLD_UVT = 40_000;

export const PATRIMONIO_BRACKETS = [
  { from: 0,       to: 40_000,  rate: 0,     base: 0 },
  { from: 40_000,  to: 70_000,  rate: 0.005, base: 0 },
  { from: 70_000,  to: 120_000, rate: 0.010, base: 150 },
  { from: 120_000, to: 200_000, rate: 0.015, base: 650 },
  { from: 200_000, to: 300_000, rate: 0.025, base: 1_850 },
  { from: 300_000, to: Infinity, rate: 0.050, base: 4_350 },
] as const;
```

---

## CALCULATOR 1: Ganancias Ocasionales — Venta de Inmuebles/Activos

**Route:** `/calculadoras/ganancias-ocasionales/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Precio de venta | CurrencyInput | |
| Costo fiscal de adquisicion | CurrencyInput | Precio original de compra |
| Ano de adquisicion | SelectInput | Options: 2010-2025, para calcular ajuste Art. 73 |
| Tipo de activo | SelectInput | "inmueble_vivienda", "inmueble_otro", "acciones", "otro_activo" |
| Tiempo de posesion > 2 anos | ToggleInput | Requerido para ganancia ocasional (vs renta ordinaria) |

### Calculation Logic
```
1. costoAjustado = costoFiscal × (1 + REAJUSTE_FISCAL_2025) ^ (2025 - anoAdquisicion)
   (simplified: compound annual adjustment)
2. ganancia = max(0, precioVenta - costoAjustado)
3. If tipo == "inmueble_vivienda":
     exencion = min(ganancia, VIVIENDA_EXENCION_UVT × uvt)  // Art. 311-1
     gananciaGravable = ganancia - exencion
   Else:
     gananciaGravable = ganancia
4. impuesto = gananciaGravable × GANANCIA_OCASIONAL_RATE  // 15%
5. If posesion < 2 anos: WARNING "Activos poseidos menos de 2 anos tributan como renta ordinaria, no como ganancia ocasional"
```

### Output Sections
- **CalculatorResult** with: Precio venta, Costo ajustado, Ganancia bruta, Exencion (if vivienda), Ganancia gravable, Impuesto (15%)
- **Tabla desglose**: Costo original → Ajuste fiscal → Costo ajustado → Ganancia → Exencion → Gravable → Impuesto
- **CollapsibleSection "Ajuste Fiscal Art. 73"**: Explain the annual IPC adjustment
- **Warning** if posesion < 2 years
- **CalculatorSources** articles: ["299", "300", "73", "311-1", "313", "314"]

---

## CALCULATOR 2: Ganancias Ocasionales — Herencias, Legados y Donaciones

**Route:** `/calculadoras/herencias/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Valor total bienes heredados/donados | CurrencyInput | |
| Tipo | SelectInput | "herencia", "legado", "donacion" |
| Relacion con causante | SelectInput | "heredero_directo" (hijos, padres, conyuge), "tercero" |
| Incluye porcion conyugal | ToggleInput | Only if relacion == heredero_directo |

### Calculation Logic
```
1. base = valorBienes

2. If relacion == "heredero_directo":
     exencionHeredero = min(base, HERENCIA_EXENCION_HEREDEROS_UVT × uvt)  // 3,250 UVT
     If incluyePorcionConyugal:
       exencionConyugal = min(base, PORCION_CONYUGAL_EXENTA_UVT × uvt)  // 3,250 UVT
       totalExencion = min(base, exencionHeredero + exencionConyugal)
     Else:
       totalExencion = exencionHeredero
   Else (tercero):
     exencion20 = min(base × HERENCIA_EXENCION_OTROS_PCT, HERENCIA_EXENCION_OTROS_TOPE_UVT × uvt)
     totalExencion = exencion20

3. gananciaGravable = max(0, base - totalExencion)
4. impuesto = gananciaGravable × GANANCIA_OCASIONAL_RATE  // 15%
```

### Output Sections
- **CalculatorResult**: Valor bienes, Exencion aplicada, Ganancia gravable, Impuesto
- **Tabla desglose** showing exemption calculation
- **CollapsibleSection "Exenciones Art. 307"**: Table showing all exemption tiers
- **CalculatorSources** articles: ["302", "303", "307", "314"]

---

## CALCULATOR 3: Dividendos Personas Naturales

**Route:** `/calculadoras/dividendos/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Total dividendos recibidos | CurrencyInput | |
| Porcion gravada a nivel societario (Art. 49 Par. 3) | CurrencyInput | Dividends from already-taxed corporate profits |
| Porcion NO gravada a nivel societario (Art. 49 Par. 2) | CurrencyInput | Dividends from untaxed corporate profits |
| Es residente fiscal colombiano | ToggleInput | Default true |

### Calculation Logic
```
// Part A: Dividendos gravados a nivel societario → Art. 242 table
gravadosUVT = porcionGravada / uvt
If gravadosUVT <= 1_090:
  impuestoA = 0
Else:
  impuestoA = (gravadosUVT - 1_090) × 0.20 × uvt

// Part B: Dividendos NO gravados a nivel societario
// Step 1: Apply 35% corporate rate first
impuestoCorporativo = porcionNoGravada × DIVIDENDOS_NO_GRAVADOS_RATE
// Step 2: Remainder goes through Art. 242 table
remainder = porcionNoGravada - impuestoCorporativo
remainderUVT = remainder / uvt
If remainderUVT <= 1_090:
  impuestoB_tabla = 0
Else:
  impuestoB_tabla = (remainderUVT - 1_090) × 0.20 × uvt
impuestoB = impuestoCorporativo + impuestoB_tabla

// Non-resident: flat 20% on gravados + 35% on no-gravados (no table)
If !residente:
  impuestoA = porcionGravada × 0.20
  impuestoB = porcionNoGravada × 0.35

totalImpuesto = impuestoA + impuestoB
tasaEfectiva = totalDividendos > 0 ? totalImpuesto / totalDividendos : 0
```

### Output Sections
- **CalculatorResult**: Total dividendos, Impuesto sobre gravados, Impuesto sobre no gravados, Total impuesto, Tasa efectiva
- **Tabla desglose Part A** (gravados): Dividendos → UVT → Tabla Art. 242 → Impuesto
- **Tabla desglose Part B** (no gravados): Dividendos → 35% corporate → Remainder → Tabla → Total
- **CollapsibleSection "Tabla Art. 242"**: Show the bracket table with current row highlighted
- **CollapsibleSection "Diferencia gravados vs no gravados"**: Explain the dual-layer system
- **CalculatorSources** articles: ["242", "49", "246"]

---

## CALCULATOR 4: Impuesto al Patrimonio 2026

**Route:** `/calculadoras/patrimonio/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Patrimonio liquido a 1 de enero 2026 | CurrencyInput | |
| Deudas deducibles | CurrencyInput | |
| Exclusiones (acciones sociedad nacional, etc.) | CurrencyInput | Art. 295-3 exclusions |
| Es persona natural residente | ToggleInput | Default true |

### Calculation Logic
```
uvt = UVT_VALUES[CURRENT_UVT_YEAR]
patrimonioNeto = patrimonioLiquido - deudas - exclusiones
patrimonioUVT = patrimonioNeto / uvt

If patrimonioUVT < PATRIMONIO_THRESHOLD_UVT (40,000):
  impuesto = 0
  noAplica = true
Else:
  // Progressive marginal calculation (same pattern as income tax)
  impuestoUVT = 0
  For each bracket in PATRIMONIO_BRACKETS (from highest to lowest):
    if patrimonioUVT > bracket.from:
      impuestoUVT = (patrimonioUVT - bracket.from) × bracket.rate + bracket.base
      break
  impuesto = impuestoUVT × uvt

tasaEfectiva = patrimonioNeto > 0 ? impuesto / patrimonioNeto : 0
```

### Output Sections
- **CalculatorResult**: Patrimonio neto, Patrimonio en UVT, Impuesto, Tasa efectiva
- **Tabla marginal**: Show progressive breakdown by bracket (similar to renta calculator)
  - For each bracket that applies: Base → Tasa → Impuesto parcial
  - Highlight the current bracket
- **Warning** if patrimonio < 40,000 UVT: "No aplica impuesto al patrimonio (umbral: 40,000 UVT)"
- **CollapsibleSection "Tabla de Tarifas Patrimonio 2026"**: Full bracket table
- **Note**: "Decreto 1474/2025 — Umbral reducido de 72,000 a 40,000 UVT para 2026"
- **CalculatorSources** articles: ["292-2", "295-3", "296-3"]

---

## VERIFICATION
After creating all files, run ONLY:
```bash
npx tsc --noEmit src/config/tax-data-ganancias.ts src/app/calculadoras/ganancias-ocasionales/page.tsx src/app/calculadoras/herencias/page.tsx src/app/calculadoras/dividendos/page.tsx src/app/calculadoras/patrimonio/page.tsx
```
Fix any TypeScript errors. Do NOT run lint, build, or git commands.

## DONE
Once all 5 files are created and type-check passes, your work is complete. Another agent will integrate your files into the main app.
