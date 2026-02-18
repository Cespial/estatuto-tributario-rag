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
