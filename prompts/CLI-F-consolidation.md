# CLI-F: Consolidation — Integration of All Waves

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously.

## OBJECTIVE
You are the FINAL agent. Other agents have created new calculator pages and config files. Your job is to:
1. Verify all new files exist and compile
2. Merge all new config constants into the main `tax-data.ts` (or keep as separate imports)
3. Update `src/app/calculadoras/page.tsx` to add cards for ALL new calculators
4. Update `src/components/layout/header.tsx` to add navigation links for new non-calculator pages
5. Run lint, fix errors, run build, commit, and push

## PROJECT
- Path: `/Users/cristianespinal/estatuto-tributario-rag`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4

## STEP 1: Inventory all new files

Run `find src -name "*.tsx" -newer src/app/calculadoras/seguridad-social/page.tsx` and `find src/config -name "tax-data-*.ts"` to discover all new files created by other agents.

Expected new calculator pages (may vary if some agents didn't finish all):
```
src/app/calculadoras/ganancias-ocasionales/page.tsx
src/app/calculadoras/herencias/page.tsx
src/app/calculadoras/dividendos/page.tsx
src/app/calculadoras/patrimonio/page.tsx
src/app/calculadoras/renta-juridicas/page.tsx
src/app/calculadoras/sanciones-ampliadas/page.tsx
src/app/calculadoras/debo-declarar/page.tsx
src/app/calculadoras/anticipo/page.tsx
src/app/calculadoras/timbre/page.tsx
src/app/calculadoras/liquidacion-laboral/page.tsx
src/app/calculadoras/horas-extras/page.tsx
src/app/calculadoras/retencion-salarios/page.tsx
src/app/calculadoras/intereses-mora/page.tsx
src/app/calculadoras/simple/page.tsx
src/app/calculadoras/beneficio-auditoria/page.tsx
src/app/calculadoras/pension/page.tsx
src/app/calculadoras/depreciacion/page.tsx
src/app/calculadoras/consumo/page.tsx
```

Expected new non-calculator pages:
```
src/app/calendario/page.tsx
src/app/tablas/retencion/page.tsx
src/app/indicadores/page.tsx
src/app/glosario/page.tsx
```

Expected new config files:
```
src/config/tax-data-ganancias.ts
src/config/tax-data-corporativo.ts
src/config/tax-data-laboral.ts
src/config/tax-data-wave4.ts
src/config/calendario-data.ts
src/config/retencion-tabla-data.ts
src/config/indicadores-data.ts
src/config/glosario-data.ts
```

Expected new component:
```
src/components/calculators/date-input.tsx
```

## STEP 2: Update `src/app/calculadoras/page.tsx`

Add cards for ALL new calculators that exist. Read the current file first, then add entries.

Current icons imported: `ArrowLeftRight, Receipt, Landmark, AlertTriangle, Banknote, ShoppingCart, Users, Shield`

Add these new icons to the import from `lucide-react`:
- `TrendingUp` — for ganancias ocasionales
- `Gift` — for herencias
- `PieChart` — for dividendos
- `Building2` — for patrimonio
- `Building` — for renta juridicas
- `Gavel` — for sanciones ampliadas
- `CheckCircle` — for debo declarar
- `FastForward` — for anticipo
- `Stamp` — for timbre
- `FileText` — for liquidacion laboral
- `Clock` — for horas extras
- `Calculator` — for retencion salarios
- `Percent` — for intereses mora
- `Layers` — for SIMPLE
- `Search` — for beneficio auditoria
- `Wallet` — for pension
- `TrendingDown` — for depreciacion
- `Coffee` — for consumo

For each new calculator that EXISTS (verify the file is present before adding), add an entry to the CALCULATORS array:

```typescript
// Wave 1A
{ href: "/calculadoras/ganancias-ocasionales", title: "Ganancias Ocasionales — Inmuebles",
  description: "Calcula el impuesto sobre ganancia por venta de activos fijos con ajuste fiscal Art. 73.",
  icon: TrendingUp, articles: ["299", "300", "314"] },

{ href: "/calculadoras/herencias", title: "Herencias y Donaciones",
  description: "Impuesto sobre herencias, legados y donaciones con exenciones por parentesco.",
  icon: Gift, articles: ["302", "307", "314"] },

{ href: "/calculadoras/dividendos", title: "Dividendos Personas Naturales",
  description: "Impuesto sobre dividendos con doble capa: gravados y no gravados a nivel societario.",
  icon: PieChart, articles: ["242", "49"] },

{ href: "/calculadoras/patrimonio", title: "Impuesto al Patrimonio",
  description: "Impuesto progresivo sobre patrimonio liquido 2026 (umbral 40,000 UVT).",
  icon: Building2, articles: ["292-2", "296-3"] },

// Wave 1B
{ href: "/calculadoras/renta-juridicas", title: "Renta Personas Juridicas",
  description: "Impuesto de renta corporativo con tarifas sectoriales y sobretasa financiero.",
  icon: Building, articles: ["240", "240-1"] },

{ href: "/calculadoras/sanciones-ampliadas", title: "Sanciones Tributarias",
  description: "Sanciones por no declarar, correccion e inexactitud con reduccion Art. 640.",
  icon: Gavel, articles: ["643", "644", "647"] },

{ href: "/calculadoras/debo-declarar", title: "¿Debo Declarar Renta?",
  description: "Verifica si esta obligado a declarar renta comparando 5 topes en UVT.",
  icon: CheckCircle, articles: ["592", "593"] },

{ href: "/calculadoras/anticipo", title: "Anticipo de Renta",
  description: "Calcula el anticipo del impuesto de renta para el siguiente periodo gravable.",
  icon: FastForward, articles: ["807"] },

{ href: "/calculadoras/timbre", title: "Impuesto de Timbre",
  description: "Impuesto del 1% sobre documentos que superen 6,000 UVT (Decreto 175/2025).",
  icon: Stamp, articles: ["519", "520"] },

// Wave 2
{ href: "/calculadoras/liquidacion-laboral", title: "Liquidacion de Contrato Laboral",
  description: "Cesantias, intereses, prima, vacaciones e indemnizacion por terminacion de contrato.",
  icon: FileText, articles: [] },

{ href: "/calculadoras/horas-extras", title: "Horas Extras y Recargos",
  description: "Calcula extras diurnas, nocturnas, dominicales y festivos con reforma Ley 2466/2025.",
  icon: Clock, articles: [] },

{ href: "/calculadoras/retencion-salarios", title: "Retencion Salarios Proc. 1",
  description: "Retencion mensual con depuracion completa Art. 388: deducciones, exentas y limites.",
  icon: Calculator, articles: ["383", "388"] },

// Wave 4
{ href: "/calculadoras/intereses-mora", title: "Intereses Moratorios DIAN",
  description: "Calcula intereses de mora sobre deudas tributarias con tasa de usura vigente.",
  icon: Percent, articles: ["634", "635"] },

{ href: "/calculadoras/simple", title: "Regimen SIMPLE (RST)",
  description: "Impuesto unificado SIMPLE por grupo de actividad con comparativo vs ordinario.",
  icon: Layers, articles: ["903", "908"] },

{ href: "/calculadoras/beneficio-auditoria", title: "Beneficio de Auditoria",
  description: "Verifica si aplica reduccion del periodo de firmeza (6 o 12 meses).",
  icon: Search, articles: ["689-3"] },

{ href: "/calculadoras/pension", title: "Verificador de Pension",
  description: "Verifica requisitos de edad y semanas cotizadas con reforma pensional 2024.",
  icon: Wallet, articles: [] },

{ href: "/calculadoras/depreciacion", title: "Depreciacion Fiscal",
  description: "Deduccion anual por depreciacion de activos fijos con tabla de vida util.",
  icon: TrendingDown, articles: ["128", "137"] },

{ href: "/calculadoras/consumo", title: "Impuesto al Consumo",
  description: "Impuesto nacional al consumo para restaurantes, telefonia y vehiculos.",
  icon: Coffee, articles: ["512-1"] },
```

Also update the metadata description to reflect the full range of calculators.

## STEP 3: Update navigation header (if new non-calculator pages exist)

Read `src/components/layout/header.tsx`. If the non-calculator pages exist (calendario, tablas, indicadores, glosario), add navigation links. Look at the existing nav pattern and add:
- "Calendario" → `/calendario`
- "Tablas" → `/tablas/retencion`
- "Indicadores" → `/indicadores`
- "Glosario" → `/glosario`

Add these as new nav items following the existing pattern. If the header is too crowded, group under a "Herramientas" dropdown or just add the most important ones.

## STEP 4: Fix all TypeScript and lint errors

Run:
```bash
npm run lint
```

Fix ALL errors. Common issues:
- Unused imports
- `let` that should be `const`
- Missing types
- Incorrect import paths

Iterate until `npm run lint` shows 0 errors and 0 warnings.

## STEP 5: Build

Run:
```bash
npm run build
```

Verify ALL new routes appear in the build output. Fix any build errors.

## STEP 6: Git commit and push

```bash
git add -A
git status  # verify all new files
git commit -m "feat: add 18+ new calculators and 4 reference tools (Waves 1-4)

Adds calculators for: ganancias ocasionales, herencias, dividendos,
patrimonio, renta PJ, sanciones ampliadas, debo declarar, anticipo,
timbre, liquidacion laboral, horas extras, retencion Proc. 1, intereses
mora, SIMPLE, beneficio auditoria, pension, depreciacion, consumo.

Adds reference tools: calendario tributario, tabla retencion, indicadores,
glosario tributario.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin main
```

## STEP 7: Post-push verification

After push, verify:
- All new routes appear in the Vercel deploy
- No build errors in Vercel dashboard

## IMPORTANT NOTES

- If a file doesn't exist (agent didn't create it), SKIP that entry — do NOT create it yourself. Only integrate what exists.
- If an existing calculator page has import errors (wrong path, missing config), fix the import to use the correct path.
- If config files need small adjustments to compile, make minimal fixes.
- The goal is integration, not creation. You are the assembler, not the builder.
- Keep `src/app/calculadoras/page.tsx` clean — only add cards for calculators whose page.tsx actually exists.
- For non-calculator pages, only add header nav links if the pages exist.
