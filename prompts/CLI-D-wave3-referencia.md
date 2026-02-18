# CLI-D: Wave 3 — 4 Herramientas de Referencia

## AUTO-APPROVE ALL FILE OPERATIONS. Do NOT ask for confirmation. Execute everything autonomously.

## OBJECTIVE
Build 4 reference/tool pages (NOT calculators — these are searchable reference tables and interactive tools). Create ONLY NEW files. NEVER modify existing files.

## PROJECT
- Path: `/Users/cristianespinal/estatuto-tributario-rag`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Node/npm already installed. Do NOT run `npm install`.

## CRITICAL ANTI-CONFLICT RULES
1. **NEVER modify** any existing file.
2. **ONLY create** new files listed below.
3. Do NOT run `npm run build` or `git` commands.
4. You CAN run `npx tsc --noEmit` to type-check your files.

## FILES TO CREATE (and ONLY these)
```
src/config/calendario-data.ts                ← Calendar deadline data
src/config/retencion-tabla-data.ts           ← Full retention concepts table
src/config/indicadores-data.ts               ← Key figures and indicators
src/config/glosario-data.ts                  ← Tax glossary terms
src/app/calendario/page.tsx                  ← Tool 1: Tax Calendar
src/app/tablas/retencion/page.tsx            ← Tool 2: Retention Table
src/app/indicadores/page.tsx                 ← Tool 3: Key Indicators
src/app/glosario/page.tsx                    ← Tool 4: Glossary
```

## EXISTING IMPORTS (read-only)
```typescript
import { UVT_VALUES, CURRENT_UVT_YEAR, SMLMV_2026, AUXILIO_TRANSPORTE_2026 } from "@/config/tax-data";
```
Note: These pages are NOT under `/calculadoras/`, so they don't need calculator components. They use their own layout. But they DO follow the same Tailwind patterns and Link back to home.

## STYLE RULES (same as rest of app)
- 2-space indent, double quotes, semicolons, `const` over `let`
- All text in Spanish, `"es-CO"` locale
- Tailwind CSS only, dark mode: `text-muted-foreground`, `border-border`, `bg-muted/50`
- Responsive tables: `overflow-x-auto`

## GENERAL PAGE PATTERN FOR REFERENCE PAGES
```tsx
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function PageName() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Link href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Inicio
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Page Title</h1>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      {/* Content */}
    </>
  );
}
```

---

## CONFIG FILE 1: `src/config/calendario-data.ts`

