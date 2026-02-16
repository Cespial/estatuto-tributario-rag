export const LEGAL_SYNONYMS: Record<string, string[]> = {
  "4x1000": ["gmf", "gravamen a los movimientos financieros", "cuatro por mil"],
  gmf: ["4x1000", "gravamen a los movimientos financieros", "cuatro por mil"],
  iva: ["impuesto sobre las ventas", "impuesto a las ventas"],
  "impuesto sobre las ventas": ["iva"],
  retefuente: ["retención en la fuente"],
  "retención en la fuente": ["retefuente"],
  uvt: ["unidad de valor tributario"],
  "unidad de valor tributario": ["uvt"],
  "renta presuntiva": ["renta líquida presuntiva"],
  "renta exenta": ["rentas exentas", "ingresos no constitutivos de renta"],
  contribuyente: ["sujeto pasivo", "responsable"],
  "hecho generador": ["causación", "realización del hecho imponible"],
  "base gravable": ["base imponible"],
  tarifa: ["tasa", "alícuota"],
  deducción: ["deducciones", "costos deducibles"],
  "persona jurídica": ["sociedad", "empresa", "compañía"],
  "persona natural": ["individuo", "contribuyente persona natural"],
  dividendos: ["distribución de utilidades", "participaciones"],
  "ganancia ocasional": ["ganancias ocasionales"],
  "impuesto de timbre": ["timbre nacional"],
  "sanción por extemporaneidad": ["sanción por presentación extemporánea"],
  "sanción por no declarar": ["sanción por omisión en la declaración"],
};

export const LIBRO_DETECTION_KEYWORDS: Record<string, string> = {
  renta: "I - Impuesto sobre la Renta y Complementarios",
  patrimonio: "I - Impuesto sobre la Renta y Complementarios",
  "ganancia ocasional": "I - Impuesto sobre la Renta y Complementarios",
  "ganancias ocasionales": "I - Impuesto sobre la Renta y Complementarios",
  retención: "II - Retención en la Fuente",
  retefuente: "II - Retención en la Fuente",
  iva: "III - Impuesto sobre las Ventas",
  "impuesto a las ventas": "III - Impuesto sobre las Ventas",
  "impuesto sobre las ventas": "III - Impuesto sobre las Ventas",
  timbre: "IV - Impuesto de Timbre Nacional",
  sanción: "V - Procedimiento Tributario",
  procedimiento: "V - Procedimiento Tributario",
  declaración: "V - Procedimiento Tributario",
  devolución: "V - Procedimiento Tributario",
  gmf: "VI - Gravamen a los Movimientos Financieros",
  "4x1000": "VI - Gravamen a los Movimientos Financieros",
  "cuatro por mil": "VI - Gravamen a los Movimientos Financieros",
};

export function expandQuery(query: string): string {
  const lower = query.toLowerCase();
  const expansions: string[] = [];

  for (const [term, synonyms] of Object.entries(LEGAL_SYNONYMS)) {
    if (lower.includes(term)) {
      for (const syn of synonyms) {
        if (!lower.includes(syn)) {
          expansions.push(syn);
        }
      }
    }
  }

  if (expansions.length === 0) return query;
  return `${query} (${expansions.slice(0, 3).join(", ")})`;
}

export function detectLibro(query: string): string | undefined {
  const lower = query.toLowerCase();
  for (const [keyword, libro] of Object.entries(LIBRO_DETECTION_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return libro;
    }
  }
  return undefined;
}
