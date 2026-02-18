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
