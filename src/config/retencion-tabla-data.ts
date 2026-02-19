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
  descripcion?: string;
  keywords?: string[];
  aplicaA?: "declarante" | "no-declarante" | "ambos";
  tooltip?: string;
  linkCalculadora?: string;
}

export const RETENCION_CONCEPTOS_COMPLETOS: RetencionConcepto[] = [
  // ── Compras ──
  { id: "compras-general", concepto: "Compras generales (declarantes)", baseMinUVT: 27, tarifa: 0.025, articulo: "401", notas: "Aplica sobre pagos o abonos", descripcion: "Compras de bienes gravados cuando el beneficiario es declarante.", keywords: ["compras", "bienes", "declarante"], aplicaA: "declarante", tooltip: "Validar calidad tributaria del proveedor.", linkCalculadora: "/calculadoras/retencion" },
  { id: "compras-no-decl", concepto: "Compras generales (no declarantes)", baseMinUVT: 27, tarifa: 0.035, articulo: "401", keywords: ["compras", "no declarante"], aplicaA: "no-declarante", linkCalculadora: "/calculadoras/retencion" },
  { id: "compras-combustible", concepto: "Combustibles derivados del petroleo", baseMinUVT: 0, tarifa: 0.001, articulo: "401", keywords: ["combustible", "petroleo"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "compras-cafe-export", concepto: "Cafe pergamino o cereza", baseMinUVT: 160, tarifa: 0.005, articulo: "401", keywords: ["cafe", "exportacion"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "compras-oro", concepto: "Productos agropecuarios sin procesamiento", baseMinUVT: 92, tarifa: 0.015, articulo: "401", keywords: ["agropecuario"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "compras-vehiculos", concepto: "Compra de vehiculos", baseMinUVT: 0, tarifa: 0.01, articulo: "401", keywords: ["vehiculos"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "compras-bienes-raices", concepto: "Compra de bienes raices", baseMinUVT: 0, tarifa: 0.01, articulo: "401", notas: "Para vivienda: 1%; otros inmuebles: 2.5%", keywords: ["inmuebles"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },

  // ── Servicios ──
  { id: "servicios-general-d", concepto: "Servicios en general (declarantes)", baseMinUVT: 4, tarifa: 0.04, articulo: "392", keywords: ["servicios", "declarante"], aplicaA: "declarante", tooltip: "Para servicios no clasificados con tarifa especial.", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-general-nd", concepto: "Servicios en general (no declarantes)", baseMinUVT: 4, tarifa: 0.06, articulo: "392", keywords: ["servicios", "no declarante"], aplicaA: "no-declarante", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-transporte-carga", concepto: "Transporte de carga", baseMinUVT: 4, tarifa: 0.01, articulo: "392-1", keywords: ["transporte", "carga"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-transporte-pasajeros", concepto: "Transporte nacional de pasajeros (terrestre)", baseMinUVT: 27, tarifa: 0.035, articulo: "392-1", keywords: ["transporte", "pasajeros"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-transporte-aereo", concepto: "Transporte nacional de pasajeros (aereo/maritimo)", baseMinUVT: 4, tarifa: 0.01, articulo: "392-1", keywords: ["transporte", "aereo", "maritimo"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-hotel", concepto: "Servicios de hotel, restaurante y hospedaje", baseMinUVT: 4, tarifa: 0.035, articulo: "392", keywords: ["hotel", "restaurante"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-temporales", concepto: "Empresas de servicios temporales", baseMinUVT: 4, tarifa: 0.01, articulo: "392", keywords: ["temporales"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "servicios-aseo-vigilancia", concepto: "Servicios de aseo y vigilancia", baseMinUVT: 4, tarifa: 0.02, articulo: "392", keywords: ["aseo", "vigilancia"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },

  // ── Honorarios y comisiones ──
  { id: "honorarios-d", concepto: "Honorarios y comisiones (declarantes PJ)", baseMinUVT: 0, tarifa: 0.10, articulo: "392", keywords: ["honorarios", "comisiones"], aplicaA: "declarante", linkCalculadora: "/calculadoras/retencion" },
  { id: "honorarios-nd", concepto: "Honorarios y comisiones (no declarantes)", baseMinUVT: 0, tarifa: 0.11, articulo: "392", keywords: ["honorarios", "comisiones"], aplicaA: "no-declarante", linkCalculadora: "/calculadoras/retencion" },
  { id: "honorarios-pn-d", concepto: "Honorarios persona natural (declarante)", baseMinUVT: 0, tarifa: 0.10, articulo: "392", keywords: ["honorarios", "persona natural"], aplicaA: "declarante", linkCalculadora: "/calculadoras/retencion" },
  { id: "consultorias-d", concepto: "Consultorias (declarantes)", baseMinUVT: 0, tarifa: 0.10, articulo: "392", keywords: ["consultoria"], aplicaA: "declarante", linkCalculadora: "/calculadoras/retencion" },
  { id: "consultorias-nd", concepto: "Consultorias (no declarantes)", baseMinUVT: 0, tarifa: 0.11, articulo: "392", keywords: ["consultoria"], aplicaA: "no-declarante", linkCalculadora: "/calculadoras/retencion" },

  // ── Arrendamientos ──
  { id: "arriendo-inmuebles", concepto: "Arrendamiento de bienes inmuebles", baseMinUVT: 27, tarifa: 0.035, articulo: "401", keywords: ["arrendamiento", "inmuebles"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "arriendo-muebles", concepto: "Arrendamiento de bienes muebles", baseMinUVT: 0, tarifa: 0.04, articulo: "401", keywords: ["arrendamiento", "muebles"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },

  // ── Rendimientos financieros ──
  { id: "rendimientos-financieros", concepto: "Rendimientos financieros", baseMinUVT: 0, tarifa: 0.07, articulo: "395", notas: "CDT, ahorros, fiducia, etc.", keywords: ["rendimientos", "cdt", "fiducia"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },

  // ── Dividendos ──
  { id: "dividendos-pn", concepto: "Dividendos (personas naturales residentes)", baseMinUVT: 0, tarifa: 0.20, articulo: "242", notas: "Progresiva segun Art. 242", keywords: ["dividendos", "persona natural"], aplicaA: "ambos", linkCalculadora: "/calculadoras/dividendos" },
  { id: "dividendos-pj", concepto: "Dividendos (personas juridicas nacionales)", baseMinUVT: 0, tarifa: 0.075, articulo: "242-1", keywords: ["dividendos", "persona juridica"], aplicaA: "ambos", linkCalculadora: "/calculadoras/dividendos-juridicas" },

  // ── Loterias y azar ──
  { id: "loterias", concepto: "Loterias, rifas, apuestas y similares", baseMinUVT: 48, tarifa: 0.20, articulo: "317", keywords: ["loterias", "rifas", "apuestas"], aplicaA: "ambos", linkCalculadora: "/calculadoras/ganancias-loterias" },

  // ── Enajenacion activos ──
  { id: "activos-fijos-pn", concepto: "Enajenacion de activos fijos (persona natural)", baseMinUVT: 0, tarifa: 0.01, articulo: "398", keywords: ["activos fijos"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "activos-fijos-pj", concepto: "Enajenacion de activos fijos (persona juridica)", baseMinUVT: 0, tarifa: 0.01, articulo: "398", keywords: ["activos fijos"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },

  // ── Otros ──
  { id: "pagos-exterior", concepto: "Pagos al exterior (general)", baseMinUVT: 0, tarifa: 0.20, articulo: "406-414", notas: "Varia por concepto y convenio", keywords: ["exterior"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "pagos-exterior-software", concepto: "Pagos al exterior por software", baseMinUVT: 0, tarifa: 0.267, articulo: "411", keywords: ["software", "exterior"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "emolumentos-eclesiasticos", concepto: "Emolumentos eclesiasticos", baseMinUVT: 27, tarifa: 0.04, articulo: "401", keywords: ["emolumentos"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
  { id: "contratos-construccion", concepto: "Contratos de construccion o urbanizacion", baseMinUVT: 27, tarifa: 0.02, articulo: "401", keywords: ["construccion"], aplicaA: "ambos", linkCalculadora: "/calculadoras/retencion" },
];

export const RETENCION_WIZARD_PAYMENT_TYPES = [
  { id: "servicios", label: "Pago por servicios", keywords: ["servicio", "consultoria", "honorario"] },
  { id: "compras", label: "Compra de bienes", keywords: ["compra", "inventario", "mercancia"] },
  { id: "arrendamientos", label: "Arrendamientos", keywords: ["arriendo", "arrendamiento"] },
  { id: "financieros", label: "Rendimientos o dividendos", keywords: ["rendimiento", "dividendo"] },
  { id: "exterior", label: "Pagos al exterior", keywords: ["exterior", "internacional"] },
] as const;
