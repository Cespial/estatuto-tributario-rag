// UVT historico 2006-2026
export const UVT_VALUES: Record<number, number> = {
  2006: 20_000,
  2007: 20_974,
  2008: 22_054,
  2009: 23_763,
  2010: 24_555,
  2011: 25_132,
  2012: 26_049,
  2013: 26_841,
  2014: 27_485,
  2015: 28_279,
  2016: 29_753,
  2017: 31_859,
  2018: 33_156,
  2019: 34_270,
  2020: 35_607,
  2021: 36_308,
  2022: 38_004,
  2023: 42_412,
  2024: 47_065,
  2025: 49_799,
  2026: 52_374,
};

export const CURRENT_UVT_YEAR = 2026;

// Tabla marginal Art. 241 ET — Renta personas naturales (cedula general)
export const RENTA_BRACKETS = [
  { from: 0, to: 1_090, rate: 0, base: 0 },
  { from: 1_090, to: 1_700, rate: 0.19, base: 0 },
  { from: 1_700, to: 4_100, rate: 0.28, base: 116 },
  { from: 4_100, to: 8_670, rate: 0.33, base: 788 },
  { from: 8_670, to: 18_970, rate: 0.35, base: 2_296 },
  { from: 18_970, to: 31_000, rate: 0.37, base: 5_901 },
  { from: 31_000, to: Infinity, rate: 0.39, base: 10_352 },
];

// Tabla retencion salarios Art. 383 ET
export const RETENCION_SALARIOS_BRACKETS = [
  { from: 0, to: 95, rate: 0, base: 0 },
  { from: 95, to: 150, rate: 0.19, base: 0 },
  { from: 150, to: 360, rate: 0.28, base: 10 },
  { from: 360, to: 640, rate: 0.33, base: 69 },
  { from: 640, to: 945, rate: 0.35, base: 161 },
  { from: 945, to: 2_300, rate: 0.37, base: 268 },
  { from: 2_300, to: Infinity, rate: 0.39, base: 770 },
];

// Conceptos de retencion en la fuente 2026 (Decreto 0572/2025)
export const RETENCION_CONCEPTOS = [
  { id: "compras", concepto: "Compras generales", baseUVT: 10, tarifa: 0.025, declarante: null, art: "401" },
  { id: "servicios-d", concepto: "Servicios (declarante)", baseUVT: 2, tarifa: 0.04, declarante: true, art: "392" },
  { id: "servicios-nd", concepto: "Servicios (no declarante)", baseUVT: 2, tarifa: 0.06, declarante: false, art: "392" },
  { id: "honorarios-d", concepto: "Honorarios (declarante)", baseUVT: 0, tarifa: 0.10, declarante: true, art: "392" },
  { id: "honorarios-nd", concepto: "Honorarios (no declarante)", baseUVT: 0, tarifa: 0.11, declarante: false, art: "392" },
  { id: "arrendamiento", concepto: "Arrendamiento inmuebles", baseUVT: 10, tarifa: 0.035, declarante: null, art: "401" },
  { id: "loterias", concepto: "Loterias, rifas, apuestas", baseUVT: 48, tarifa: 0.20, declarante: null, art: "317" },
  { id: "activos-fijos", concepto: "Enajenacion activos fijos (PN)", baseUVT: 10, tarifa: 0.01, declarante: null, art: "398" },
  {
    id: "salarios",
    concepto: "Salarios y rentas de trabajo",
    baseUVT: 0,
    tarifa: null,
    declarante: null,
    art: "383",
    progressive: true,
  },
] as const;

// Limites Ley 2277/2022
export const LEY_2277_LIMITS = {
  rentasExentasMaxUVT: 790,
  deduccionesExentasMaxUVT: 1_340,
  dependienteUVT: 72,
  maxDependientes: 4,
};

// GMF
export const GMF_RATE = 0.004;
export const GMF_EXEMPT_UVT = 350;

// IVA
export const IVA_RATES = { general: 0.19, reducido: 0.05 };
