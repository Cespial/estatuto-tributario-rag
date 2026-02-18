# CLI-REVIEW: Revision Integral, Correccion de Errores y Deploy a Vercel

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously. You have full permissions to read, write, edit, delete files, run commands, and push to git.

## CONTEXT

This is a Next.js 16 Colombian tax law app at `/Users/cristianespinal/estatuto-tributario-rag`. Multiple AI agents ran in parallel overnight and created ~40 new files: 18 new calculator pages, 4 reference tool pages, 5 new config files, and 1 new component. Some agents created duplicate `-v2` directories.

Your job is to do a COMPLETE review, fix ALL errors, clean up duplicates, and deploy to Vercel via `git push origin main`.

## CURRENT STATE (as of now)

### Build status: FAILS
```
./src/app/calculadoras/intereses-mora-v2/page.tsx:138:69
Type error: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
```

### Lint: 2 errors, 15 warnings
```
ERRORS:
1. src/app/calculadoras/intereses-mora-v2/page.tsx:31:9 — 'current' should be const
2. src/app/glosario/page.tsx:15:28 — React Compiler memoization issue

WARNINGS (unused vars/imports):
- beneficio-auditoria-v2/page.tsx: unused 'BENEFICIO_AUDITORIA'
- debo-declarar/page.tsx: unused 'UserCheck'
- dividendos/page.tsx: unused 'ChevronDown', 'Info', 'impuestoOtrosIngresos'
- ganancias-ocasionales/page.tsx: unused 'CheckCircle2', 'CollapsibleSection'
- herencias/page.tsx: unused 'ChevronDown'
- patrimonio/page.tsx: unused 'ChevronDown'
- sanciones-ampliadas/page.tsx: unused 'Calendar'
- simple-v2/page.tsx: unused 'NumberInput'
- tablas/retencion/page.tsx: unused 'Calculator'
- components/indicators/TaxCharts.tsx: unused 'LineChart', 'Line'
- config/tax-data-ganancias.ts: unused 'uvt'
```

### DUPLICATE -v2 directories (6 pairs):
```
src/app/calculadoras/beneficio-auditoria/    AND  beneficio-auditoria-v2/
src/app/calculadoras/consumo/                AND  consumo-v2/
src/app/calculadoras/depreciacion/           AND  depreciacion-v2/
src/app/calculadoras/intereses-mora/         AND  intereses-mora-v2/
src/app/calculadoras/pension/                AND  pension-v2/
src/app/calculadoras/simple/                 AND  simple-v2/
src/config/tax-data-wave4.ts                 AND  tax-data-wave4-v2.ts
```

### Git status:
- Modified: `src/app/calculadoras/page.tsx`, `src/components/layout/header.tsx`
- 40+ untracked new files/directories

---

## YOUR TASKS (execute in order)

### TASK 1: Resolve -v2 duplicates

For each pair of duplicates, you need to pick the BETTER version and delete the other. Criteria:
- The version that compiles without errors wins
- If both compile, the more complete/polished one wins
- The canonical path (without -v2) is what's referenced in `calculadoras/page.tsx`

For each duplicate pair:
1. Read BOTH page.tsx files briefly
2. Check which one has fewer issues
3. If the -v2 is better, replace the original with -v2's content, then delete the -v2 directory
4. If the original is better, just delete the -v2 directory
5. For `tax-data-wave4.ts` vs `tax-data-wave4-v2.ts`: keep whichever is imported by the surviving calculator pages, delete the other

**IMPORTANT**: After resolving, the canonical paths must be:
```
src/app/calculadoras/beneficio-auditoria/page.tsx  (NO -v2)
src/app/calculadoras/consumo/page.tsx
src/app/calculadoras/depreciacion/page.tsx
src/app/calculadoras/intereses-mora/page.tsx
src/app/calculadoras/pension/page.tsx
src/app/calculadoras/simple/page.tsx
src/config/tax-data-wave4.ts
```

Delete ALL -v2 directories and files after resolving.

### TASK 2: Fix ALL lint errors and warnings

Go through each file with issues and fix them:

1. **Remove unused imports** — delete the import line or the specific unused name
2. **`let` → `const`** where variable is never reassigned
3. **Remove unused variables** — delete assignment or use the variable
4. **Fix React Compiler memoization** in glosario/page.tsx:
   - The issue is `let filtered = GLOSARIO` inside useMemo. Change to a functional approach:
   ```typescript
   const filteredGlosario = useMemo(() => {
     const filtered = search
       ? GLOSARIO.filter(t => t.termino.toLowerCase().includes(search.toLowerCase()) ||
           t.definicion.toLowerCase().includes(search.toLowerCase()))
       : GLOSARIO;
     return [...filtered].sort((a, b) => a.termino.localeCompare(b.termino));
   }, [search]);
   ```
5. **Fix TypeScript error** in intereses-mora (whichever version survives):
   - `number | undefined` not assignable to `number` — add a fallback: `calculo.totalPagar ?? 0`
   - Or ensure the type is properly defined

