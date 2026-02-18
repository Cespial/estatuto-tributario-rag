// ── Wave 4: Intereses Mora, SIMPLE, Auditoria, Pension, Depreciacion, Consumo — 2026 ──

/** Intereses moratorios DIAN — Art. 634-635 ET
 *  Tasa = equivalente diario de tasa de usura para credito de consumo
 *  Tasa efectiva anual usura vigente al momento (aproximada, cambia trimestralmente) */
export const INTERES_MORA_RATES = [
  { desde: "2025-10-01", hasta: "2025-12-31", tasaEA: 0.2683, label: "26.83% EA (Oct-Dic 2025)" },
  { desde: "2026-01-01", hasta: "2026-03-31", tasaEA: 0.2567, label: "25.67% EA (Ene-Mar 2026)" },
  { desde: "2026-04-01", hasta: "2026-06-30", tasaEA: 0.2450, label: "24.50% EA (Abr-Jun 2026)" },
  { desde: "2026-07-01", hasta: "2026-09-30", tasaEA: 0.2350, label: "23.50% EA (Jul-Sep 2026)" },
  { desde: "2026-10-01", hasta: "2026-12-31", tasaEA: 0.2350, label: "23.50% EA (Oct-Dic 2026)" },
] as const;

/** Beneficio de auditoria — Art. 689-3 ET (vigente 2022-2026) */
export const BENEFICIO_AUDITORIA = {
  incremento6Meses: 0.35,   // 35% incremento → firmeza 6 meses
  incremento12Meses: 0.25,  // 25% incremento → firmeza 12 meses
  impuestoMinUVT: 71,       // Impuesto neto >= 71 UVT para aplicar
  vigencia: "2022-2026",
} as const;

/** Pension — Ley 100/1993, Ley 797/2003, Ley 2381/2024 */
export const PENSION_REQUISITOS = {
  edadHombreActual: 62,
  edadMujerActual: 57,
  semanasBase: 1300,
} as const;

/** Reduccion semanas mujeres — Ley 2381/2024 (vigente desde 1 ene 2026) */
export const SEMANAS_MUJERES_PROGRESIVO = [
  { anio: 2025, semanas: 1300 },
  { anio: 2026, semanas: 1250 },
  { anio: 2027, semanas: 1200 },
  { anio: 2028, semanas: 1150 },
  { anio: 2029, semanas: 1100 },
  { anio: 2030, semanas: 1050 },
  { anio: 2031, semanas: 1000 },
  { anio: 2032, semanas: 1000 },
  { anio: 2033, semanas: 1000 },
  { anio: 2034, semanas: 1000 },
  { anio: 2035, semanas: 1000 },
  { anio: 2036, semanas: 1000 },
] as const;

/** Depreciacion fiscal — Art. 137 ET */
export const DEPRECIACION_TASAS = [
  { tipo: "edificios", label: "Edificaciones y construcciones", tasaMax: 0.0222, vidaUtil: 45 },
  { tipo: "maquinaria", label: "Maquinaria y equipo", tasaMax: 0.10, vidaUtil: 10 },
  { tipo: "muebles", label: "Muebles y enseres", tasaMax: 0.10, vidaUtil: 10 },
  { tipo: "vehiculos", label: "Equipo de transporte", tasaMax: 0.10, vidaUtil: 10 },
  { tipo: "computadores", label: "Equipo de computacion y comunicacion", tasaMax: 0.20, vidaUtil: 5 },
  { tipo: "redes", label: "Redes de procesamiento de datos", tasaMax: 0.20, vidaUtil: 5 },
  { tipo: "semovientes", label: "Semovientes productivos", tasaMax: 0.10, vidaUtil: 10 },
] as const;

/** Impuesto nacional al consumo — Art. 512-1 ET */
export const CONSUMO_TARIFAS = [
  { tipo: "restaurantes", label: "Servicio de restaurante y bares", tarifa: 0.08, articulo: "512-1" },
  { tipo: "telefonia", label: "Servicio de telefonia movil", tarifa: 0.04, articulo: "512-2" },
  { tipo: "vehiculos_bajo", label: "Vehiculos (menos de USD 30,000)", tarifa: 0.08, articulo: "512-3" },
  { tipo: "vehiculos_alto", label: "Vehiculos (USD 30,000 o mas)", tarifa: 0.16, articulo: "512-3" },
  { tipo: "motos_alto", label: "Motocicletas > 200cc", tarifa: 0.08, articulo: "512-3", notas: "Puede aumentar a 19% por Dto 1474" },
  { tipo: "aeronaves", label: "Aeronaves, botes y similares", tarifa: 0.16, articulo: "512-4" },
] as const;
