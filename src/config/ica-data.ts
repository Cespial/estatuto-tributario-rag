// ==========================================
// Datos y tipos para la Calculadora ICA
// Impuesto de Industria y Comercio
// Base legal: Ley 14/1983, Ley 1575/2012
// ==========================================

export type TipoActividad = "INDUSTRIAL" | "COMERCIAL" | "SERVICIOS" | "FINANCIERA";

export interface ActividadEconomica {
  codigo: string;
  descripcion: string;
  tarifa: number; // En por mil (x/1000)
  tipoActividad: TipoActividad;
}

export interface MunicipioICA {
  id: string;
  nombre: string;
  departamento: string;
  tarifas: {
    actividadPrincipal: ActividadEconomica;
    actividadesAdicionales: ActividadEconomica[];
  };
  avisosYTableros: { aplica: boolean; porcentaje: number };
  sobretasaBomberil: { aplica: boolean; porcentaje: number; base: "ICA" | "AVISOS" | "ICA+AVISOS" };
  sobretasaSeguridad: { aplica: boolean; porcentaje: number };
  anticipo: { aplica: boolean; porcentaje: number };
  descuentoProntoPago: { aplica: boolean; porcentaje: number };
  redondeoAMil?: boolean;
}

export interface IngresoActividad {
  codigoActividad: string;
  descripcion: string;
  tarifa: number;
  ingresos: number;
}

export interface BalanceICA {
  ingresosTotalesPais: number;
  ingresosFueraMunicipio: number;
  devoluciones: number;
  exportacionesYActivosFijos: number;
  actividadesExcluidasNoSujetas: number;
  actividadesExentas: number;
  ingresosPorActividad: IngresoActividad[];
  retencionesPracticadas: number;
  autorretenciones: number;
  anticipoAnterior: number;
  saldoFavorAnterior: number;
  // Campos adicionales del formulario oficial
  generacionEnergia?: number; // R19 - Ley 56/1981
  unidadesFinanciero?: number; // R22
  exenciones?: number; // R26
  sanciones?: number; // R31
  interesesMora?: number; // R37
}

export interface ResultadoICA {
  // Seccion B - Base Gravable
  renglon8: number;
  renglon9: number;
  renglon10: number;
  renglon11: number;
  renglon12: number;
  renglon13: number;
  renglon14: number;
  renglon15: number;
  // Seccion C - Actividades
  actividades: { nombre: string; codigo: string; ingresos: number; tarifa: number; impuesto: number }[];
  renglon16: number;
  renglon17: number;
  // Seccion D - Liquidacion
  renglon19?: number; // Generación energía
  renglon20: number;
  renglon21: number;
  renglon22?: number; // Unidades financiero
  renglon23: number;
  renglon24: number;
  renglon25: number;
  renglon26?: number; // Exenciones
  renglon27: number;
  renglon28: number;
  renglon29: number;
  renglon30: number;
  renglon31?: number; // Sanciones
  renglon32: number; // Saldo a favor anterior
  renglon33: number;
  renglon34: number;
  // Seccion E - Pago
  renglon35: number;
  renglon36: number;
  renglon37?: number; // Intereses de mora
  renglon38: number;
}

export const CIIU_CODIGOS: Record<string, string> = {
  '1011': 'Procesamiento y conservación de carne',
  '1081': 'Elaboración de productos de panadería',
  '2511': 'Fabricación de productos metálicos para uso estructural',
  '2599': 'Fabricación de otros productos elaborados de metal',
  '4111': 'Construcción de edificios residenciales',
  '4690': 'Comercio al por mayor no especializado',
  '4711': 'Comercio al por menor en establecimientos no especializados',
  '4719': 'Comercio al por menor (otros surtidos)',
  '5611': 'Expendio a la mesa de comidas preparadas',
  '6201': 'Desarrollo de sistemas informáticos',
  '6202': 'Consultoría informática',
  '6311': 'Procesamiento de datos y hosting',
  '6412': 'Bancos comerciales',
  '6512': 'Seguros generales',
  '7010': 'Administración empresarial',
  '7020': 'Consultoría de gestión',
  '7110': 'Arquitectura e ingeniería',
  '7210': 'Investigación y desarrollo',
  '8010': 'Seguridad privada',
  '8230': 'Organización de convenciones y eventos',
  '8621': 'Práctica médica',
  '8622': 'Práctica odontológica',
};

// === MUNICIPIOS PRECONFIGURADOS ===

