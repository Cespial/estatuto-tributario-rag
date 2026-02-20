/**
 * Phase 4 — DIAN Resoluciones Scraper
 *
 * Scrapes resoluciones from DIAN Normograma.
 * Sources: t_1_normativa_tributaria_parte_06.html (Resolución Única)
 *          t_1_normativa_tributaria_parte_07.html (Resoluciones DIAN)
 *
 * Usage: npx tsx scripts/scraping/scrapers/dian-resoluciones.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml, stripHtml } from "../utils/html-fetcher";
import { createGovScraper, RateLimiter } from "../utils/rate-limiter";
import { resolucionId, loadExistingIds } from "../utils/dedup";
import { extractArticleRefs } from "../utils/regex-patterns";

const OUTPUT_DIR = path.resolve("data/scraped/resoluciones");
const BATCH_SIZE = 50;

const BASE_URL = "https://normograma.dian.gov.co/dian/compilacion/";

// Parts 6 and 7 of normativa tributaria contain resoluciones
const RESOLUTION_PARTS = ["06", "07"];

export interface ResolucionScraped {
  id: string;
  numero: string;
  year: number;
  fecha: string;
  tema: string;
  texto: string;
  articulosET: string[];
  articulosSlugs: string[];
  vigente: boolean;
  fuenteUrl: string;
  fechaScraping: string;
}

/**
 * Discover resolution URLs from normograma sub-pages.
 */
async function discoverResolucionUrls(
  limiter: RateLimiter
): Promise<string[]> {
  const urls = new Set<string>();

  for (const partNum of RESOLUTION_PARTS) {
    const partUrl = `${BASE_URL}t_1_normativa_tributaria_parte_${partNum}.html`;
    console.log(`[dian-resoluciones] Fetching part ${partNum}...`);

    try {
      const { html } = await limiter.execute(() =>
        fetchHtml(partUrl, { timeout: 30000, encoding: "iso-8859-1" })
      );

      const linkRegex = /href="(docs\/[^"]+\.htm[l]?)"/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const docPath = match[1];
        const fullUrl = `${BASE_URL}${docPath}`;
        urls.add(fullUrl);
      }

      console.log(
        `[dian-resoluciones] Part ${partNum}: found ${urls.size} unique URLs so far`
      );
    } catch (error) {
      console.error(
        `[dian-resoluciones] Failed part ${partNum}:`,
        (error as Error).message
      );
    }
  }

  console.log(
    `[dian-resoluciones] Discovery complete: ${urls.size} resolution URLs`
  );
  return Array.from(urls);
}