```typescript
// ── Calendario Tributario 2026 ──
// Source: DIAN Resolucion (typically published late December of prior year)
// Note: These are approximate dates based on typical DIAN patterns.
// Real dates should be verified against the official DIAN resolution for 2026.

export interface DeadlineEntry {
  obligacion: string;
  descripcion: string;
  tipoContribuyente: "grandes" | "juridicas" | "naturales" | "todos";
  periodicidad: "anual" | "bimestral" | "cuatrimestral" | "mensual";
  vencimientos: Array<{
    periodo: string;
    ultimoDigito: string;
    fecha: string; // ISO date
  }>;
}

export const OBLIGACIONES: DeadlineEntry[] = [
  {
    obligacion: "Declaracion de Renta Personas Naturales",
    descripcion: "Declaracion anual del impuesto sobre la renta y complementarios",
    tipoContribuyente: "naturales",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "01-02", fecha: "2026-08-12" },
      { periodo: "AG 2025", ultimoDigito: "03-04", fecha: "2026-08-13" },
      { periodo: "AG 2025", ultimoDigito: "05-06", fecha: "2026-08-14" },
      { periodo: "AG 2025", ultimoDigito: "07-08", fecha: "2026-08-18" },
      { periodo: "AG 2025", ultimoDigito: "09-10", fecha: "2026-08-19" },
      { periodo: "AG 2025", ultimoDigito: "11-12", fecha: "2026-08-20" },
      { periodo: "AG 2025", ultimoDigito: "13-14", fecha: "2026-08-21" },
      { periodo: "AG 2025", ultimoDigito: "15-16", fecha: "2026-08-25" },
      { periodo: "AG 2025", ultimoDigito: "17-18", fecha: "2026-08-26" },
      { periodo: "AG 2025", ultimoDigito: "19-20", fecha: "2026-08-27" },
      { periodo: "AG 2025", ultimoDigito: "21-22", fecha: "2026-08-28" },
      { periodo: "AG 2025", ultimoDigito: "23-24", fecha: "2026-09-01" },
      { periodo: "AG 2025", ultimoDigito: "25-26", fecha: "2026-09-02" },
      { periodo: "AG 2025", ultimoDigito: "27-28", fecha: "2026-09-03" },
      { periodo: "AG 2025", ultimoDigito: "29-30", fecha: "2026-09-04" },
      { periodo: "AG 2025", ultimoDigito: "31-32", fecha: "2026-09-08" },
      { periodo: "AG 2025", ultimoDigito: "33-34", fecha: "2026-09-09" },
      { periodo: "AG 2025", ultimoDigito: "35-36", fecha: "2026-09-10" },
      { periodo: "AG 2025", ultimoDigito: "37-38", fecha: "2026-09-11" },
      { periodo: "AG 2025", ultimoDigito: "39-40", fecha: "2026-09-15" },
      { periodo: "AG 2025", ultimoDigito: "41-42", fecha: "2026-09-16" },
      { periodo: "AG 2025", ultimoDigito: "43-44", fecha: "2026-09-17" },
      { periodo: "AG 2025", ultimoDigito: "45-46", fecha: "2026-09-18" },
      { periodo: "AG 2025", ultimoDigito: "47-48", fecha: "2026-09-22" },
      { periodo: "AG 2025", ultimoDigito: "49-50", fecha: "2026-09-23" },
      { periodo: "AG 2025", ultimoDigito: "51-52", fecha: "2026-09-24" },
      { periodo: "AG 2025", ultimoDigito: "53-54", fecha: "2026-09-25" },
      { periodo: "AG 2025", ultimoDigito: "55-56", fecha: "2026-09-29" },
      { periodo: "AG 2025", ultimoDigito: "57-58", fecha: "2026-09-30" },
      { periodo: "AG 2025", ultimoDigito: "59-60", fecha: "2026-10-01" },
      { periodo: "AG 2025", ultimoDigito: "61-62", fecha: "2026-10-02" },
      { periodo: "AG 2025", ultimoDigito: "63-64", fecha: "2026-10-06" },
      { periodo: "AG 2025", ultimoDigito: "65-66", fecha: "2026-10-07" },
      { periodo: "AG 2025", ultimoDigito: "67-68", fecha: "2026-10-08" },
      { periodo: "AG 2025", ultimoDigito: "69-70", fecha: "2026-10-09" },
      { periodo: "AG 2025", ultimoDigito: "71-72", fecha: "2026-10-14" },
      { periodo: "AG 2025", ultimoDigito: "73-74", fecha: "2026-10-15" },
      { periodo: "AG 2025", ultimoDigito: "75-76", fecha: "2026-10-16" },
      { periodo: "AG 2025", ultimoDigito: "77-78", fecha: "2026-10-20" },
      { periodo: "AG 2025", ultimoDigito: "79-80", fecha: "2026-10-21" },
      { periodo: "AG 2025", ultimoDigito: "81-82", fecha: "2026-10-22" },
      { periodo: "AG 2025", ultimoDigito: "83-84", fecha: "2026-10-23" },
      { periodo: "AG 2025", ultimoDigito: "85-86", fecha: "2026-10-27" },
      { periodo: "AG 2025", ultimoDigito: "87-88", fecha: "2026-10-28" },
      { periodo: "AG 2025", ultimoDigito: "89-90", fecha: "2026-10-29" },
      { periodo: "AG 2025", ultimoDigito: "91-92", fecha: "2026-10-30" },
      { periodo: "AG 2025", ultimoDigito: "93-94", fecha: "2026-11-03" },
      { periodo: "AG 2025", ultimoDigito: "95-96", fecha: "2026-11-04" },
      { periodo: "AG 2025", ultimoDigito: "97-98", fecha: "2026-11-05" },
      { periodo: "AG 2025", ultimoDigito: "99-00", fecha: "2026-11-06" },
    ],
  },
  {
    obligacion: "Declaracion de Renta Personas Juridicas",
    descripcion: "Declaracion anual del impuesto sobre la renta sociedades",
    tipoContribuyente: "juridicas",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-04-14" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-04-15" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-04-16" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-04-17" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-04-20" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-04-21" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-04-22" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-04-23" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-04-24" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-04-27" },
    ],
  },
  {
    obligacion: "Retencion en la Fuente (mensual)",
    descripcion: "Declaracion y pago mensual de retenciones practicadas",
    tipoContribuyente: "todos",
    periodicidad: "mensual",
    vencimientos: [
      { periodo: "Enero 2026", ultimoDigito: "1", fecha: "2026-02-11" },
      { periodo: "Enero 2026", ultimoDigito: "2-9,0", fecha: "2026-02-12" },
      { periodo: "Febrero 2026", ultimoDigito: "1", fecha: "2026-03-11" },
      { periodo: "Febrero 2026", ultimoDigito: "2-9,0", fecha: "2026-03-12" },
    ],
  },
  {
    obligacion: "IVA Bimestral",
    descripcion: "Declaracion bimestral del impuesto sobre las ventas",
    tipoContribuyente: "todos",
    periodicidad: "bimestral",
    vencimientos: [
      { periodo: "Ene-Feb 2026", ultimoDigito: "1", fecha: "2026-03-11" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "2-9,0", fecha: "2026-03-12" },
    ],
  },
];

// Note: Add a disclaimer that dates should be verified against official DIAN resolution
export const CALENDARIO_DISCLAIMER = "Fechas basadas en patrones historicos de la DIAN. Verifique contra la Resolucion oficial de la DIAN para 2026. Ultima actualizacion: Febrero 2026.";
```

