/**
 * Phase 2 — Corte Constitucional Scraper
 *
 * Strategy:
 * 1. Start from sentencias referenced in graph-seed.json (known references)
 * 2. Scrape each sentencia's HTML from predictable URLs
 * 3. Expand: for each scraped sentencia, find cited sentencias → scrape recursively (max 2 hops)
 *
 * Usage: npx tsx scripts/scraping/scrapers/corte-constitucional.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml } from "../utils/html-fetcher";
import { createGovScraper, RateLimiter } from "../utils/rate-limiter";
import { loadExistingIds } from "../utils/dedup";
import {
  parseCorteConstitucional,
  SentenciaScraped,
} from "../parsers/sentencia-parser";
import { extractSentences } from "../utils/regex-patterns";
import { GraphSeed } from "../../graph/types";

const OUTPUT_DIR = path.resolve("data/scraped/jurisprudencia");
const SEED_PATH = path.resolve("public/data/graph-seed.json");
const BATCH_SIZE = 25;
const MAX_HOPS = 2;

// CC relatoria URL patterns — try 2-digit year first, then 4-digit
function buildCCUrls(tipo: string, numero: string, year: number): string[] {
  const t = tipo.toLowerCase();
  const y4 = year.toString();
  const y2 = y4.slice(-2);
  const n = numero.padStart(3, "0");
  // CC uses both formats; try 2-digit year first (more common)
  return [
    `https://www.corteconstitucional.gov.co/relatoria/${y4}/${t}-${n}-${y2}.htm`,
    `https://www.corteconstitucional.gov.co/relatoria/${y4}/${t}-${n}-${y4}.htm`,
  ];
}

/**
 * Load seed sentencias from graph-seed.json
 */
function loadSeedSentencias(): Array<{
  tipo: string;
  numero: string;
  year: number;
}> {
  if (!fs.existsSync(SEED_PATH)) {
    console.warn(
      "[cc-scraper] graph-seed.json not found. Run extract-references.ts first."
    );
    return [];
  }

  const seed: GraphSeed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
  const sentencias: Array<{ tipo: string; numero: string; year: number }> = [];

  for (const [, entity] of Object.entries(seed.entities.sentences)) {
    if (["C", "SU", "T"].includes(entity.tipo)) {
      sentencias.push({
        tipo: entity.tipo,
        numero: entity.numero,
        year: entity.year,
      });
    }
  }

  return sentencias;
}

/**
 * Scrape a single CC sentencia. Tries both 2-digit and 4-digit year URL formats.
 */
async function scrapeSentencia(
  tipo: string,
  numero: string,
  year: number,
  limiter: RateLimiter
): Promise<SentenciaScraped | null> {
  const urls = buildCCUrls(tipo, numero, year);

  for (const url of urls) {
    try {
      const { html } = await limiter.execute(() =>
        fetchHtml(url, {
          timeout: 20000,
          referer: "https://www.corteconstitucional.gov.co/relatoria/",
        })
      );

      // The CC pages use windows-1252 but our fetchHtml now auto-detects from meta charset
      if (html.length < 200) continue; // Empty/error page

      const result = parseCorteConstitucional(
        html,
        url,
        tipo as "C" | "SU" | "T",
        numero,
        year
      );

      if (result) return result;
    } catch (error) {
      const msg = (error as Error).message;
      // Try next URL format if 403/404
      if (msg.includes("403") || msg.includes("404")) continue;
      // Log other errors but continue
      console.error(
        `[cc-scraper] Error scraping ${tipo}-${numero}/${year}:`,
        msg
      );
      return null;
    }
  }

  return null;
}

/**
 * Extract cited sentencias from a scraped sentencia for recursive expansion.
 */
function extractCitedSentencias(
  sentencia: SentenciaScraped
): Array<{ tipo: string; numero: string; year: number }> {
  const allText = [
    sentencia.resumen,
    sentencia.ratioDecidendi,
    sentencia.textoCompleto,
  ]
    .filter(Boolean)
    .join("\n");

  return extractSentences(allText).map((s) => ({
    tipo: s.tipo,
    numero: s.numero,
    year: s.year,
  }));
}

function saveBatch(items: SentenciaScraped[], batchNum: number): void {
  if (items.length === 0) return;
  const filePath = path.join(
    OUTPUT_DIR,
    `cc-batch-${batchNum.toString().padStart(4, "0")}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`[cc-scraper] Saved batch ${batchNum}: ${items.length} items`);
}

async function main() {
  console.log("[cc-scraper] Starting Corte Constitucional scraper...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingIds = loadExistingIds(OUTPUT_DIR);
  console.log(`[cc-scraper] ${existingIds.size} already scraped`);

  const limiter = createGovScraper();

  // Load seed sentencias from graph-seed
  const seedSentencias = loadSeedSentencias();
  console.log(`[cc-scraper] ${seedSentencias.length} seed sentencias from graph`);

  // BFS expansion with hop limit
  type SentenciaTarget = { tipo: string; numero: string; year: number };
  let currentTargets: SentenciaTarget[] = [...seedSentencias];
  const visited = new Set<string>();
  let totalScraped = 0;
  let batchNum = 0;
  let currentBatch: SentenciaScraped[] = [];

  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    console.log(
      `\n[cc-scraper] Hop ${hop}: ${currentTargets.length} targets to scrape`
    );
    const nextTargets: SentenciaTarget[] = [];

    for (let i = 0; i < currentTargets.length; i++) {
      const { tipo, numero, year } = currentTargets[i];
      const key = `${tipo}-${numero}-${year}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const id = `cc-${tipo.toLowerCase()}-${numero}-${year}`;
      if (existingIds.has(id)) continue;

      const result = await scrapeSentencia(tipo, numero, year, limiter);

      if (result) {
        currentBatch.push(result);
        existingIds.add(result.id);
        totalScraped++;

        // Expand: find cited sentencias
        if (hop < MAX_HOPS) {
          const cited = extractCitedSentencias(result);
          nextTargets.push(...cited);
        }

        if (currentBatch.length >= BATCH_SIZE) {
          saveBatch(currentBatch, batchNum++);
          currentBatch = [];
        }
      }

      if ((i + 1) % 50 === 0) {
        console.log(
          `[cc-scraper] Hop ${hop} progress: ${i + 1}/${currentTargets.length}, total scraped: ${totalScraped}`
        );
      }
    }

    currentTargets = nextTargets;
  }

  if (currentBatch.length > 0) {
    saveBatch(currentBatch, batchNum);
  }

  console.log(
    `\n[cc-scraper] Complete! Total scraped: ${totalScraped}, visited: ${visited.size}`
  );
}

main().catch(console.error);
