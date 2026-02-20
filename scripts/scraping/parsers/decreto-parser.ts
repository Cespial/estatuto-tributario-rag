/**
 * Parser for decretos reglamentarios (DUR 1625/2016 and others).
 * Extracts individual articles and links them to ET articles.
 */

import { stripHtml, extractBetween } from "../utils/html-fetcher";
import { extractArticleRefs } from "../utils/regex-patterns";

export interface DecretoScraped {
  id: string;
  decretoNumero: string;
  decretoYear: number;
  articuloNumero: string;
  texto: string;
  articuloETReglamentado: string[];
  articulosSlugs: string[];
  vigente: boolean;
  modificadoPor?: string[];
  fuenteUrl: string;
  fechaScraping: string;
}

/**
 * Parse a DUR page from SUIN-Juriscol.
 * SUIN pages contain the full decreto text with article markers.
 */
export function parseSuinDecreto(
  html: string,
  url: string,
  decretoNumero: string,
  decretoYear: number
): DecretoScraped[] {
  const text = stripHtml(html);
  const articles: DecretoScraped[] = [];

  // DUR articles have numbering like "Artículo 1.2.1.5.1."
  const articleRegex =
    /Art[ií]culo\s+([\d.]+)\.\s*([\s\S]*?)(?=Art[ií]culo\s+[\d.]+\.|$)/gi;

  let match;
  while ((match = articleRegex.exec(text)) !== null) {
    const artNum = match[1];
    const artText = match[2].trim();

    if (artText.length < 10) continue;

    // Extract ET article references from the article text
    const etRefs = extractArticleRefs(artText);

    // Also look for "reglamentario de" or "En desarrollo de" patterns
    const regMatch = artText.match(
      /(?:reglamentario|desarrollo|aplicación)\s+del?\s+art[ií]culo\s+(\d{1,4}(?:-\d{1,2})?)/gi
    );
    if (regMatch) {
      for (const r of regMatch) {
        const numMatch = r.match(/(\d{1,4}(?:-\d{1,2})?)/);
        if (numMatch && !etRefs.includes(numMatch[1])) {
          etRefs.push(numMatch[1]);
        }
      }
    }

    // Check vigencia
    const isDerogado = /derogad|sin\s+vigencia/i.test(artText.slice(0, 200));

    articles.push({
      id: `dur-${decretoNumero}-art-${artNum}`,
      decretoNumero,
      decretoYear,
      articuloNumero: artNum,
      texto: artText.slice(0, 10000),
      articuloETReglamentado: etRefs.map((s) => `Art. ${s}`),
      articulosSlugs: etRefs,
      vigente: !isDerogado,
      fuenteUrl: url,
      fechaScraping: new Date().toISOString(),
    });
  }

  return articles;
}

/**
 * Parse decreto from Secretaría del Senado HTML.
 * Senado pages have simpler HTML structure.
 */
export function parseSenadoDecreto(
  html: string,
  url: string,
  decretoNumero: string,
  decretoYear: number
): DecretoScraped[] {
  const text = stripHtml(html);
  const articles: DecretoScraped[] = [];

  // Senado format: "ARTÍCULO X." or "Artículo X."
  const articleRegex =
    /ART[IÍ]CULO\s+([\d.]+)[\s.]*°?\.?\s*([\s\S]*?)(?=ART[IÍ]CULO\s+[\d.]+|$)/gi;

  let match;
  while ((match = articleRegex.exec(text)) !== null) {
    const artNum = match[1].replace(/\.$/, "");
    const artText = match[2].trim();

    if (artText.length < 10) continue;

    const etRefs = extractArticleRefs(artText);
    const isDerogado = /derogad/i.test(artText.slice(0, 200));

    articles.push({
      id: `dur-${decretoNumero}-art-${artNum}`,
      decretoNumero,
      decretoYear,
      articuloNumero: artNum,
      texto: artText.slice(0, 10000),
      articuloETReglamentado: etRefs.map((s) => `Art. ${s}`),
      articulosSlugs: etRefs,
      vigente: !isDerogado,
      fuenteUrl: url,
      fechaScraping: new Date().toISOString(),
    });
  }

  return articles;
}