function parseResolucion(
  html: string,
  url: string
): ResolucionScraped | null {
  // Extract title
  const titleMatch =
    html.match(/<h1[^>]*class="titulo-documento"[^>]*>\s*(.*?)\s*<\/h1>/is) ||
    html.match(/<title>[^-]*-\s*(.*?)\s*<\/title>/is);
  const title = titleMatch ? stripHtml(titleMatch[1]).trim() : "";

  const text = stripHtml(html);
  if (text.length < 50) return null;

  // Extract numero from URL or title
  let numero = "";
  let year = 0;

  // URL pattern: resolucion_dian_NNNN_YYYY.htm or resolucion_unica_dian_NNNN_YYYY.htm
  const urlMatch = url.match(/resolucion[^/]*_(\d+)_(\d{4})\.htm/i);
  if (urlMatch) {
    numero = urlMatch[1];
    year = parseInt(urlMatch[2], 10);
  }

  if (!numero) {
    // From title: "Resolución 000042 de 2023"
    const titleMatch2 = title.match(
      /[Rr]esoluci[oó]n\s+(?:[Úú]nica\s+)?(?:No\.?\s*)?0*(\d{1,6})\s+(?:de\s+)?(\d{4})/
    );
    if (titleMatch2) {
      numero = titleMatch2[1];
      year = parseInt(titleMatch2[2], 10);
    }
  }

  if (!numero) {
    const textMatch = text.match(
      /[Rr]esoluci[oó]n\s+(?:No\.?\s*)?0*(\d{3,6})/
    );
    if (textMatch) numero = textMatch[1];
  }

  if (!numero) return null;

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
    year = year || parseInt(fechaMatch[3], 10);
    fecha = `${fechaMatch[3]}-${months[fechaMatch[2].toLowerCase()] || "01"}-${fechaMatch[1].padStart(2, "0")}`;
  }

  if (!year) year = new Date().getFullYear();
  if (!fecha) fecha = `${year}-01-01`;

  // Extract tema
  const temaMatch = text.match(
    /[Pp]or\s+(?:la\s+cual|medio\s+de\s+la\s+cual|el\s+cual)\s+([^.]+)/
  );
  const tema = temaMatch ? temaMatch[1].trim().slice(0, 500) : title;

  // Extract ET article references from HTML
  const articulosSlugs: string[] = [];
  const etLinkRegex = /href="estatuto_tributario\.htm#(\d+[a-zA-Z_-]*)"/gi;
  let linkMatch;
  while ((linkMatch = etLinkRegex.exec(html)) !== null) {
    if (!articulosSlugs.includes(linkMatch[1])) {
      articulosSlugs.push(linkMatch[1]);
    }
  }
  // Also from text patterns
  for (const slug of extractArticleRefs(text)) {
    if (!articulosSlugs.includes(slug)) {
      articulosSlugs.push(slug);
    }
  }

  const isDerogada =
    /derogad|sin\s+vigencia|no\s+vigente/i.test(text.slice(0, 1000));

  return {
    id: resolucionId(numero, year),
    numero,
    year,
    fecha,
    tema,
    texto: text.slice(0, 20000),
    articulosET: articulosSlugs.map((s) => `Art. ${s}`),
    articulosSlugs,
    vigente: !isDerogada,
    fuenteUrl: url,
    fechaScraping: new Date().toISOString(),
  };
}

function saveBatch(items: ResolucionScraped[], batchNum: number): void {
  if (items.length === 0) return;
  const filePath = path.join(
    OUTPUT_DIR,
    `resolucion-batch-${batchNum.toString().padStart(4, "0")}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(
    `[dian-resoluciones] Saved batch ${batchNum}: ${items.length} items`
  );
}

async function main() {
  console.log("[dian-resoluciones] Starting DIAN Resoluciones scraper...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingIds = loadExistingIds(OUTPUT_DIR);
  console.log(`[dian-resoluciones] ${existingIds.size} already scraped`);

  const limiter = createGovScraper();
  const urls = await discoverResolucionUrls(limiter);

  console.log(
    `[dian-resoluciones] Will scrape ${urls.length} resolution URLs...\n`
  );

  let batchNum = 0;
  let totalScraped = 0;
  let currentBatch: ResolucionScraped[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const { html } = await limiter.execute(() =>
        fetchHtml(urls[i], {
          timeout: 20000,
          encoding: "iso-8859-1",
          referer: `${BASE_URL}t_1_normativa_tributaria.html`,
        })
      );

      const result = parseResolucion(html, urls[i]);

      if (result && !existingIds.has(result.id)) {
        currentBatch.push(result);
        existingIds.add(result.id);
        totalScraped++;

        if (currentBatch.length >= BATCH_SIZE) {
          saveBatch(currentBatch, batchNum++);
          currentBatch = [];
        }
      }
    } catch (error) {
      // Skip failed URLs silently
    }

    if ((i + 1) % 50 === 0) {
      console.log(
        `[dian-resoluciones] Progress: ${i + 1}/${urls.length}, scraped: ${totalScraped}`
      );
    }
  }

  if (currentBatch.length > 0) {
    saveBatch(currentBatch, batchNum);
  }

  console.log(
    `\n[dian-resoluciones] Complete! Total: ${totalScraped} from ${urls.length} URLs`
  );
}

main().catch(console.error);
