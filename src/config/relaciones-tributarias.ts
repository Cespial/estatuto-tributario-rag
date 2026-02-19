export type TipoObligacionFiscal =
  | "renta"
  | "iva"
  | "retencion"
  | "ica"
  | "simple"
  | "patrimonio"
  | "informativa";

export interface ObligacionRelacion {
  tipoObligacion: TipoObligacionFiscal;
  etiqueta: string;
  badgeClassName: string;
  puntoClassName: string;
  calculadoraHref: string;
  relatedIndicatorIds: string[];
  relatedNovedadIds: string[];
}

const RELACIONES_EXPLICITAS: Record<string, Omit<ObligacionRelacion, "etiqueta" | "badgeClassName" | "puntoClassName">> = {
  "Declaracion de Renta Personas Naturales": {
    tipoObligacion: "renta",
    calculadoraHref: "/calculadoras/renta",
    relatedIndicatorIds: ["uvt", "smlmv", "ipc"],
    relatedNovedadIds: ["nov-001", "nov-002", "nov-004"],
  },
  "Declaracion de Renta Personas Juridicas": {
    tipoObligacion: "renta",
    calculadoraHref: "/calculadoras/renta-juridicas",
    relatedIndicatorIds: ["uvt", "trm", "usura"],
    relatedNovedadIds: ["nov-001", "nov-004", "nov-021"],
  },
  "Retencion en la Fuente (mensual)": {
    tipoObligacion: "retencion",
    calculadoraHref: "/calculadoras/retencion",
    relatedIndicatorIds: ["uvt", "smlmv"],
    relatedNovedadIds: ["nov-001", "nov-025"],
  },
  "IVA Bimestral": {
    tipoObligacion: "iva",
    calculadoraHref: "/calculadoras/iva",
    relatedIndicatorIds: ["uvt", "trm"],
    relatedNovedadIds: ["nov-001", "nov-005"],
  },
  "IVA Cuatrimestral": {
    tipoObligacion: "iva",
    calculadoraHref: "/calculadoras/iva",
    relatedIndicatorIds: ["uvt", "trm"],
    relatedNovedadIds: ["nov-001", "nov-005"],
  },
  "SIMPLE Anticipo Bimestral": {
    tipoObligacion: "simple",
    calculadoraHref: "/calculadoras/simple",
    relatedIndicatorIds: ["uvt", "smlmv"],
    relatedNovedadIds: ["nov-004", "nov-012"],
  },
  "SIMPLE Declaracion Anual": {
    tipoObligacion: "simple",
    calculadoraHref: "/calculadoras/simple",
    relatedIndicatorIds: ["uvt", "smlmv"],
    relatedNovedadIds: ["nov-004", "nov-012"],
  },
  "ICA Bogota Bimestral": {
    tipoObligacion: "ica",
    calculadoraHref: "/calculadoras/ica",
    relatedIndicatorIds: ["uvt", "ipc"],
    relatedNovedadIds: ["nov-028"],
  },
  "Impuesto al Patrimonio": {
    tipoObligacion: "patrimonio",
    calculadoraHref: "/calculadoras/patrimonio",
    relatedIndicatorIds: ["uvt", "trm"],
    relatedNovedadIds: ["nov-007", "nov-027"],
  },
  "Activos en el Exterior": {
    tipoObligacion: "informativa",
    calculadoraHref: "/calculadoras/renta",
    relatedIndicatorIds: ["trm", "uvt"],
    relatedNovedadIds: ["nov-001"],
  },
  "Grandes Contribuyentes Renta - Primera Cuota": {
    tipoObligacion: "renta",
    calculadoraHref: "/calculadoras/renta-juridicas",
    relatedIndicatorIds: ["uvt", "trm", "usura"],
    relatedNovedadIds: ["nov-001", "nov-004"],
  },
  "Grandes Contribuyentes Renta - Segunda Cuota": {
    tipoObligacion: "renta",
    calculadoraHref: "/calculadoras/renta-juridicas",
    relatedIndicatorIds: ["uvt", "trm", "usura"],
    relatedNovedadIds: ["nov-001", "nov-004"],
  },
  "GMF Declaracion Informativa": {
    tipoObligacion: "informativa",
    calculadoraHref: "/calculadoras/gmf",
    relatedIndicatorIds: ["uvt", "trm"],
    relatedNovedadIds: ["nov-001"],
  },
};

const CONFIG_POR_TIPO: Record<
  TipoObligacionFiscal,
  Pick<ObligacionRelacion, "etiqueta" | "badgeClassName" | "puntoClassName">
> = {
  renta: {
    etiqueta: "Renta",
    badgeClassName:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-200",
    puntoClassName: "bg-red-500",
  },
  iva: {
    etiqueta: "IVA",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200",
    puntoClassName: "bg-amber-500",
  },
  retencion: {
    etiqueta: "Retención",
    badgeClassName:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/50 dark:bg-orange-900/30 dark:text-orange-200",
    puntoClassName: "bg-orange-500",
  },
  ica: {
    etiqueta: "ICA",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/50 dark:bg-sky-900/30 dark:text-sky-200",
    puntoClassName: "bg-sky-500",
  },
  simple: {
    etiqueta: "SIMPLE",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200",
    puntoClassName: "bg-emerald-500",
  },
  patrimonio: {
    etiqueta: "Patrimonio",
    badgeClassName:
      "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800/50 dark:bg-fuchsia-900/30 dark:text-fuchsia-200",
    puntoClassName: "bg-fuchsia-500",
  },
  informativa: {
    etiqueta: "Informativa",
    badgeClassName:
      "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200",
    puntoClassName: "bg-zinc-500",
  },
};

function inferirTipoPorNombre(obligacion: string): TipoObligacionFiscal {
  const lower = obligacion.toLowerCase();
  if (lower.includes("iva")) return "iva";
  if (lower.includes("retencion")) return "retencion";
  if (lower.includes("ica")) return "ica";
  if (lower.includes("simple")) return "simple";
  if (lower.includes("patrimonio")) return "patrimonio";
  if (lower.includes("renta")) return "renta";
  return "informativa";
}

export function getRelacionObligacion(obligacion: string): ObligacionRelacion {
  const explicita = RELACIONES_EXPLICITAS[obligacion];
  const tipo = explicita?.tipoObligacion ?? inferirTipoPorNombre(obligacion);
  const visual = CONFIG_POR_TIPO[tipo];

  return {
    tipoObligacion: tipo,
    etiqueta: visual.etiqueta,
    badgeClassName: visual.badgeClassName,
    puntoClassName: visual.puntoClassName,
    calculadoraHref: explicita?.calculadoraHref ?? "/calculadoras",
    relatedIndicatorIds: explicita?.relatedIndicatorIds ?? ["uvt"],
    relatedNovedadIds: explicita?.relatedNovedadIds ?? ["nov-001"],
  };
}