// Última verificación: Febrero 2026
// Fuentes: Estatutos tributarios municipales
// NOTA: Tarifas representativas. Verificar con estatuto municipal vigente.
export const MUNICIPIOS_ICA: MunicipioICA[] = [
  {
    id: "barranquilla",
    nombre: "Barranquilla",
    departamento: "Atlántico",
    tarifas: {
      actividadPrincipal: { codigo: "4711", descripcion: "Comercio al por menor", tarifa: 10, tipoActividad: "COMERCIAL" },
      actividadesAdicionales: [
        { codigo: "6201", descripcion: "Desarrollo software", tarifa: 6, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Productos metálicos", tarifa: 4.14, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos", tarifa: 5, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 5, base: "ICA" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  },
  {
    id: "bogota",
    nombre: "Bogotá D.C.",
    departamento: "Cundinamarca",
    tarifas: {
      actividadPrincipal: {
        codigo: "4711",
        descripcion: "Comercio al por menor en establecimientos no especializados",
        tarifa: 11.04,
        tipoActividad: "COMERCIAL",
      },
      actividadesAdicionales: [
        { codigo: "6201", descripcion: "Actividades de desarrollo de sistemas informáticos", tarifa: 9.66, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Fabricación de productos metálicos para uso estructural", tarifa: 6.9, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos comerciales", tarifa: 11.04, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 1.5, base: "ICA+AVISOS" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  },
  {
    id: "bucaramanga",
    nombre: "Bucaramanga",
    departamento: "Santander",
    tarifas: {
      actividadPrincipal: { codigo: "4711", descripcion: "Comercio al por menor", tarifa: 10, tipoActividad: "COMERCIAL" },
      actividadesAdicionales: [
        { codigo: "7020", descripcion: "Consultoría", tarifa: 5, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Productos metálicos", tarifa: 3, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos", tarifa: 5, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 3, base: "ICA+AVISOS" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  },
  {
    id: "cali",
    nombre: "Cali",
    departamento: "Valle del Cauca",
    tarifas: {
      actividadPrincipal: {
        codigo: "4711",
        descripcion: "Comercio al por menor en establecimientos no especializados",
        tarifa: 10,
        tipoActividad: "COMERCIAL",
      },
      actividadesAdicionales: [
        { codigo: "6201", descripcion: "Actividades de desarrollo de sistemas informáticos", tarifa: 6, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Fabricación de productos metálicos para uso estructural", tarifa: 4.14, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos comerciales", tarifa: 5, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 3, base: "ICA+AVISOS" },
    sobretasaSeguridad: { aplica: true, porcentaje: 1.5 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  },
  {
    id: "cartagena",
    nombre: "Cartagena",
    departamento: "Bolívar",
    tarifas: {
      actividadPrincipal: { codigo: "4711", descripcion: "Comercio al por menor", tarifa: 10, tipoActividad: "COMERCIAL" },
      actividadesAdicionales: [
        { codigo: "6201", descripcion: "Desarrollo software", tarifa: 7, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Productos metálicos", tarifa: 4.14, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos", tarifa: 5, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 3, base: "ICA" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: true, porcentaje: 40 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  },
  {
    id: "cisneros",
    nombre: "Cisneros",
    departamento: "Antioquia",
    tarifas: {
      actividadPrincipal: {
        codigo: "8230",
        descripcion: "Organización de convenciones y eventos comerciales",
        tarifa: 10,
        tipoActividad: "SERVICIOS",
      },
      actividadesAdicionales: [
        { codigo: "7020", descripcion: "Actividades de consultoría de gestión", tarifa: 10, tipoActividad: "SERVICIOS" },
        { codigo: "4711", descripcion: "Comercio al por menor con surtido de alimentos", tarifa: 10, tipoActividad: "COMERCIAL" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 3, base: "ICA" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: true, porcentaje: 8 },
    redondeoAMil: false,
  },
  {
    id: "medellin",
    nombre: "Medellín",
    departamento: "Antioquia",
    tarifas: {
      actividadPrincipal: {
        codigo: "4711",
        descripcion: "Comercio al por menor en establecimientos no especializados",
        tarifa: 10,
        tipoActividad: "COMERCIAL",
      },
      actividadesAdicionales: [
        { codigo: "6201", descripcion: "Actividades de desarrollo de sistemas informáticos", tarifa: 7, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Fabricación de productos metálicos para uso estructural", tarifa: 4.14, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos comerciales", tarifa: 5, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 4, base: "ICA" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  },
  {
    id: "pereira",
    nombre: "Pereira",
    departamento: "Risaralda",
    tarifas: {
      actividadPrincipal: { codigo: "4711", descripcion: "Comercio al por menor", tarifa: 10, tipoActividad: "COMERCIAL" },
      actividadesAdicionales: [
        { codigo: "7020", descripcion: "Consultoría", tarifa: 6, tipoActividad: "SERVICIOS" },
        { codigo: "2511", descripcion: "Productos metálicos", tarifa: 3.5, tipoActividad: "INDUSTRIAL" },
        { codigo: "6412", descripcion: "Bancos", tarifa: 5, tipoActividad: "FINANCIERA" },
      ],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: true, porcentaje: 5, base: "ICA+AVISOS" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: true, porcentaje: 10 },
    redondeoAMil: false,
  },
];
