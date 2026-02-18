# CLI-B: Wave 1B — 5 Calculadoras Tributarias Complementarias

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously.

## OBJECTIVE
Build 5 new tax calculator pages for a Next.js Colombian tax law app. You must create ONLY NEW files. NEVER modify any existing file.

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
src/config/tax-data-corporativo.ts           ← NEW config
src/app/calculadoras/renta-juridicas/page.tsx ← Calculator 1
src/app/calculadoras/sanciones-ampliadas/page.tsx ← Calculator 2
src/app/calculadoras/debo-declarar/page.tsx   ← Calculator 3
src/app/calculadoras/anticipo/page.tsx        ← Calculator 4
src/app/calculadoras/timbre/page.tsx          ← Calculator 5
```

## EXISTING IMPORTS (read-only, NEVER modify source files)
```typescript
import { UVT_VALUES, CURRENT_UVT_YEAR, SMLMV_2026 } from "@/config/tax-data";
import { CurrencyInput, SelectInput, ToggleInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
```

## COMPONENT SIGNATURES (reference only)
```typescript
<CurrencyInput id="unique-id" label="Label text" value={numberState} onChange={setNumberState} />
<SelectInput id="unique-id" label="Label" value={stringState} onChange={setStringState}
  options={[{ value: "key", label: "Display" }]} />
<ToggleInput label="Button text" pressed={boolState} onToggle={setBoolState} />
<NumberInput id="unique-id" label="Label" value={numberState} onChange={setNumberState} min={0} max={100} />
<CalculatorResult items={[{ label: "Label", value: "$1,234,567", sublabel: "optional note" }]} />
<CalculatorSources articles={["241", "242"]} />
```

## PAGE STRUCTURE PATTERN (follow exactly)
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

export default function PageName() {
  // useState for inputs, useMemo for calculations
  // return JSX with Link back, h1, inputs, results, sources
}
```

## TABLE PATTERN
```tsx
<div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/50">
        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-2">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```

## STYLE RULES
- 2-space indentation, double quotes, semicolons
- `const` over `let`, all text in Spanish, `"es-CO"` locale
- Tailwind CSS only, dark mode via `text-muted-foreground`, `border-border`, `bg-muted/50`
- Responsive tables: `overflow-x-auto` wrapper
- Warnings: `text-yellow-600 dark:text-yellow-400`
- Highlighted rows: `bg-primary/10 font-semibold`

---

## CONFIG FILE: `src/config/tax-data-corporativo.ts`

```typescript
// ── Renta PJ, Sanciones, Topes, Anticipo, Timbre — 2026 ──

/** Renta Personas Juridicas — Art. 240 ET + Decreto 1474/2025 */
export const PJ_RATES = [
  { sector: "general", label: "Tarifa general", rate: 0.35, article: "240" },
  { sector: "financiero", label: "Sector financiero (renta > 120,000 UVT)", rate: 0.50, article: "240 Par. 1 + Dto 1474" },
  { sector: "hidroelectrica", label: "Generacion hidroelectrica", rate: 0.38, article: "240 Par. 2" },
  { sector: "extractivo", label: "Sector extractivo", rate: 0.35, article: "240" },
  { sector: "hotelero", label: "Servicios hoteleros (nuevos/remodelados)", rate: 0.15, article: "240 Par. 5" },
  { sector: "editorial", label: "Industria editorial", rate: 0.15, article: "240 Par. 6" },
  { sector: "zona_franca", label: "Usuarios zona franca", rate: 0.20, article: "240-1" },
  { sector: "zona_franca_comercial", label: "Zona franca comercial", rate: 0.35, article: "240-1 Par. 1" },
] as const;

/** Sobretasa financiero — aplica sobre renta > 120,000 UVT */
export const SOBRETASA_FINANCIERO_THRESHOLD_UVT = 120_000;
export const SOBRETASA_FINANCIERO_RATE = 0.15; // 15% adicional = 35% + 15% = 50%

/** Sanciones — Art. 643, 644, 647, 639 ET */
export const SANCION_MINIMA_UVT = 10;

// Art. 643 — No declarar
export const SANCION_NO_DECLARAR = {
  renta_ingresos: 0.20,     // 20% de ingresos brutos
  renta_consignaciones: 0.20, // 20% de consignaciones
  iva_ingresos: 0.10,       // 10% de consignaciones o ingresos
  retefuente: 0.10,         // 10% de cheques girados o costos
  patrimonio: 1.60,         // 160% del impuesto determinado
} as const;

// Art. 644 — Correccion
export const SANCION_CORRECCION = {
  voluntaria: 0.10,         // 10% del mayor valor
  post_emplazamiento: 0.20, // 20% del mayor valor
} as const;

// Art. 647 — Inexactitud
export const SANCION_INEXACTITUD = {
  general: 1.00,            // 100% de la diferencia
  fraude: 2.00,             // 200% por fraude/evasion
} as const;

/** Topes para declarar renta 2026 (Decreto 2231/2023 + Dto 1474/2025)
 *  Ingresos y valores son en UVT del año gravable 2025 (UVT $49,799) */
export const TOPES_DECLARAR_RENTA_AG2025 = {
  patrimonioBrutoUVT: 4_500,
  ingresosBrutosUVT: 1_400,
  consumosTarjetaUVT: 1_400,
  comprasTotalesUVT: 1_400,
  consignacionesUVT: 1_400,
  uvtAnoGravable: 49_799, // UVT 2025 para año gravable 2025, declarar en 2026
} as const;

/** Anticipo de Renta — Art. 807 ET */
export const ANTICIPO_RATES = {
  primerAno: 0.25,
  segundoAno: 0.50,
  subsiguientes: 0.75,
} as const;

/** Impuesto de Timbre — Art. 519 ET + Decreto 175/2025 */
export const TIMBRE_RATE = 0.01; // 1%
export const TIMBRE_THRESHOLD_UVT = 6_000;
export const TIMBRE_INMUEBLES_UVT = 20_000;
```

---

## CALCULATOR 1: Renta Personas Juridicas

**Route:** `/calculadoras/renta-juridicas/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Renta liquida gravable | CurrencyInput | |
| Sector economico | SelectInput | Options from PJ_RATES |

### Calculation Logic
```
uvt = UVT_VALUES[CURRENT_UVT_YEAR]
rentaUVT = rentaLiquida / uvt
selectedRate = PJ_RATES.find(r => r.sector === sector)

// Base tax
impuestoBase = rentaLiquida × selectedRate.rate

// Financial sector surcharge (only if sector === "financiero" AND rentaUVT > 120,000)
sobretasa = 0
If sector === "financiero" && rentaUVT > SOBRETASA_FINANCIERO_THRESHOLD_UVT:
  baseExcedente = rentaLiquida - (SOBRETASA_FINANCIERO_THRESHOLD_UVT × uvt)
  sobretasa = baseExcedente × SOBRETASA_FINANCIERO_RATE

totalImpuesto = impuestoBase + sobretasa
tasaEfectiva = rentaLiquida > 0 ? totalImpuesto / rentaLiquida : 0
```

### Output Sections
- **CalculatorResult**: Renta liquida, Tarifa aplicable, Impuesto base, Sobretasa (if financiero), Total impuesto, Tasa efectiva
- **Tabla de tarifas por sector**: Show all PJ_RATES with current highlighted
- **Note for financiero**: "Sobretasa del 15% aplicable sobre renta > 120,000 UVT (Decreto 1474/2025)"
- **Note for zona franca**: "Tarifa 20% proporcional al ingreso de exportaciones (Art. 240-1)"
- **CalculatorSources** articles: ["240", "240-1"]

---

## CALCULATOR 2: Sanciones Ampliadas

**Route:** `/calculadoras/sanciones-ampliadas/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Tipo de sancion | SelectInput | "no_declarar", "correccion", "inexactitud" |
| — For no_declarar — | | |
| Tipo de impuesto | SelectInput | "renta", "iva", "retefuente" |
| Ingresos brutos del periodo | CurrencyInput | |
| Consignaciones bancarias | CurrencyInput | |
| Impuesto determinado por DIAN | CurrencyInput | Only if patrimonio |
| — For correccion — | | |
| Impuesto declaracion inicial | CurrencyInput | |
| Impuesto declaracion corregida | CurrencyInput | |
| Es voluntaria (antes de emplazamiento) | ToggleInput | |
| — For inexactitud — | | |
| Impuesto declarado | CurrencyInput | |
| Impuesto correcto (DIAN) | CurrencyInput | |
| Es fraude o evasion | ToggleInput | |
| — Common — | | |
| Aplica reduccion Art. 640 | ToggleInput | 50% if first offense in 2 years |

### Calculation Logic
Show/hide inputs based on tipo_sancion selection.

**No Declarar (Art. 643):**
```
If tipoImpuesto === "renta":
  sancionBase = max(ingresosBrutos × 0.20, consignaciones × 0.20)
If tipoImpuesto === "iva":
  sancionBase = max(ingresosBrutos × 0.10, consignaciones × 0.10)
If tipoImpuesto === "retefuente":
  sancionBase = consignaciones × 0.10

sancionMinima = SANCION_MINIMA_UVT × uvt
sancion = max(sancionBase, sancionMinima)
If aplicaReduccion640: sancion = sancion × 0.50
sancion = max(sancion, sancionMinima)
```

**Correccion (Art. 644):**
```
mayorValor = max(0, impuestoCorregido - impuestoInicial)
rate = esVoluntaria ? 0.10 : 0.20
sancionBase = mayorValor × rate
sancionMinima = SANCION_MINIMA_UVT × uvt
sancion = max(sancionBase, sancionMinima)
If aplicaReduccion640: sancion = sancion × 0.50
sancion = max(sancion, sancionMinima)
```

**Inexactitud (Art. 647):**
```
diferencia = max(0, impuestoCorrecto - impuestoDeclarado)
rate = esFraude ? 2.00 : 1.00
sancionBase = diferencia × rate
sancionMinima = SANCION_MINIMA_UVT × uvt
sancion = max(sancionBase, sancionMinima)
If aplicaReduccion640: sancion = sancion × 0.50
sancion = max(sancion, sancionMinima)
```

### Output Sections
- **CalculatorResult**: Sancion calculada, Sancion minima (10 UVT), Sancion con reduccion Art. 640
- **Desglose** table with each step
- **CollapsibleSection** with reference table for all sanction types/rates
- **CalculatorSources** articles: ["643", "644", "647", "639", "640"]

---

## CALCULATOR 3: Topes para Declarar Renta (Debo Declarar?)

**Route:** `/calculadoras/debo-declarar/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Patrimonio bruto a 31 dic 2025 | CurrencyInput | |
| Ingresos brutos 2025 | CurrencyInput | |
| Consumos con tarjeta de credito 2025 | CurrencyInput | |
| Compras y consumos totales 2025 | CurrencyInput | |
| Consignaciones bancarias 2025 | CurrencyInput | |

### Calculation Logic
```
uvtAG = TOPES_DECLARAR_RENTA_AG2025.uvtAnoGravable  // 49,799

topePatrimonio = TOPES_DECLARAR_RENTA_AG2025.patrimonioBrutoUVT × uvtAG  // 4,500 × 49,799
topeIngresos = TOPES_DECLARAR_RENTA_AG2025.ingresosBrutosUVT × uvtAG      // 1,400 × 49,799
topeConsumos = TOPES_DECLARAR_RENTA_AG2025.consumosTarjetaUVT × uvtAG     // 1,400 × 49,799
topeCompras = TOPES_DECLARAR_RENTA_AG2025.comprasTotalesUVT × uvtAG       // 1,400 × 49,799
topeConsignaciones = TOPES_DECLARAR_RENTA_AG2025.consignacionesUVT × uvtAG // 1,400 × 49,799

superaPatrimonio = patrimonioBruto > topePatrimonio
superaIngresos = ingresosBrutos > topeIngresos
superaConsumos = consumosTarjeta > topeConsumos
superaCompras = compras > topeCompras
superaConsignaciones = consignaciones > topeConsignaciones

// Must file if ANY threshold exceeded
debeDeclarar = superaPatrimonio || superaIngresos || superaConsumos || superaCompras || superaConsignaciones
```

### Output Sections
- **Big result banner**: Green "No esta obligado a declarar renta 2025" or Red "ESTA OBLIGADO a declarar renta 2025"
  - Use `bg-green-50 dark:bg-green-950/30 border-green-200` or `bg-red-50 dark:bg-red-950/30 border-red-200`
- **Tabla de verificacion**: 5 rows showing each criterion:
  - Concepto | Tope (UVT) | Tope ($) | Su valor | Supera?
  - Color the "Supera" column green/red
- **Note**: "Los topes se evaluan sobre el ano gravable 2025 (UVT $49,799). Si supera CUALQUIER tope, esta obligado a declarar en 2026."
- **CalculatorSources** articles: ["592", "593", "594-3"]

---

## CALCULATOR 4: Anticipo de Renta

**Route:** `/calculadoras/anticipo/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Impuesto neto de renta ano actual | CurrencyInput | |
| Impuesto neto de renta ano anterior | CurrencyInput | |
| Retenciones en la fuente a favor | CurrencyInput | |
| Ano como declarante | SelectInput | "primer_ano", "segundo_ano", "subsiguiente" |

### Calculation Logic
```
// Art. 807
If anio === "primer_ano":
  baseAnticipo = impuestoActual
  porcentaje = ANTICIPO_RATES.primerAno  // 25%
If anio === "segundo_ano":
  baseAnticipo = max(impuestoActual, (impuestoActual + impuestoAnterior) / 2)
  porcentaje = ANTICIPO_RATES.segundoAno  // 50%  (actually, for segundo año, it can be the average)
  // Art. 807: segundo año: promedio de los 2 últimos años × 75% OR impuesto actual × 75%
  // Simplified: max(impuestoActual, promedio) × 75%
  // Actually re-reading: Primer año: 25%, Segundo año: 50% del promedio, Tercero+: 75% del promedio
If anio === "subsiguiente":
  baseAnticipo = max(impuestoActual, (impuestoActual + impuestoAnterior) / 2)
  porcentaje = ANTICIPO_RATES.subsiguientes  // 75%

// Actually the correct formula per Art. 807:
// Option A: impuesto neto año actual × porcentaje
// Option B: promedio 2 últimos años × porcentaje
// Contribuyente escoge el MENOR

opcionA = impuestoActual × porcentaje
promedio = (impuestoActual + impuestoAnterior) / 2
opcionB = promedio × porcentaje

anticipoBruto = min(opcionA, opcionB) // taxpayer chooses the lower
anticipoNeto = max(0, anticipoBruto - retenciones)
```

### Output Sections
- **CalculatorResult**: Opcion A (sobre impuesto actual), Opcion B (sobre promedio), Anticipo bruto (menor), Retenciones, Anticipo neto a pagar
- **Tabla comparativa** showing both options
- **Note**: "El contribuyente puede optar por la opcion que resulte menor (Art. 807 ET)"
- **CalculatorSources** articles: ["807", "809"]

---

## CALCULATOR 5: Impuesto de Timbre Nacional

**Route:** `/calculadoras/timbre/page.tsx`

### Inputs
| Input | Component | Notes |
|-------|-----------|-------|
| Valor del documento/instrumento | CurrencyInput | |
| Tipo de documento | SelectInput | "contrato_general", "escritura_publica", "cesion_acciones" |

### Calculation Logic
```
uvt = UVT_VALUES[CURRENT_UVT_YEAR]
valorUVT = valor / uvt

// General: applies when > 6,000 UVT
// Real estate deeds: applies when >= 20,000 UVT
threshold = tipo === "escritura_publica" ? TIMBRE_INMUEBLES_UVT : TIMBRE_THRESHOLD_UVT
thresholdCOP = threshold × uvt

If valorUVT < threshold:
  impuesto = 0
  noAplica = true
Else:
  impuesto = valor × TIMBRE_RATE  // 1%
```

### Output Sections
- **CalculatorResult**: Valor documento, Valor en UVT, Umbral aplicable, Impuesto de timbre
- **Warning** if below threshold: "No aplica timbre: valor ({formatCOP(valor)}) < {threshold} UVT ({formatCOP(thresholdCOP)})"
- **Tabla de umbrales** showing both thresholds (6,000 UVT general, 20,000 UVT escrituras)
- **Note**: "Decreto 175/2025 reactivo el impuesto de timbre al 1%. Aplica sobre instrumentos publicos y documentos privados que superen el umbral."
- **CalculatorSources** articles: ["519", "520", "530"]

---

## VERIFICATION
After creating all files, run ONLY:
```bash
npx tsc --noEmit src/config/tax-data-corporativo.ts src/app/calculadoras/renta-juridicas/page.tsx src/app/calculadoras/sanciones-ampliadas/page.tsx src/app/calculadoras/debo-declarar/page.tsx src/app/calculadoras/anticipo/page.tsx src/app/calculadoras/timbre/page.tsx
```
Fix any TypeScript errors. Do NOT run lint, build, or git commands.