6. **Check ALL new components** under `src/components/calendar/`, `src/components/indicators/`, `src/components/retention/`, `src/components/layout/ReferencePageLayout.tsx`:
   - Fix any unused imports or TypeScript issues
   - If any component is not imported by any page, delete it

### TASK 3: Verify all calculator pages render correctly

For each of the 18 new calculator pages, quickly verify:
1. It imports from the correct config file (not a deleted -v2 file)
2. It uses the correct component imports
3. The `useMemo` calculation logic looks correct
4. It has a Link back to `/calculadoras`
5. It exports a default function component

### TASK 4: Verify calculadoras/page.tsx cards match existing pages

Read `src/app/calculadoras/page.tsx`. For each card in the CALCULATORS array, verify:
1. The `href` path has a corresponding `page.tsx` file
2. If a calculator page doesn't exist, REMOVE that card entry
3. If a calculator page exists but has no card, ADD one
4. Verify all icon imports from lucide-react are actually used

### TASK 5: Verify header.tsx navigation

The header at `src/components/layout/header.tsx` now has 8 nav items. Verify:
1. Each href has a corresponding page
2. Icons are correctly imported
3. The nav doesn't overflow on mobile (8 items might be tight — if it looks like too many, consider keeping only the most important 6 for mobile and all 8 for desktop, OR remove the least important ones)

### TASK 6: Clean up artifacts

Delete any files that shouldn't be in the repo:
```bash
rm -f autonomy-permissions.json permissions.json
rm -rf prompts/   # We don't need these in the repo
```

### TASK 7: Final lint + build

Run iteratively until BOTH pass:
```bash
npm run lint      # Must be 0 errors, 0 warnings
npm run build     # Must compile successfully, all routes generated
```

If lint still shows warnings, fix them. If build fails, fix the error. Repeat until clean.

### TASK 8: Commit and push

```bash
git add src/
git status

git commit -m "fix: comprehensive review and cleanup of 18 new calculators and 4 reference tools

- Resolve 6 duplicate -v2 calculator directories
- Fix all lint errors and warnings (unused imports, const vs let)
- Fix TypeScript build errors (type narrowing)
- Fix React Compiler memoization in glosario
- Clean up unused components and artifacts
- Verify all 26 calculator cards match existing pages
- Verify header navigation links

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin main
```

### TASK 9: Post-deploy verification

After push, verify the build output includes ALL expected routes:
```
/calculadoras/ganancias-ocasionales
/calculadoras/herencias
/calculadoras/dividendos
/calculadoras/patrimonio
/calculadoras/renta-juridicas
/calculadoras/sanciones-ampliadas
/calculadoras/debo-declarar
/calculadoras/anticipo
/calculadoras/timbre
/calculadoras/liquidacion-laboral
/calculadoras/horas-extras
/calculadoras/retencion-salarios
/calculadoras/intereses-mora
/calculadoras/simple
/calculadoras/beneficio-auditoria
/calculadoras/pension
/calculadoras/depreciacion
/calculadoras/consumo
/calendario
/tablas/retencion
/indicadores
/glosario
```

---

## KEY FILES REFERENCE

### Main index: `src/app/calculadoras/page.tsx`
Already updated with 26 cards (8 original + 18 new). May need pruning if pages don't exist.

### Header: `src/components/layout/header.tsx`
Already updated with 8 nav items including new tools.

### Config files:
- `src/config/tax-data.ts` — ORIGINAL, do not touch unless absolutely necessary
- `src/config/tax-data-ganancias.ts` — Wave 1A constants
- `src/config/tax-data-corporativo.ts` — Wave 1B constants
- `src/config/tax-data-laboral.ts` — Wave 2 constants
- `src/config/tax-data-wave4.ts` — Wave 4 constants
- `src/config/calendario-data.ts` — Calendar deadlines
- `src/config/retencion-tabla-data.ts` — Retention reference table
- `src/config/indicadores-data.ts` — Key indicators
- `src/config/glosario-data.ts` — Glossary terms

### New shared component:
- `src/components/calculators/date-input.tsx` — DateInput for labor calculators

### Extra components (created by agents, may or may not be needed):
- `src/components/calendar/` — check if used by calendario page
- `src/components/indicators/` — check if used by indicadores page
- `src/components/retention/` — check if used by tablas/retencion page
- `src/components/layout/ReferencePageLayout.tsx` — check if used

---

## QUALITY CHECKLIST (verify before pushing)

- [ ] Zero lint errors
- [ ] Zero lint warnings
- [ ] Build succeeds
- [ ] No -v2 directories remain
- [ ] No orphaned config files
- [ ] All calculator cards in page.tsx have matching pages
- [ ] All calculator pages import from existing (non-deleted) config files
- [ ] Header nav links all resolve to existing pages
- [ ] No `autonomy-permissions.json` or `permissions.json` in repo
- [ ] No `prompts/` directory in repo
- [ ] Git push succeeds

## FINAL NOTE
Be thorough but efficient. If a calculator page is fundamentally broken (e.g., missing config file, wrong architecture), do a minimal fix rather than a rewrite. The goal is: everything compiles, everything renders, everything deploys. Cosmetic improvements can come later.
