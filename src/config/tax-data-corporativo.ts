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

/** Tasa de Tributacion Depurada (TTD) — Art. 240 Par. 6 */
export const TTD_MIN_RATE = 0.15;

/** Sobretasa financiero 2026 — Dto 1474/2025 */
export const SOBRETASA_FINANCIERO_RATE = 0.15; // 35% + 15% = 50% total
export const SOBRETASA_FINANCIERO_THRESHOLD_UVT = 120_000;

/** Sanciones — Art. 641, 642, 643, 644, 647, 639 ET */
export const SANCION_MINIMA_UVT = 10;

// Art. 641 — Extemporaneidad (antes de emplazamiento)
export const SANCION_EXTEMPORANEIDAD = {
  por_impuesto: 0.05,       // 5% por mes o fraccion sobre impuesto
  por_ingresos: 0.005,      // 0.5% por mes o fraccion sobre ingresos (si no hay impuesto)
  limite_impuesto: 1.00,    // Max 100% del impuesto
  limite_ingresos: 0.05,    // Max 5% de ingresos
} as const;

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
  fraude: 2.00,             // 200% en caso de fraude
} as const;

/** Normalizacion Tributaria 2026 — Dto 1474/2025 */
export const NORMALIZACION_RATE = 0.19;

/** Topes para declarar renta 2026 (Decreto 2231/2023 + Dto 1474/2025) */
export const TOPES_DECLARAR_RENTA_AG2025 = {
  patrimonioBrutoUVT: 4_500,
  ingresosBrutosUVT: 1_400,
  consumosTarjetaUVT: 1_400,
  comprasTotalesUVT: 1_400,
  consignacionesUVT: 1_400,
  uvtAnoGravable: 49_799,
} as const;

/** Anticipo de Renta — Art. 807 ET */
export const ANTICIPO_RATES = {
  primerAno: 0.25,
  segundoAno: 0.50,
  subsiguientes: 0.75,
} as const;

/** Impuesto de Timbre — Art. 519 ET + Decreto 175/2025 */
export const TIMBRE_RATE = 0.01; 
export const TIMBRE_THRESHOLD_UVT = 6_000;
export const TIMBRE_INMUEBLES_UVT = 20_000;