---

## CONFIG FILE 2: `src/config/retencion-tabla-data.ts`

```typescript
// ── Tabla General de Retencion en la Fuente 2026 ──
// Decreto 0572/2025 + Estatuto Tributario

export interface RetencionConcepto {
  id: string;
  concepto: string;
  baseMinUVT: number;
  tarifa: number;
  tarifaNoDeclarante?: number;
  articulo: string;
  notas?: string;
}

export const RETENCION_CONCEPTOS_COMPLETOS: RetencionConcepto[] = [
  // ── Compras ──
  { id: "compras-general", concepto: "Compras generales (declarantes)", baseMinUVT: 27, tarifa: 0.025, articulo: "401", notas: "Aplica sobre pagos o abonos" },
  { id: "compras-no-decl", concepto: "Compras generales (no declarantes)", baseMinUVT: 27, tarifa: 0.035, articulo: "401" },
  { id: "compras-combustible", concepto: "Combustibles derivados del petroleo", baseMinUVT: 0, tarifa: 0.001, articulo: "401" },
  { id: "compras-cafe-export", concepto: "Cafe pergamino o cereza", baseMinUVT: 160, tarifa: 0.005, articulo: "401" },
  { id: "compras-oro", concepto: "Productos agropecuarios sin procesamiento", baseMinUVT: 92, tarifa: 0.015, articulo: "401" },
  { id: "compras-vehiculos", concepto: "Compra de vehiculos", baseMinUVT: 0, tarifa: 0.01, articulo: "401" },
  { id: "compras-bienes-raices", concepto: "Compra de bienes raices", baseMinUVT: 0, tarifa: 0.01, articulo: "401", notas: "Para vivienda: 1%; otros inmuebles: 2.5%" },

  // ── Servicios ──
  { id: "servicios-general-d", concepto: "Servicios en general (declarantes)", baseMinUVT: 4, tarifa: 0.04, articulo: "392" },
  { id: "servicios-general-nd", concepto: "Servicios en general (no declarantes)", baseMinUVT: 4, tarifa: 0.06, articulo: "392" },
  { id: "servicios-transporte-carga", concepto: "Transporte de carga", baseMinUVT: 4, tarifa: 0.01, articulo: "392-1" },
  { id: "servicios-transporte-pasajeros", concepto: "Transporte nacional de pasajeros (terrestre)", baseMinUVT: 27, tarifa: 0.035, articulo: "392-1" },
  { id: "servicios-transporte-aereo", concepto: "Transporte nacional de pasajeros (aereo/maritimo)", baseMinUVT: 4, tarifa: 0.01, articulo: "392-1" },
  { id: "servicios-hotel", concepto: "Servicios de hotel, restaurante y hospedaje", baseMinUVT: 4, tarifa: 0.035, articulo: "392" },
  { id: "servicios-temporales", concepto: "Empresas de servicios temporales", baseMinUVT: 4, tarifa: 0.01, articulo: "392" },
  { id: "servicios-aseo-vigilancia", concepto: "Servicios de aseo y vigilancia", baseMinUVT: 4, tarifa: 0.02, articulo: "392" },

  // ── Honorarios y comisiones ──
  { id: "honorarios-d", concepto: "Honorarios y comisiones (declarantes PJ)", baseMinUVT: 0, tarifa: 0.10, articulo: "392" },
  { id: "honorarios-nd", concepto: "Honorarios y comisiones (no declarantes)", baseMinUVT: 0, tarifa: 0.11, articulo: "392" },
  { id: "honorarios-pn-d", concepto: "Honorarios persona natural (declarante)", baseMinUVT: 0, tarifa: 0.10, articulo: "392" },
  { id: "consultorias-d", concepto: "Consultorias (declarantes)", baseMinUVT: 0, tarifa: 0.10, articulo: "392" },
  { id: "consultorias-nd", concepto: "Consultorias (no declarantes)", baseMinUVT: 0, tarifa: 0.11, articulo: "392" },

  // ── Arrendamientos ──
  { id: "arriendo-inmuebles", concepto: "Arrendamiento de bienes inmuebles", baseMinUVT: 27, tarifa: 0.035, articulo: "401" },
  { id: "arriendo-muebles", concepto: "Arrendamiento de bienes muebles", baseMinUVT: 0, tarifa: 0.04, articulo: "401" },

  // ── Rendimientos financieros ──
  { id: "rendimientos-financieros", concepto: "Rendimientos financieros", baseMinUVT: 0, tarifa: 0.07, articulo: "395", notas: "CDT, ahorros, fiducia, etc." },

  // ── Dividendos ──
  { id: "dividendos-pn", concepto: "Dividendos (personas naturales residentes)", baseMinUVT: 0, tarifa: 0.20, articulo: "242", notas: "Progresiva segun Art. 242" },
  { id: "dividendos-pj", concepto: "Dividendos (personas juridicas nacionales)", baseMinUVT: 0, tarifa: 0.075, articulo: "242-1" },

  // ── Loterias y azar ──
  { id: "loterias", concepto: "Loterias, rifas, apuestas y similares", baseMinUVT: 48, tarifa: 0.20, articulo: "317" },

  // ── Enajenacion activos ──
  { id: "activos-fijos-pn", concepto: "Enajenacion de activos fijos (persona natural)", baseMinUVT: 0, tarifa: 0.01, articulo: "398" },
  { id: "activos-fijos-pj", concepto: "Enajenacion de activos fijos (persona juridica)", baseMinUVT: 0, tarifa: 0.01, articulo: "398" },

  // ── Otros ──
  { id: "pagos-exterior", concepto: "Pagos al exterior (general)", baseMinUVT: 0, tarifa: 0.20, articulo: "406-414", notas: "Varia por concepto y convenio" },
  { id: "pagos-exterior-software", concepto: "Pagos al exterior por software", baseMinUVT: 0, tarifa: 0.267, articulo: "411" },
  { id: "emolumentos-eclesiasticos", concepto: "Emolumentos eclesiasticos", baseMinUVT: 27, tarifa: 0.04, articulo: "401" },
  { id: "contratos-construccion", concepto: "Contratos de construccion o urbanizacion", baseMinUVT: 27, tarifa: 0.02, articulo: "401" },
];
```

