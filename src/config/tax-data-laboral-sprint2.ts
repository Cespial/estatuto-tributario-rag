// Sprint 2 Labor Data — Licencias y Nomina

export const LICENCIA_MATERNIDAD = {
  semanas: 18,
  dias: 126,
} as const;

export const LICENCIA_PATERNIDAD_PROGRESIVA = [
  { desde: "2024-07-05", hasta: "2025-07-04", semanas: 4, dias: 28 },
  { desde: "2025-07-05", hasta: "2026-07-04", semanas: 5, dias: 35 },
  { desde: "2026-07-05", hasta: "9999-12-31", semanas: 6, dias: 42 },
] as const;

export const LICENCIA_COMPARTIDA = {
  semanasTransferibles: 6,
} as const;

export const NOMINA_RATES = {
  cesantias: 1 / 12,
  interesCesantias: 0.12,
  prima: 1 / 12,
  vacaciones: 15 / 360,
} as const;
