/**
 * Parser for DIAN doctrina HTML pages (Normograma format).
 * Extracts structured fields from concept/oficio/circular pages.
 *
 * The normograma pages have:
 * - Title in `<h1 class="titulo-documento">` and `<title>` tag
 * - Fecha in `<p class="centrado">` (e.g., "(enero 26)")
 * - Structured metadata table: Área del Derecho, Descriptores, Fuentes Formales
 * - Full text body with links to ET articles: `<A href="estatuto_tributario.htm#828">`
 * - Encoding: ISO-8859-1
 */

import { stripHtml, extractBetween } from "../utils/html-fetcher";
import { extractArticleRefs } from "../utils/regex-patterns";

export interface DoctrinaScraped {
  id: string;
  tipo: "concepto" | "oficio" | "circular" | "doctrina-general";
  numero: string;
  fecha: string;
  tema: string;
  descriptor: string[];
  pregunta?: string;
  sintesis: string;
  conclusionClave?: string;
  articulosET: string[];
  articulosSlugs: string[];
  vigente: boolean;
  revocadoPor?: string;
  fuenteUrl: string;
  fuenteSitio: "dian" | "cijuf";
  fechaScraping: string;
}

/**
 * Extract article references from HTML links like <A href="estatuto_tributario.htm#828">
 */
function extractETLinksFromHtml(html: string): string[] {
  const slugs = new Set<string>();

  // Pattern 1: Direct links to ET articles in normograma
  const linkRegex = /href="estatuto_tributario\.htm#(\d+[a-zA-Z_-]*)"/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    slugs.add(match[1]);
  }

  // Pattern 2: Also extract from plain text references
  const textSlugs = extractArticleRefs(stripHtml(html));
  for (const slug of textSlugs) {
    slugs.add(slug);
  }

  return Array.from(slugs);
}

/**
 * Extract metadata from the normograma table format.
 * The table has rows like: <td>Descriptores</td><td>value1<br/>value2</td>
 */
function extractTableMetadata(html: string): Record<string, string> {
  const meta: Record<string, string> = {};

  // Match table rows with label and value cells
  const rowRegex =
    /<tr[^>]*>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/gis;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const label = stripHtml(match[1]).trim().toLowerCase();
    const value = stripHtml(match[2]).trim();
    if (label && value) {
      meta[label] = value;
    }
  }

  return meta;
}

/**
 * Parse DIAN Normograma HTML into structured doctrina.
 */
