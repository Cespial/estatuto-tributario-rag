/**
 * Phase 2 — Consejo de Estado Scraper (Sección Cuarta - Tributaria)
 *
 * Scrapes sentencias from Consejo de Estado's web relatoria.
 * Filters for Sección Cuarta (tributaria) by keyword search.
 *
 * Usage: npx tsx scripts/scraping/scrapers/consejo-estado.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml, stripHtml } from "../utils/html-fetcher";
import { createGovScraper, RateLimiter } from "../utils/rate-limiter";
import { loadExistingIds } from "../utils/dedup";
import {
  parseConsejoEstado,
  SentenciaScraped,
} from "../parsers/sentencia-parser";

const OUTPUT_DIR = path.resolve("data/scraped/jurisprudencia");
const BATCH_SIZE = 25;

// CE relatoria search URL (Sección Cuarta)
const CE_SEARCH_BASE =
  "https://jurisprudencia.ramajudicial.gov.co/WebRelatoria/ce/index.xhtml";

// Keywords for tributary matters
const SEARCH_KEYWORDS = [
  "impuesto renta",
  "impuesto valor agregado IVA",
  "retencion fuente",
  "estatuto tributario",
  "DIAN procedimiento tributario",
  "sancion tributaria",
  "ganancia ocasional",
  "impuesto patrimonio",
  "renta presuntiva",
  "beneficio tributario",
];

/**
 * Search CE relatoria for sentencias matching keywords.
 * Returns discovered URLs.
 */
async function discoverCEUrls(limiter: RateLimiter): Promise<string[]> {
  const urls = new Set<string>();

  for (const keyword of SEARCH_KEYWORDS) {
    console.log(`[ce-scraper] Searching: "${keyword}"`);

    try {
      // The CE search uses POST or query params — try GET with query
      const searchUrl = `${CE_SEARCH_BASE}?searchText=${encodeURIComponent(keyword)}&seccion=4`;
      const { html } = await limiter.execute(() =>
        fetchHtml(searchUrl, { timeout: 30000 })
      );

      // Extract links to sentencia pages
      const linkRegex =
        /href=["']([^"']*(?:sentencia|providencia|fallo)[^"']*)["']/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const fullUrl = href.startsWith("http")
          ? href
          : new URL(href, CE_SEARCH_BASE).toString();
        urls.add(fullUrl);
      }

      // Also try extracting from result list items
      const resultRegex =
        /href=["']([^"']*\d{5}[^"']*)["']/gi;
      while ((match = resultRegex.exec(html)) !== null) {
        const href = match[1];
        const fullUrl = href.startsWith("http")
          ? href
          : new URL(href, CE_SEARCH_BASE).toString();
        urls.add(fullUrl);
      }
    } catch (error) {
      console.error(
        `[ce-scraper] Search failed for "${keyword}":`,
        (error as Error).message
      );
    }
  }

  console.log(`[ce-scraper] Discovered ${urls.size} sentencia URLs`);
  return Array.from(urls);
}

/**
 * Extract expediente number and year from URL or text.
 */
function extractExpediente(
  url: string,
  text: string
): { numero: string; year: number } | null {
  // Try URL first
  const urlMatch = url.match(/(\d{5,6})/);
  // Try text for expediente
  const textMatch = text.match(
    /[Ee]xpediente\s+(?:No\.?\s*)?(\d{4,6})/
  );

  const numero = textMatch?.[1] || urlMatch?.[1];
  if (!numero) return null;

  // Extract year from text
  const yearMatch = text.match(
    /(\d{1,2})\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  const year = yearMatch ? parseInt(yearMatch[2], 10) : new Date().getFullYear();

  return { numero, year };
}

async function scrapeSingleCE(
  url: string,
  limiter: RateLimiter,
  existingIds: Set<string>
): Promise<SentenciaScraped | null> {
  try {
    const { html } = await limiter.execute(() =>
      fetchHtml(url, { timeout: 30000 })
    );
    const text = stripHtml(html);

    const expediente = extractExpediente(url, text);
    if (!expediente) return null;

    const { numero, year } = expediente;
    const id = `ce-s4-${numero}-${year}`;

    if (existingIds.has(id)) return null;

    // Filter: must be tributaria (Sección Cuarta)
    const isTributaria =
      /secci[oó]n\s+cuarta|tribut|impuesto|DIAN|renta/i.test(
        text.slice(0, 2000)
      );
    if (!isTributaria) return null;

    return parseConsejoEstado(html, url, numero, year);
  } catch (error) {
    console.error(
      `[ce-scraper] Error scraping ${url}:`,
      (error as Error).message
    );
    return null;
  }
}

function saveBatch(items: SentenciaScraped[], batchNum: number): void {
  if (items.length === 0) return;
  const filePath = path.join(
    OUTPUT_DIR,
    `ce-batch-${batchNum.toString().padStart(4, "0")}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`[ce-scraper] Saved batch ${batchNum}: ${items.length} items`);
}

async function main() {
  console.log("[ce-scraper] Starting Consejo de Estado scraper (Sección Cuarta)...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingIds = loadExistingIds(OUTPUT_DIR);
  console.log(`[ce-scraper] ${existingIds.size} already scraped`);

  const limiter = createGovScraper();
  const urls = await discoverCEUrls(limiter);

  let batchNum = 0;
  let totalScraped = 0;
  let currentBatch: SentenciaScraped[] = [];

  for (let i = 0; i < urls.length; i++) {
    const result = await scrapeSingleCE(urls[i], limiter, existingIds);

    if (result) {
      currentBatch.push(result);
      existingIds.add(result.id);
      totalScraped++;

      if (currentBatch.length >= BATCH_SIZE) {
        saveBatch(currentBatch, batchNum++);
        currentBatch = [];
      }
    }

    if ((i + 1) % 50 === 0) {
      console.log(
        `[ce-scraper] Progress: ${i + 1}/${urls.length}, scraped: ${totalScraped}`
      );
    }
  }

  if (currentBatch.length > 0) {
    saveBatch(currentBatch, batchNum);
  }

  console.log(
    `\n[ce-scraper] Complete! Total scraped: ${totalScraped} from ${urls.length} URLs`
  );
}

main().catch(console.error);
