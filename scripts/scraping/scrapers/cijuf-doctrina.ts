/**
 * Phase 1 — CIJUF Doctrina Scraper (Secondary source)
 *
 * Scrapes doctrina from CIJUF (Centro Interamericano Jurídico Financiero).
 * Provides additional coverage for DIAN concepts/oficios.
 *
 * Usage: npx tsx scripts/scraping/scrapers/cijuf-doctrina.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml } from "../utils/html-fetcher";
import { createGovScraper, RateLimiter } from "../utils/rate-limiter";
import { doctrinaId, loadExistingIds } from "../utils/dedup";
import {
  parseCijufDoctrina,
  DoctrinaScraped,
} from "../parsers/doctrina-parser";

const OUTPUT_DIR = path.resolve("data/scraped/doctrina");
const BATCH_SIZE = 50;

// CIJUF base URL for normatividad/concepto listing
const CIJUF_BASE = "https://cijuf.org.co/normatividad/concepto/";

/**
 * Discover concept URLs from CIJUF index pages.
 */
async function discoverCijufUrls(limiter: RateLimiter): Promise<string[]> {
  const urls = new Set<string>();

  // CIJUF often has paginated listings
  const pagesToTry = 50; // Try up to 50 pages
  for (let page = 1; page <= pagesToTry; page++) {
    const pageUrl =
      page === 1 ? CIJUF_BASE : `${CIJUF_BASE}page/${page}/`;

    try {
      const { html, status } = await limiter.execute(() =>
        fetchHtml(pageUrl, { timeout: 15000 })
      );

      if (status === 404 || !html.includes("concepto")) {
        console.log(`[cijuf] Stopping at page ${page} (no more content)`);
        break;
      }

      // Extract links
      const linkRegex = /href=["']([^"']*(?:concepto|oficio)[^"']*)["']/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const fullUrl = href.startsWith("http")
          ? href
          : new URL(href, CIJUF_BASE).toString();
        urls.add(fullUrl);
      }
    } catch (error) {
      console.log(`[cijuf] Stopped at page ${page}: ${(error as Error).message}`);
      break;
    }
  }

  console.log(`[cijuf] Discovered ${urls.size} doctrina URLs`);
  return Array.from(urls);
}

async function scrapeSingleCijuf(
  url: string,
  limiter: RateLimiter,
  existingIds: Set<string>
): Promise<DoctrinaScraped | null> {
  try {
    const { html } = await limiter.execute(() => fetchHtml(url));
    const parsed = parseCijufDoctrina(html, url);

    if (!parsed || !parsed.numero) return null;

    const year = parsed.fecha
      ? parseInt(parsed.fecha.slice(0, 4), 10)
      : new Date().getFullYear();
    const id = doctrinaId(parsed.tipo || "concepto", parsed.numero, year);

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
      fuenteSitio: "cijuf",
      fechaScraping: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[cijuf] Error scraping ${url}:`, error);
    return null;
  }
}

function saveBatch(items: DoctrinaScraped[], batchNum: number): void {
  if (items.length === 0) return;
  const filePath = path.join(OUTPUT_DIR, `cijuf-batch-${batchNum.toString().padStart(4, "0")}.json`);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`[cijuf] Saved batch ${batchNum}: ${items.length} items`);
}

async function main() {
  console.log("[cijuf] Starting CIJUF Doctrina scraper...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingIds = loadExistingIds(OUTPUT_DIR);
  console.log(`[cijuf] ${existingIds.size} already scraped`);

  const limiter = createGovScraper();
  const urls = await discoverCijufUrls(limiter);

  let batchNum = 0;
  let totalScraped = 0;
  let currentBatch: DoctrinaScraped[] = [];

  for (let i = 0; i < urls.length; i++) {
    const result = await scrapeSingleCijuf(urls[i], limiter, existingIds);

    if (result) {
      currentBatch.push(result);
      existingIds.add(result.id);
      totalScraped++;
    }

    if (currentBatch.length >= BATCH_SIZE) {
      saveBatch(currentBatch, batchNum++);
      currentBatch = [];
    }

    if ((i + 1) % 100 === 0) {
      console.log(`[cijuf] Progress: ${i + 1}/${urls.length}, scraped: ${totalScraped}`);
    }
  }

  if (currentBatch.length > 0) {
    saveBatch(currentBatch, batchNum);
  }

  console.log(`\n[cijuf] Complete! Total: ${totalScraped} from ${urls.length} URLs`);
}

main().catch(console.error);
