/**
 * Phase 1 — DIAN Doctrina Scraper
 *
 * Scrapes doctrina (conceptos, oficios, circulares) from DIAN Normograma.
 *
 * Discovery strategy:
 * The normograma uses a JS tree that dynamically loads sub-pages.
 * The page `t_2_doctrina_tributaria.html` loads parts via:
 *   `t_2_doctrina_tributaria_parte_01.html` through `_parte_13.html`
 * Each part contains `href="docs/..."` links to individual doctrina documents.
 *
 * Usage: npx tsx scripts/scraping/scrapers/dian-doctrina.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml } from "../utils/html-fetcher";
import { createGovScraper, RateLimiter } from "../utils/rate-limiter";
import { doctrinaId, loadExistingIds } from "../utils/dedup";
import {
  parseDianDoctrina,
  DoctrinaScraped,
} from "../parsers/doctrina-parser";

const OUTPUT_DIR = path.resolve("data/scraped/doctrina");
const BATCH_SIZE = 50;

// The normograma tree loads 13 sub-pages dynamically
const BASE_URL = "https://normograma.dian.gov.co/dian/compilacion/";
const TOTAL_PARTS = 13;

/**
 * Discovery: Fetch all 13 dynamically-loaded sub-pages and extract document URLs.
 */
async function discoverDoctrinaUrls(
  limiter: RateLimiter
): Promise<string[]> {
  const urls = new Set<string>();

  for (let i = 1; i <= TOTAL_PARTS; i++) {
    const partNum = i.toString().padStart(2, "0");
    const partUrl = `${BASE_URL}t_2_doctrina_tributaria_parte_${partNum}.html`;

    console.log(`[dian-doctrina] Fetching part ${partNum}/${TOTAL_PARTS}...`);

    try {
      const { html } = await limiter.execute(() =>
        fetchHtml(partUrl, { timeout: 30000, encoding: "iso-8859-1" })
      );

      // Extract all href="docs/..." links
      const linkRegex = /href="(docs\/[^"]+\.htm[l]?)"/gi;
      let match;
      const partUrls = new Set<string>();
      while ((match = linkRegex.exec(html)) !== null) {
        const docPath = match[1];
        const fullUrl = `${BASE_URL}${docPath}`;
        partUrls.add(fullUrl);
      }

      for (const url of partUrls) {
        urls.add(url);
      }

      console.log(
        `[dian-doctrina] Part ${partNum}: ${partUrls.size} unique docs (total so far: ${urls.size})`
      );
    } catch (error) {
      console.error(
        `[dian-doctrina] Failed to fetch part ${partNum}:`,
        (error as Error).message
      );
    }
  }

  console.log(`[dian-doctrina] Discovery complete: ${urls.size} unique document URLs`);
  return Array.from(urls);
}

/**
 * Scrape a single doctrina page and return parsed result.
 */
async function scrapeSingleDoctrina(
  url: string,
  limiter: RateLimiter,
  existingIds: Set<string>
): Promise<DoctrinaScraped | null> {
  try {
    const { html } = await limiter.execute(() =>
      fetchHtml(url, {
        timeout: 20000,
        encoding: "iso-8859-1",
        referer: `${BASE_URL}t_2_doctrina_tributaria.html`,
      })
    );

    const parsed = parseDianDoctrina(html, url);

    if (!parsed || !parsed.numero) return null;

    const year = parsed.fecha
      ? parseInt(parsed.fecha.slice(0, 4), 10)
      : new Date().getFullYear();
    const id = doctrinaId(parsed.tipo || "concepto", parsed.numero, year);

    // Skip if already scraped
    if (existingIds.has(id)) return null;

    return {
      id,
      tipo: parsed.tipo || "concepto",
      numero: parsed.numero,
      fecha: parsed.fecha || "",
      tema: parsed.tema || "",
      descriptor: parsed.descriptor || [],
      pregunta: parsed.pregunta,
      sintesis: parsed.sintesis || "",
      conclusionClave: parsed.conclusionClave,
      articulosET: parsed.articulosET || [],
      articulosSlugs: parsed.articulosSlugs || [],
      vigente: parsed.vigente ?? true,
      revocadoPor: undefined,
      fuenteUrl: url,
      fuenteSitio: "dian",
      fechaScraping: new Date().toISOString(),
    };
  } catch (error) {
    // Don't log every 403/404 - just skip
    const msg = (error as Error).message;
    if (!msg.includes("403") && !msg.includes("404")) {
      console.error(`[dian-doctrina] Error scraping ${url}:`, msg);
    }
    return null;
  }
}

/**
 * Save a batch of scraped doctrina to disk.
 */
function saveBatch(items: DoctrinaScraped[], batchNum: number): void {
  if (items.length === 0) return;

  const filePath = path.join(OUTPUT_DIR, `batch-${batchNum.toString().padStart(4, "0")}.json`);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`[dian-doctrina] Saved batch ${batchNum}: ${items.length} items → ${filePath}`);
}

async function main() {
  console.log("[dian-doctrina] Starting DIAN Doctrina scraper...");
  console.log(`[dian-doctrina] Discovering from ${TOTAL_PARTS} normograma sub-pages...`);

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load already-scraped IDs for idempotency
  const existingIds = loadExistingIds(OUTPUT_DIR);
  console.log(`[dian-doctrina] ${existingIds.size} already scraped, skipping...`);

  const limiter = createGovScraper();

  // Phase 1: Discovery — fetch all 13 sub-pages to find document URLs
  const urls = await discoverDoctrinaUrls(limiter);
  console.log(`[dian-doctrina] Will scrape ${urls.length} document URLs...\n`);

  if (urls.length === 0) {
    console.log("[dian-doctrina] No URLs discovered. Exiting.");
    return;
  }

  // Phase 2: Sequential fetch + parse in batches (rate-limited)
  let batchNum = 0;
  let totalScraped = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let currentBatch: DoctrinaScraped[] = [];

  for (let i = 0; i < urls.length; i++) {
    const result = await scrapeSingleDoctrina(urls[i], limiter, existingIds);

    if (result) {
      currentBatch.push(result);
      existingIds.add(result.id);
      totalScraped++;
    } else {
      // Could be already scraped, parse failure, or HTTP error
      totalSkipped++;
    }

    // Save batch when full
    if (currentBatch.length >= BATCH_SIZE) {
      saveBatch(currentBatch, batchNum++);
      currentBatch = [];
    }

    // Progress log every 100 URLs
    if ((i + 1) % 100 === 0) {
      console.log(
        `[dian-doctrina] Progress: ${i + 1}/${urls.length} URLs processed, ${totalScraped} scraped, ${totalSkipped} skipped`
      );
    }
  }

  // Save remaining
  if (currentBatch.length > 0) {
    saveBatch(currentBatch, batchNum);
  }

  console.log(
    `\n[dian-doctrina] Complete! Total scraped: ${totalScraped} from ${urls.length} URLs (${totalSkipped} skipped)`
  );
}

main().catch(console.error);