---

## CONFIG FILE 3: `src/config/indicadores-data.ts`

```typescript
// ── Indicadores y Cifras Tributarias 2026 ──

export interface Indicador {
  categoria: string;
  items: Array<{
    nombre: string;
    valor: string;
    valorNumerico?: number;
    notas?: string;
    articulo?: string;
  }>;
}

export const INDICADORES_2026: Indicador[] = [
  {
    categoria: "Valores Basicos",
    items: [
      { nombre: "UVT 2026", valor: "$52,374", valorNumerico: 52374, notas: "Resolucion DIAN 001264/2025", articulo: "868" },
      { nombre: "SMLMV 2026", valor: "$1,750,905", valorNumerico: 1750905, notas: "Decreto 0025/2025" },
      { nombre: "Auxilio de Transporte 2026", valor: "$249,095", valorNumerico: 249095, notas: "Decreto 0026/2025" },
      { nombre: "Total minimo (SMLMV + Aux)", valor: "$2,000,000", valorNumerico: 2000000 },
      { nombre: "Salario integral minimo", valor: "$22,761,765", valorNumerico: 22761765, notas: "13 SMLMV" },
    ],
  },
  {
    categoria: "Topes Declarar Renta PN (AG 2025)",
    items: [
      { nombre: "Patrimonio bruto", valor: "4,500 UVT ($224,095,500)", notas: "UVT 2025 = $49,799", articulo: "592" },
      { nombre: "Ingresos brutos", valor: "1,400 UVT ($69,718,600)", articulo: "593" },
      { nombre: "Consumos tarjeta credito", valor: "1,400 UVT ($69,718,600)", articulo: "594-3" },
      { nombre: "Compras y consumos", valor: "1,400 UVT ($69,718,600)", articulo: "594-3" },
      { nombre: "Consignaciones bancarias", valor: "1,400 UVT ($69,718,600)", articulo: "594-3" },
    ],
  },
  {
    categoria: "Tarifas Impuesto de Renta",
    items: [
      { nombre: "Personas naturales (max)", valor: "0% - 39%", notas: "Tabla progresiva Art. 241", articulo: "241" },
      { nombre: "Personas juridicas (general)", valor: "35%", articulo: "240" },
      { nombre: "Sector financiero", valor: "50%", notas: "35% + 15% sobretasa (Decreto 1474/2025)", articulo: "240" },
      { nombre: "Zonas francas (exportacion)", valor: "20%", articulo: "240-1" },
      { nombre: "Ganancias ocasionales", valor: "15%", articulo: "314" },
      { nombre: "Dividendos PN (max)", valor: "20%", notas: "Sobre >1,090 UVT", articulo: "242" },
    ],
  },
  {
    categoria: "Limites Deducciones y Exenciones PN",
    items: [
      { nombre: "Rentas exentas maximo", valor: "790 UVT ($41,375,460)", notas: "Ley 2277/2022", articulo: "206" },
      { nombre: "Deducciones + exentas maximo", valor: "1,340 UVT ($70,181,160)", articulo: "336" },
      { nombre: "Limite global", valor: "40% del ingreso neto", articulo: "336" },
      { nombre: "Dependientes", valor: "72 UVT ($3,770,928), max 4", articulo: "387" },
      { nombre: "Medicina prepagada", valor: "16 UVT/mes ($838,784)", articulo: "387" },
    ],
  },
  {
    categoria: "Seguridad Social",
    items: [
      { nombre: "Salud total", valor: "12.5% (4% trabajador + 8.5% empleador)" },
      { nombre: "Pension total", valor: "16% (4% trabajador + 12% empleador)" },
      { nombre: "ARL Clase I (minima)", valor: "0.522% (empleador)" },
      { nombre: "IBC minimo", valor: "1 SMLMV ($1,750,905)" },
      { nombre: "IBC maximo", valor: "25 SMLMV ($43,772,625)" },
      { nombre: "Exoneracion Art. 114-1", valor: "IBC < 10 SMLMV", notas: "Salud emp., SENA, ICBF", articulo: "114-1" },
    ],
  },
  {
    categoria: "Otros Impuestos",
    items: [
      { nombre: "IVA general", valor: "19%", articulo: "468" },
      { nombre: "IVA reducido", valor: "5%", articulo: "468-1" },
      { nombre: "GMF (4x1000)", valor: "0.4%", articulo: "871" },
      { nombre: "GMF exencion mensual", valor: "350 UVT ($18,330,900)", articulo: "879" },
      { nombre: "Timbre", valor: "1% (> 6,000 UVT)", notas: "Decreto 175/2025", articulo: "519" },
      { nombre: "Patrimonio umbral", valor: "40,000 UVT", notas: "Decreto 1474/2025", articulo: "292-2" },
      { nombre: "Sancion minima", valor: "10 UVT ($523,740)", articulo: "639" },
    ],
  },
  {
    categoria: "Parafiscales",
    items: [
      { nombre: "SENA", valor: "2%", notas: "Exonerable Art. 114-1" },
      { nombre: "ICBF", valor: "3%", notas: "Exonerable Art. 114-1" },
      { nombre: "Caja Compensacion (CCF)", valor: "4%", notas: "Siempre se paga" },
    ],
  },
  {
    categoria: "Prestaciones Sociales (provision mensual)",
    items: [
      { nombre: "Cesantias", valor: "8.33% (1 mes/ano)" },
      { nombre: "Intereses cesantias", valor: "1% (12% anual sobre cesantias)" },
      { nombre: "Prima de servicios", valor: "8.33% (1 mes/ano, 2 pagos)" },
      { nombre: "Vacaciones", valor: "4.17% (15 dias habiles/ano)" },
    ],
  },
];
```

