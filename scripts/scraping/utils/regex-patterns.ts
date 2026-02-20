// Shared regex patterns for extracting legal references from Colombian legal text

export const PATTERNS = {
  /** Matches: "Ley 2277 de 2022", "ley 1819 de 2016" */
  leyes: /Ley\s+(\d{1,5})\s+de\s+(\d{4})/gi,

  /** Matches: "Decreto 1625 de 2016", "decreto 624 de 1989" */
  decretos: /Decreto\s+(\d{1,5})\s+de\s+(\d{4})/gi,

  /** Matches: "C-032/2019", "SU-037/2019", "T-123-2020", "C-032 de 2019" */
  sentencias: /(C|SU|T)-(\d{1,4})[/-](\d{2,4})/gi,

  /** Matches: "Concepto 012345 de 2024", "Concepto DIAN No. 12345 de 2024" */
  conceptos:
    /Concepto\s+(?:DIAN\s+)?(?:No\.?\s*)?(\d{3,6})\s+de\s+(\d{4})/gi,

  /** Matches: "Resolución 000042 de 2023", "Resolución DIAN No. 042 de 2023" */
  resoluciones:
    /Resoluci[oó]n\s+(?:DIAN\s+)?(?:No\.?\s*)?(\d{3,6})\s+de\s+(\d{4})/gi,

  /** Matches: "Oficio No. 012345 de 2024", "Oficio 901234 de 2023" */
  oficios: /Oficio\s+(?:No\.?\s*)?(\d{3,6})\s+de\s+(\d{4})/gi,

  /** Matches: "artículo 240", "Art. 240-1", "articulo 260-1" */
  articulosET:
    /[Aa]rt(?:[ií]culo)?\.?\s*(\d{1,4}(?:-\d{1,2})?)/g,

  /** Matches: "Sentencia C-032 de 2019" (alternate long form) */
  sentenciasLong:
    /[Ss]entencia\s+(C|SU|T)-(\d{1,4})\s+de\s+(\d{4})/g,
} as const;

export interface ExtractedLaw {
  tipo: "Ley";
  numero: string;
  year: number;
  key: string;
}

export interface ExtractedDecree {
  tipo: "Decreto";
  numero: string;
  year: number;
  key: string;
}

export interface ExtractedSentence {
  tipo: string; // "C" | "SU" | "T"
  numero: string;
  year: number;
  key: string;
}

export interface ExtractedConcept {
  tipo: "Concepto";
  numero: string;
  year: number;
  key: string;
}

export interface ExtractedResolution {
  tipo: "Resolución";
  numero: string;
  year: number;
  key: string;
}

export interface ExtractedOficio {
  tipo: "Oficio";
  numero: string;
  year: number;
  key: string;
}

function normalizeYear(y: string): number {
  const num = parseInt(y, 10);
  // Handle 2-digit years
  if (num < 100) {
    return num > 50 ? 1900 + num : 2000 + num;
  }
  return num;
}

export function extractLaws(text: string): ExtractedLaw[] {
  const results = new Map<string, ExtractedLaw>();
  const regex = new RegExp(PATTERNS.leyes.source, PATTERNS.leyes.flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    const numero = match[1];
    const year = parseInt(match[2], 10);
    const key = `Ley-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo: "Ley", numero, year, key });
    }
  }
  return Array.from(results.values());
}

export function extractDecrees(text: string): ExtractedDecree[] {
  const results = new Map<string, ExtractedDecree>();
  const regex = new RegExp(PATTERNS.decretos.source, PATTERNS.decretos.flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    const numero = match[1];
    const year = parseInt(match[2], 10);
    const key = `Decreto-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo: "Decreto", numero, year, key });
    }
  }
  return Array.from(results.values());
}

export function extractSentences(text: string): ExtractedSentence[] {
  const results = new Map<string, ExtractedSentence>();

  // Short form: C-032/2019
  const regex1 = new RegExp(PATTERNS.sentencias.source, PATTERNS.sentencias.flags);
  let match;
  while ((match = regex1.exec(text)) !== null) {
    const tipo = match[1].toUpperCase();
    const numero = match[2];
    const year = normalizeYear(match[3]);
    const key = `${tipo}-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo, numero, year, key });
    }
  }

  // Long form: Sentencia C-032 de 2019
  const regex2 = new RegExp(
    PATTERNS.sentenciasLong.source,
    PATTERNS.sentenciasLong.flags
  );
  while ((match = regex2.exec(text)) !== null) {
    const tipo = match[1].toUpperCase();
    const numero = match[2];
    const year = parseInt(match[3], 10);
    const key = `${tipo}-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo, numero, year, key });
    }
  }

  return Array.from(results.values());
}

export function extractConcepts(text: string): ExtractedConcept[] {
  const results = new Map<string, ExtractedConcept>();
  const regex = new RegExp(PATTERNS.conceptos.source, PATTERNS.conceptos.flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    const numero = match[1];
    const year = parseInt(match[2], 10);
    const key = `Concepto-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo: "Concepto", numero, year, key });
    }
  }
  return Array.from(results.values());
}

export function extractResolutions(text: string): ExtractedResolution[] {
  const results = new Map<string, ExtractedResolution>();
  const regex = new RegExp(
    PATTERNS.resoluciones.source,
    PATTERNS.resoluciones.flags
  );
  let match;
  while ((match = regex.exec(text)) !== null) {
    const numero = match[1];
    const year = parseInt(match[2], 10);
    const key = `Resolucion-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo: "Resolución", numero, year, key });
    }
  }
  return Array.from(results.values());
}

export function extractOficios(text: string): ExtractedOficio[] {
  const results = new Map<string, ExtractedOficio>();
  const regex = new RegExp(PATTERNS.oficios.source, PATTERNS.oficios.flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    const numero = match[1];
    const year = parseInt(match[2], 10);
    const key = `Oficio-${numero}-${year}`;
    if (!results.has(key)) {
      results.set(key, { tipo: "Oficio", numero, year, key });
    }
  }
  return Array.from(results.values());
}

export function extractArticleRefs(text: string): string[] {
  const results = new Set<string>();
  const regex = new RegExp(
    PATTERNS.articulosET.source,
    PATTERNS.articulosET.flags
  );
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.add(match[1]);
  }
  return Array.from(results);
}