export function parseDianDoctrina(
  html: string,
  url: string
): Partial<DoctrinaScraped> | null {
  // Extract title from <h1 class="titulo-documento"> or <title>
  const titleMatch =
    html.match(/<h1[^>]*class="titulo-documento"[^>]*>\s*(.*?)\s*<\/h1>/is) ||
    html.match(/<title>[^-]*-\s*(.*?)\s*<\/title>/is);
  const title = titleMatch ? stripHtml(titleMatch[1]).trim() : "";

  // Extract numero from URL filename pattern or title
  // URL patterns: oficio_dian_NNNN_YYYY.htm, concepto_tributario_dian_NNNNNNN_YYYY.htm
  let numero = "";
  let yearFromUrl = 0;

  const urlFileMatch = url.match(
    /(?:oficio_dian|concepto_(?:tributario_)?dian|circular_dian)_(\d+)_(\d{4})\.htm/i
  );
  if (urlFileMatch) {
    numero = urlFileMatch[1];
    yearFromUrl = parseInt(urlFileMatch[2], 10);
  }

  if (!numero) {
    // Try from title: "Concepto 1159 de 2026 DIAN" or "Oficio 18075 de 2023"
    const titleNumMatch = title.match(
      /(?:Concepto|Oficio|Circular)\s+(?:No\.?\s*)?(\d{3,7})\s+(?:(?:int\s+\d+\s+)?de\s+)?(\d{4})/i
    );
    if (titleNumMatch) {
      numero = titleNumMatch[1];
      yearFromUrl = parseInt(titleNumMatch[2], 10);
    }
  }

  if (!numero) {
    // Last resort: first multi-digit number in URL
    const fallbackMatch = url.match(/(\d{4,7})/);
    if (fallbackMatch) {
      numero = fallbackMatch[1];
    }
  }

  if (!numero) return null;

  // Detect tipo from URL and title
  let tipo: DoctrinaScraped["tipo"] = "concepto";
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  if (urlLower.includes("oficio") || titleLower.startsWith("oficio")) {
    tipo = "oficio";
  } else if (urlLower.includes("circular") || titleLower.startsWith("circular")) {
    tipo = "circular";
  } else if (titleLower.includes("doctrina general")) {
    tipo = "doctrina-general";
  }

  // Extract structured metadata from the table
  const tableMeta = extractTableMetadata(html);

  // Extract fecha from the centrado paragraph: "(enero 26)" or "(15 de marzo de 2024)"
  const centradoMatch = html.match(
    /<p[^>]*class="centrado"[^>]*>\s*\(([^)]+)\)\s*<\/p>/i
  );
  let fecha = "";
  if (centradoMatch) {
    const dateStr = centradoMatch[1].trim();
    // Try full date: "15 de marzo de 2024"
    const fullDateMatch = dateStr.match(
      /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})/i
    );
    if (fullDateMatch) {
      const months: Record<string, string> = {
        enero: "01", febrero: "02", marzo: "03", abril: "04",
        mayo: "05", junio: "06", julio: "07", agosto: "08",
        septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
      };
      fecha = `${fullDateMatch[3]}-${months[fullDateMatch[2].toLowerCase()] || "01"}-${fullDateMatch[1].padStart(2, "0")}`;
    } else {
      // Short date: "enero 26" → need the year from URL
      const shortDateMatch = dateStr.match(
        /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{1,2})/i
      );
      if (shortDateMatch && yearFromUrl) {
        const months: Record<string, string> = {
          enero: "01", febrero: "02", marzo: "03", abril: "04",
          mayo: "05", junio: "06", julio: "07", agosto: "08",
          septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
        };
        fecha = `${yearFromUrl}-${months[shortDateMatch[1].toLowerCase()] || "01"}-${shortDateMatch[2].padStart(2, "0")}`;
      }
    }
  }

  if (!fecha && yearFromUrl) {
    fecha = `${yearFromUrl}-01-01`;
  }

  // Extract tema from table metadata or <meta name="description">
  let tema = tableMeta["banco de datos"] || tableMeta["área del derecho"] || "";
  if (!tema) {
    const metaDescMatch = html.match(
      /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i
    );
    if (metaDescMatch) {
      // Extract the parenthetical part: "Concepto 1159 de 2026 DIAN - (Tributario) (Int 117) Description"
      const descMatch = stripHtml(metaDescMatch[1]).match(/\)\s*(.+?)(?:\s*-\s*Compilaci|$)/);
      tema = descMatch ? descMatch[1].trim() : "";
    }
  }

  // Extract descriptores from table
  const descriptorRaw = tableMeta["descriptores"] || tableMeta["descriptor"] || "";
  const descriptor = descriptorRaw
    ? descriptorRaw
        .split(/\n|<br\s*\/?>/gi)
        .map((d) => d.trim())
        .filter((d) => d.length > 2)
    : [];

  // Extract the document body (content after the panel-documento div)
  const bodyMatch = html.match(
    /<div[^>]*class="panel-documento"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>\s*<footer|<footer)/i
  );
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;

  // Extract ET article links from the HTML (both link hrefs and text patterns)
  const articulosSlugs = extractETLinksFromHtml(bodyHtml);

  // Strip HTML for text extraction
  const bodyText = stripHtml(bodyHtml);

  // Extract preguntas if present (DIAN Q&A format)
  const preguntaMatch = bodyText.match(
    /(?:pregunta|consulta)[:\s]*(.*?)(?:respuesta|concepto|consideraciones)/is
  );
  const pregunta = preguntaMatch ? preguntaMatch[1].trim().slice(0, 2000) : undefined;

  // Sintesis: main body text (skip the first ~200 chars of boilerplate)
  const sintesis = bodyText.slice(0, 8000).trim();

  // Extract conclusion
  const conclusionMatch = bodyText.match(
    /(?:En\s+(?:los\s+)?anteriores\s+t[eé]rminos|Conclusi[oó]n|En\s+resumen|En\s+m[eé]rito\s+de\s+lo\s+expuesto)[:\s]*([\s\S]*?)(?:Atentamente|Cordialmente|$)/i
  );
  const conclusionClave = conclusionMatch
    ? conclusionMatch[1].trim().slice(0, 2000)
    : undefined;

  // Detect vigencia
  const revocado =
    /revocad[oa]|sin\s+vigencia|no\s+vigente|derogad[oa]/i.test(bodyText.slice(0, 1000));

  return {
    tipo,
    numero,
    fecha,
    tema,
    descriptor,
    pregunta,
    sintesis,
    conclusionClave,
    articulosET: articulosSlugs.map((slug) => `Art. ${slug}`),
    articulosSlugs,
    vigente: !revocado,
    fuenteUrl: url,
    fuenteSitio: "dian",
    fechaScraping: new Date().toISOString(),
  };
}

/**
 * Parse CIJUF HTML into structured doctrina.
 */
export function parseCijufDoctrina(
  html: string,
  url: string
): Partial<DoctrinaScraped> | null {
  const text = stripHtml(html);

  // CIJUF typically has "Concepto No. XXXX" in the title/header
  const numeroMatch = text.match(
    /(?:Concepto|Oficio)\s+(?:No\.?\s*)?(\d{3,6})/i
  );
  if (!numeroMatch) return null;

  const numero = numeroMatch[1];

  let tipo: DoctrinaScraped["tipo"] = "concepto";
  if (/oficio/i.test(text.slice(0, 300))) tipo = "oficio";

  // Extract fecha
  const fechaMatch = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  let fecha = "";
  if (fechaMatch) {
    const months: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04",
      mayo: "05", junio: "06", julio: "07", agosto: "08",
      septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    const day = fechaMatch[1].padStart(2, "0");
    const month = months[fechaMatch[2].toLowerCase()] || "01";
    const year = fechaMatch[3];
    fecha = `${year}-${month}-${day}`;
  }

  const temaMatch = text.match(/Tema[:\s]+([^\n]+)/i);
  const tema = temaMatch ? temaMatch[1].trim() : "";

  const bodyText = text.slice(Math.min(text.length, 300));
  const sintesis = bodyText.slice(0, 5000).trim();

  const allArticleRefs = extractArticleRefs(text);

  return {
    tipo,
    numero,
    fecha,
    tema,
    descriptor: [],
    sintesis,
    articulosET: allArticleRefs.map((slug) => `Art. ${slug}`),
    articulosSlugs: allArticleRefs,
    vigente: true,
    fuenteUrl: url,
    fuenteSitio: "cijuf",
    fechaScraping: new Date().toISOString(),
  };
}