---

## CONFIG FILE 4: `src/config/glosario-data.ts`

```typescript
// ── Glosario Tributario Colombiano ──

export interface GlosarioTerm {
  termino: string;
  definicion: string;
  articulos?: string[]; // ET article references
  relacionados?: string[]; // related terms
}

export const GLOSARIO: GlosarioTerm[] = [
  { termino: "UVT", definicion: "Unidad de Valor Tributario. Medida de valor que permite ajustar los valores contenidos en las disposiciones relativas a los impuestos y obligaciones tributarias.", articulos: ["868"], relacionados: ["Base gravable"] },
  { termino: "SMLMV", definicion: "Salario Minimo Legal Mensual Vigente. Remuneracion minima que debe recibir un trabajador por su labor en Colombia. Para 2026: $1,750,905.", relacionados: ["IBC", "Auxilio de transporte"] },
  { termino: "Renta liquida gravable", definicion: "Resultado de restar a los ingresos netos las deducciones y rentas exentas permitidas. Es la base sobre la cual se aplica la tarifa del impuesto de renta.", articulos: ["178", "241"], relacionados: ["Base gravable", "Deducciones"] },
  { termino: "Base gravable", definicion: "Valor monetario o unidad de medida sobre el cual se aplica la tarifa del impuesto para establecer el valor del tributo.", articulos: ["338"], relacionados: ["Renta liquida gravable", "Hecho generador"] },
  { termino: "Hecho generador", definicion: "Presupuesto establecido por la ley para tipificar el tributo y cuya realizacion origina el nacimiento de la obligacion tributaria.", relacionados: ["Base gravable", "Sujeto pasivo"] },
  { termino: "Sujeto pasivo", definicion: "Persona natural o juridica obligada al cumplimiento de las obligaciones tributarias, ya sea en calidad de contribuyente o responsable.", relacionados: ["Contribuyente", "Responsable"] },
  { termino: "Contribuyente", definicion: "Persona natural o juridica respecto de quien se realiza el hecho generador de la obligacion tributaria.", articulos: ["2"], relacionados: ["Sujeto pasivo", "Declarante"] },
  { termino: "Declarante", definicion: "Persona obligada a presentar declaracion tributaria ante la DIAN.", articulos: ["591", "592"], relacionados: ["Contribuyente", "No declarante"] },
  { termino: "Retencion en la fuente", definicion: "Mecanismo de recaudo anticipado del impuesto, mediante el cual el pagador (agente retenedor) descuenta un porcentaje del pago y lo traslada a la DIAN.", articulos: ["367", "368"], relacionados: ["Agente retenedor", "Autorretención"] },
  { termino: "Agente retenedor", definicion: "Persona natural o juridica obligada a practicar la retencion en la fuente sobre pagos o abonos en cuenta.", articulos: ["368"], relacionados: ["Retencion en la fuente"] },
  { termino: "Autorretencion", definicion: "Mecanismo por el cual el mismo beneficiario del pago se practica la retencion en la fuente.", articulos: ["366-1"], relacionados: ["Retencion en la fuente"] },
  { termino: "INCRNGO", definicion: "Ingresos No Constitutivos de Renta ni Ganancia Ocasional. Ingresos que por disposicion legal se excluyen de la base gravable del impuesto de renta.", articulos: ["36-57-2"], relacionados: ["Renta exenta", "Deduccion"] },
  { termino: "Renta exenta", definicion: "Ingresos que estan gravados a tarifa cero (0%), lo que significa que se incluyen en la depuracion pero no generan impuesto.", articulos: ["206", "207"], relacionados: ["INCRNGO", "Deduccion"] },
  { termino: "Deduccion", definicion: "Gastos realizados durante el ano gravable que tienen relacion de causalidad, necesidad y proporcionalidad con la actividad productora de renta.", articulos: ["104", "105"], relacionados: ["Renta exenta", "Costos"] },
  { termino: "Ganancia ocasional", definicion: "Ingreso proveniente de actividades no habituales del contribuyente, como venta de activos fijos, herencias, loterias o donaciones.", articulos: ["299", "300"], relacionados: ["Renta ordinaria", "Activo fijo"] },
  { termino: "IVA", definicion: "Impuesto al Valor Agregado. Impuesto indirecto que grava la venta de bienes, la prestacion de servicios y las importaciones.", articulos: ["420", "468"], relacionados: ["Excluido", "Exento"] },
  { termino: "Bien exento de IVA", definicion: "Bien gravado a tarifa 0%. El responsable puede solicitar devolucion del IVA pagado en sus compras (descontable).", articulos: ["477"], relacionados: ["Bien excluido", "IVA descontable"] },
  { termino: "Bien excluido de IVA", definicion: "Bien que por ley no causa IVA. No genera derecho a IVA descontable.", articulos: ["424"], relacionados: ["Bien exento", "IVA"] },
  { termino: "GMF", definicion: "Gravamen a los Movimientos Financieros (4 por mil). Impuesto que grava las transacciones financieras realizadas por los usuarios del sistema.", articulos: ["871"], relacionados: ["4x1000"] },
  { termino: "IBC", definicion: "Ingreso Base de Cotizacion. Base sobre la cual se calculan los aportes a seguridad social (salud, pension, ARL).", relacionados: ["Seguridad social", "SMLMV"] },
  { termino: "Parafiscales", definicion: "Contribuciones obligatorias del empleador destinadas a SENA (2%), ICBF (3%) y Cajas de Compensacion Familiar (4%).", articulos: ["114-1"], relacionados: ["SENA", "ICBF", "CCF"] },
  { termino: "Exoneracion Art. 114-1", definicion: "Empleadores de personas juridicas exonerados de aportes a salud (8.5%), SENA (2%) e ICBF (3%) por trabajadores que devenguen menos de 10 SMLMV.", articulos: ["114-1"], relacionados: ["Parafiscales", "Seguridad social"] },
  { termino: "Sancion por extemporaneidad", definicion: "Sancion por presentar declaraciones tributarias fuera del plazo legal. Se calcula como porcentaje mensual del impuesto o ingresos.", articulos: ["641", "642"], relacionados: ["Sancion minima", "Art. 640 reduccion"] },
  { termino: "Beneficio de auditoria", definicion: "Reduccion del periodo de firmeza de la declaracion de renta cuando el contribuyente incrementa su impuesto en cierto porcentaje respecto al ano anterior.", articulos: ["689-3"], relacionados: ["Firmeza", "Declaracion de renta"] },
  { termino: "Anticipo de renta", definicion: "Pago anticipado del impuesto de renta del periodo siguiente, calculado como porcentaje del impuesto del periodo actual.", articulos: ["807"], relacionados: ["Declaracion de renta", "Retencion en la fuente"] },
  { termino: "SIMPLE", definicion: "Regimen Simple de Tributacion. Impuesto unificado que sustituye renta, IVA (para restaurantes), ICA e impuesto de consumo para ciertos contribuyentes.", articulos: ["903", "905", "908"], relacionados: ["Regimen ordinario"] },
  { termino: "Normalizacion tributaria", definicion: "Impuesto complementario al patrimonio para activos omitidos o pasivos inexistentes. Tarifa 2026: 19% (Decreto 1474/2025).", relacionados: ["Patrimonio", "Activos omitidos"] },
  { termino: "Renta presuntiva", definicion: "Renta minima del contribuyente calculada sobre su patrimonio liquido. Tarifa actual: 0% (desde 2021).", articulos: ["188", "189"], relacionados: ["Patrimonio liquido", "Renta ordinaria"] },
  { termino: "Comparacion patrimonial", definicion: "Mecanismo de control por el cual la DIAN puede determinar como renta gravable los incrementos patrimoniales no justificados.", articulos: ["236", "237"], relacionados: ["Patrimonio liquido", "Renta liquida"] },
  { termino: "Firmeza de la declaracion", definicion: "Fecha a partir de la cual la declaracion tributaria queda en firme y no puede ser modificada por la DIAN. Regla general: 3 anos.", articulos: ["714"], relacionados: ["Beneficio de auditoria", "Correccion"] },
  { termino: "Procedimiento 1", definicion: "Metodo de retencion en la fuente por salarios que calcula la retencion mensualmente aplicando la tabla del Art. 383 sobre el ingreso depurado.", articulos: ["385", "383"], relacionados: ["Procedimiento 2", "Depuracion"] },
  { termino: "Procedimiento 2", definicion: "Metodo de retencion en la fuente por salarios que calcula un porcentaje fijo semestral basado en el promedio de pagos de los ultimos 12 meses.", articulos: ["386"], relacionados: ["Procedimiento 1"] },
  { termino: "Depuracion", definicion: "Proceso de restar de los ingresos los conceptos permitidos (INCRNGO, deducciones, exentas) para obtener la base gravable.", articulos: ["388"], relacionados: ["Base gravable", "INCRNGO", "Deducciones"] },
];
```

