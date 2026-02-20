/**
 * Parser for sentencias from Corte Constitucional and Consejo de Estado.
 * Extracts structured fields: ratio decidendi, decision, magistrado, etc.
 */

import { stripHtml, extractBetween } from "../utils/html-fetcher";
import { extractArticleRefs } from "../utils/regex-patterns";

export interface SentenciaScraped {
  id: string;
  corte: "constitucional" | "consejo-estado";
  tipo: "C" | "SU" | "T" | "sentencia";
  numero: string;
  year: number;
  fecha: string;
  magistrado?: string;
  tema: string;
  ratioDecidendi?: string;
  decision?: string;
  articulosET: string[];
  articulosSlugs: string[];
  normasDemandadas?: string[];
  resumen: string;
  textoCompleto?: string;
  fuenteUrl: string;
  fechaScraping: string;
}

/**
 * Parse Corte Constitucional HTML.
 * CC pages follow a predictable structure with sections.
 */
export function parseCorteConstitucional(
  html: string,
  url: string,
  tipo: "C" | "SU" | "T",
  numero: string,
  year: number
): SentenciaScraped | null {
  const text = stripHtml(html);
  if (text.length < 100) return null;

  // Extract magistrado ponente
  const magistradoMatch = text.match(
    /[Mm]agistrad[oa]\s+[Pp]onente[:\s]+([^\n]+)/
  );
  const magistrado = magistradoMatch ? magistradoMatch[1].trim() : undefined;

  // Extract tema/materia
  const temaMatch =
    text.match(/[Tt]ema[:\s]+([^\n]+)/) ||
    text.match(/[Mm]ateria[:\s]+([^\n]+)/);
  const tema = temaMatch ? temaMatch[1].trim() : "Tributario";

  // Extract fecha
  const fechaMatch = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  let fecha = `${year}-01-01`;
  if (fechaMatch) {
    const months: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04",
      mayo: "05", junio: "06", julio: "07", agosto: "08",
      septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    fecha = `${fechaMatch[3]}-${months[fechaMatch[2].toLowerCase()] || "01"}-${fechaMatch[1].padStart(2, "0")}`;
  }

  // Extract ratio decidendi (the core legal reasoning)
  const ratioSection =
    extractBetween(text, /CONSIDERACIONES/i, /RESUELVE/i) ||
    extractBetween(text, /FUNDAMENTOS/i, /RESUELVE/i) ||
    extractBetween(text, /RATIO DECIDENDI/i, /(?:RESUELVE|DECISION|DECISIÓN)/i);
  const ratioDecidendi = ratioSection
    ? ratioSection.trim().slice(0, 5000)
    : undefined;

  // Extract decision
  const decisionSection = extractBetween(
    text,
    /RESUELVE/i,
    /(?:Cópiese|Notifíquese|Comuníquese)/i
  );
  let decision: string | undefined;
  if (decisionSection) {
    if (/[Ee]xequible/i.test(decisionSection)) {
      if (/[Cc]ondicionad/i.test(decisionSection)) {
        decision = "exequible condicionada";
      } else {
        decision = "exequible";
      }
    } else if (/[Ii]nexequible/i.test(decisionSection)) {
      decision = "inexequible";
    } else if (/[Ii]nhibi/i.test(decisionSection)) {
      decision = "inhibitoria";
    }
  }

  // Extract normas demandadas
  const normasMatch = text.match(
    /[Nn]orma[s]?\s+(?:demandada|acusada|revisada)[s]?[:\s]+([^\n]+)/
  );
  const normasDemandadas = normasMatch
    ? normasMatch[1]
        .split(/[,;y]/)
        .map((n) => n.trim())
        .filter(Boolean)
    : undefined;

  // Extract article references
  const articulosSlugs = extractArticleRefs(text);

  // Build resumen (first ~2000 chars after header)
  const resumen = text.slice(0, 3000).trim();

  return {
    id: `cc-${tipo.toLowerCase()}-${numero}-${year}`,
    corte: "constitucional",
    tipo,
    numero,
    year,
    fecha,
    magistrado,
    tema,
    ratioDecidendi,
    decision,
    articulosET: articulosSlugs.map((s) => `Art. ${s}`),
    articulosSlugs,
    normasDemandadas,
    resumen,
    textoCompleto: text.length > 3000 ? text : undefined,
    fuenteUrl: url,
    fechaScraping: new Date().toISOString(),
  };
}

/**
 * Parse Consejo de Estado sentencia (Sección Cuarta - tributaria).
 */
export function parseConsejoEstado(
  html: string,
  url: string,
  numero: string,
  year: number
): SentenciaScraped | null {
  const text = stripHtml(html);
  if (text.length < 100) return null;

  // CE sentencias have different structure
  const magistradoMatch = text.match(
    /[Cc]onsejero\s+[Pp]onente[:\s]+([^\n]+)/
  );
  const magistrado = magistradoMatch ? magistradoMatch[1].trim() : undefined;

  const temaMatch = text.match(/[Tt]ema[:\s]+([^\n]+)/);
  const tema = temaMatch ? temaMatch[1].trim() : "Tributario";

  const fechaMatch = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  let fecha = `${year}-01-01`;
  if (fechaMatch) {
    const months: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04",
      mayo: "05", junio: "06", julio: "07", agosto: "08",
      septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    fecha = `${fechaMatch[3]}-${months[fechaMatch[2].toLowerCase()] || "01"}-${fechaMatch[1].padStart(2, "0")}`;
  }

  const ratioSection = extractBetween(
    text,
    /CONSIDERACIONES/i,
    /(?:FALLA|RESUELVE|DECIDE)/i
  );
  const ratioDecidendi = ratioSection
    ? ratioSection.trim().slice(0, 5000)
    : undefined;

  const articulosSlugs = extractArticleRefs(text);
  const resumen = text.slice(0, 3000).trim();

  return {
    id: `ce-s4-${numero}-${year}`,
    corte: "consejo-estado",
    tipo: "sentencia",
    numero,
    year,
    fecha,
    magistrado,
    tema,
    ratioDecidendi,
    articulosET: articulosSlugs.map((s) => `Art. ${s}`),
    articulosSlugs,
    resumen,
    textoCompleto: text.length > 3000 ? text : undefined,
    fuenteUrl: url,
    fechaScraping: new Date().toISOString(),
  };
}
