// ── Ganancias Ocasionales, Dividendos & Patrimonio — Actualizado 2026 (Ley 2277) ──

/** Ganancias Ocasionales — Art. 313, 314 ET */
export const GANANCIA_OCASIONAL_RATE = 0.15;

/** Exención vivienda — Art. 311-1 ET (Modificado Ley 2277): primeras 5,000 UVT */
export const VIVIENDA_EXENCION_UVT = 5_000;

/** Exenciones herencias — Art. 307 ET (Modificado Ley 2277) */
export const HERENCIA_VIVIENDA_EXENCION_UVT = 13_000; // Numeral 1
export const HERENCIA_OTROS_INMUEBLES_EXENCION_UVT = 7_700; // Numeral 2
export const HERENCIA_EXENCION_HEREDEROS_UVT = 3_250; // Numeral 3
export const HERENCIA_EXENCION_OTROS_PCT = 0.20; // Numeral 4
export const HERENCIA_EXENCION_OTROS_TOPE_UVT = 1_625; // Numeral 4 (Modificado Ley 2277)

/** Porcion conyugal exenta — Art. 307 Par. ET */
export const PORCION_CONYUGAL_EXENTA_UVT = 3_250;

/** Factores de ajuste fiscal Art. 73 */
export const REAJUSTE_FISCAL_2025 = 0.0581; 

/** Dividendos Art. 242 — Tabla personas naturales residentes (sobre dividendos gravados a nivel societario) */
export const DIVIDENDOS_PN_BRACKETS = [
  { from: 0,    to: 1_090, rate: 0,    base: 0 },
  { from: 1_090, to: Infinity, rate: 0.20, base: 0 },
] as const;

/** Dividendos no gravados a nivel societario — Art. 242 Inc. 2: tarifa 35% primero */
export const DIVIDENDOS_NO_GRAVADOS_RATE = 0.35;

export const DIVIDENDOS_DESCUENTO_RATE = 0.19; // Art. 254-1

/** Impuesto al Patrimonio 2026 */
export const PATRIMONIO_THRESHOLD_UVT = 40_000;
export const PATRIMONIO_VIVIENDA_EXCLUSION_UVT = 12_000; // Art. 295-3

export const PATRIMONIO_BRACKETS = [
  { from: 0,       to: 40_000,  rate: 0,     base: 0 },
  { from: 40_000,  to: 70_000,  rate: 0.005, base: 0 },
  { from: 70_000,  to: 120_000, rate: 0.010, base: 150 },
  { from: 120_000, to: 200_000, rate: 0.015, base: 650 },
  { from: 200_000, to: 300_000, rate: 0.025, base: 1_850 },
  { from: 300_000, to: Infinity, rate: 0.050, base: 4_350 },
] as const;