---

## TOOL 1: Calendario Tributario 2026

**Route:** `/calendario/page.tsx`

### Features
- Search/filter by NIT last digits (text input)
- Filter by tipo de contribuyente (grandes, juridicas, naturales, todos)
- Filter by obligacion type
- Show upcoming deadlines first (highlight if within 30 days)
- Timeline view of the year

### Layout
- Page title "Calendario Tributario 2026"
- NIT input (2 digits), obligacion filter, tipo contribuyente filter
- Table: Obligacion | Periodo | Vencimiento | Estado (proximo/pasado/vigente)
- Highlight upcoming deadlines in yellow, past in muted
- Disclaimer at bottom

---

## TOOL 2: Tabla de Retencion en la Fuente

**Route:** `/tablas/retencion/page.tsx`

### Features
- Full searchable table of all 30+ retention concepts
- Search by concept name, article, or rate
- Show: Concepto | Base minima (UVT) | Base minima ($) | Tarifa | Articulo | Notas
- Click on article to link to `/articulo/{art}`
- Sort by concepto or tarifa
- UVT value shown at top for reference

---

## TOOL 3: Indicadores y Cifras Tributarias 2026

**Route:** `/indicadores/page.tsx`

### Features
- Card-based layout grouped by category
- Each card: Nombre | Valor (large font) | Notas
- Copy-to-clipboard button on each value
- Article links where applicable
- Search/filter across all indicators
- Show current UVT and SMLMV prominently at top

### Copy-to-clipboard implementation:
```tsx
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 text-xs text-muted-foreground hover:text-primary"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}
```

---

## TOOL 4: Glosario Tributario

**Route:** `/glosario/page.tsx`

### Features
- Alphabetically sorted list of terms
- Search bar filters terms in real-time
- Each term shows: Termino (bold) | Definicion | Articulos (as links) | Relacionados (as clickable filters)
- Clicking a "relacionado" scrolls to / filters that term
- Letter navigation (A-Z quick links at top)

### Layout
```
[A] [B] [C] ... [Z]  ← letter quick nav
[Search box]

Term 1 (bold)
Definition text. Art. 241, Art. 242
Relacionados: Base gravable, Deducciones

Term 2 (bold)
...
```

---

## VERIFICATION
```bash
npx tsc --noEmit src/config/calendario-data.ts src/config/retencion-tabla-data.ts src/config/indicadores-data.ts src/config/glosario-data.ts src/app/calendario/page.tsx src/app/tablas/retencion/page.tsx src/app/indicadores/page.tsx src/app/glosario/page.tsx
```
Fix any TypeScript errors. Do NOT run lint, build, or git commands.
