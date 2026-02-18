// ── Constantes Tributarias Sprint 2 — 2026 ──

import { UVT_VALUES, CURRENT_UVT_YEAR } from "./tax-data";

const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

/** Loterías, Rifas y Apuestas — Art. 304, 306, 317 ET */
export const LOTERIAS_RATE = 0.20;
export const LOTERIAS_RETENCION_BASE_UVT = 48;
export const LOTERIAS_MIN_RETENCION = LOTERIAS_RETENCION_BASE_UVT * uvt;

/** Tarifa General Personas Jurídicas — Art. 240 ET */
export const TARIFA_GENERAL_PJ = 0.35;

/** Dividendos Personas Jurídicas — Art. 242-1 ET */
export const DIVIDENDOS_PJ_RATES = {
  nacionales: 0.075,
  extranjeras: 0.20,
  cdi: 0.075,
  withholding: 0.075,
} as const;

/** Descuentos Tributarios — Art. 254 al 259 ET */
export const DESCUENTOS_TRIBUTARIOS = {
  iva_activos_pct: 1.0,
  donaciones_pct: 0.25,
  donaciones_tope_renta_pct: 0.25,
} as const;

/** Zonas Francas — Art. 240-1 ET */
export const ZONAS_FRANCAS = {
  tarifa_general: 0.20,
  tarifa_comercial: 0.35,
  plan_exportacion_min_pct: 0.40,
  tarifa_ttd_minima: 0.15,
} as const;
