/**
 * Phase 3 — Decretos Reglamentarios Scraper (DUR 1625/2016)
 *
 * Scrapes the Decreto Único Reglamentario Tributario from SUIN-Juriscol
 * and Secretaría del Senado.
 *
 * Usage: npx tsx scripts/scraping/scrapers/suin-decretos.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml } from "../utils/html-fetcher";
import { createGovScraper, RateLimiter } from "../utils/rate-limiter";
import { loadExistingIds } from "../utils/dedup";
import {
  parseSuinDecreto,
  parseSenadoDecreto,
  DecretoScraped,
} from "../parsers/decreto-parser";

const OUTPUT_DIR = path.resolve("data/scraped/decretos");
const BATCH_SIZE = 100;

// DUR 1625/2016 — main reglamentary decree for tax
const SOURCES = {
  suin: {
    url: "https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Decretos/30030361",
    decretoNumero: "1625",
    decretoYear: 2016,
  },
  senado: {
    url: "https://www.secretariasenado.gov.co/senado/basedoc/decreto_1625_2016.html",
    decretoNumero: "1625",
    decretoYear: 2016,
  },
};

// Additional regulatory decrees that modify the DUR
const ADDITIONAL_DECREES = [
  { numero: "2231", year: 2023, path: "decreto_2231_2023" },
  { numero: "0219", year: 2023, path: "decreto_0219_2023" },
  { numero: "1778", year: 2021, path: "decreto_1778_2021" },
  { numero: "1435", year: 2020, path: "decreto_1435_2020" },
];

// DIAN normograma as a third fallback source for DUR articles
const NORMOGRAMA_DUR_URL =
  "https://normograma.dian.gov.co/dian/compilacion/docs/decreto_1625_2016.htm";

function saveBatch(items: DecretoScraped[], batchNum: number): void {
  if (items.length === 0) return;
  const filePath = path.join(
    OUTPUT_DIR,
    `decreto-batch-${batchNum.toString().padStart(4, "0")}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`[suin-decretos] Saved batch ${batchNum}: ${items.length} articles`);
}

async function main() {
  console.log("[suin-decretos] Starting DUR 1625/2016 scraper...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingIds = loadExistingIds(OUTPUT_DIR);
  console.log(`[suin-decretos] ${existingIds.size} already scraped`);

  const limiter = createGovScraper();
  let totalScraped = 0;
  let batchNum = 0;
  let currentBatch: DecretoScraped[] = [];

  // Try SUIN first (more structured)
  console.log("[suin-decretos] Fetching DUR from SUIN-Juriscol...");
  try {
    const { html } = await limiter.execute(() =>
      fetchHtml(SOURCES.suin.url, { timeout: 60000 })
    );

    const articles = parseSuinDecreto(
      html,
      SOURCES.suin.url,
      SOURCES.suin.decretoNumero,
      SOURCES.suin.decretoYear
    );

    for (const art of articles) {
      if (!existingIds.has(art.id)) {
        currentBatch.push(art);
        existingIds.add(art.id);
        totalScraped++;

        if (currentBatch.length >= BATCH_SIZE) {
          saveBatch(currentBatch, batchNum++);
          currentBatch = [];
        }
      }
    }

    console.log(`[suin-decretos] SUIN: extracted ${articles.length} articles`);
  } catch (error) {
    console.error("[suin-decretos] SUIN failed:", (error as Error).message);

    // Fallback to Senado
    console.log("[suin-decretos] Trying Senado fallback...");
    try {
      const { html } = await limiter.execute(() =>
        fetchHtml(SOURCES.senado.url, { timeout: 60000 })
      );

      const articles = parseSenadoDecreto(
        html,
        SOURCES.senado.url,
        SOURCES.senado.decretoNumero,
        SOURCES.senado.decretoYear
      );

      for (const art of articles) {
        if (!existingIds.has(art.id)) {
          currentBatch.push(art);
          existingIds.add(art.id);
          totalScraped++;

          if (currentBatch.length >= BATCH_SIZE) {
            saveBatch(currentBatch, batchNum++);
            currentBatch = [];
          }
        }
      }

      console.log(
        `[suin-decretos] Senado: extracted ${articles.length} articles`
      );
    } catch (err) {
      console.error("[suin-decretos] Senado also failed:", (err as Error).message);

      // Third fallback: DIAN Normograma
      console.log("[suin-decretos] Trying DIAN Normograma fallback...");
      try {
        const { html } = await limiter.execute(() =>
          fetchHtml(NORMOGRAMA_DUR_URL, { timeout: 60000, encoding: "iso-8859-1" })
        );

        const articles = parseSenadoDecreto(
          html,
          NORMOGRAMA_DUR_URL,
          "1625",
          2016
        );

        for (const art of articles) {
          if (!existingIds.has(art.id)) {
            currentBatch.push(art);
            existingIds.add(art.id);
            totalScraped++;

            if (currentBatch.length >= BATCH_SIZE) {
              saveBatch(currentBatch, batchNum++);
              currentBatch = [];
            }
          }
        }

        console.log(
          `[suin-decretos] Normograma: extracted ${articles.length} articles`
        );
      } catch (normErr) {
        console.error("[suin-decretos] Normograma also failed:", (normErr as Error).message);
      }
    }
  }

  // Additional modifying decrees — try Senado first, then Normograma
  for (const decreto of ADDITIONAL_DECREES) {
    const urls = [
      `https://www.secretariasenado.gov.co/senado/basedoc/${decreto.path}.html`,
      `https://normograma.dian.gov.co/dian/compilacion/docs/${decreto.path}.htm`,
    ];

    let scraped = false;
    for (const url of urls) {
      console.log(`[suin-decretos] Fetching Decreto ${decreto.numero} de ${decreto.year} from ${new URL(url).hostname}...`);

      try {
        const { html } = await limiter.execute(() =>
          fetchHtml(url, { timeout: 30000 })
        );

        const articles = parseSenadoDecreto(
          html,
          url,
          decreto.numero,
          decreto.year
        );

        for (const art of articles) {
          if (!existingIds.has(art.id)) {
            currentBatch.push(art);
            existingIds.add(art.id);
            totalScraped++;

            if (currentBatch.length >= BATCH_SIZE) {
              saveBatch(currentBatch, batchNum++);
              currentBatch = [];
            }
          }
        }

        if (articles.length > 0) {
          console.log(
            `[suin-decretos] Decreto ${decreto.numero}: ${articles.length} articles`
          );
          scraped = true;
          break;
        }
      } catch (error) {
        console.warn(
          `[suin-decretos] Decreto ${decreto.numero} failed from ${new URL(url).hostname}:`,
          (error as Error).message
        );
      }
    }

    if (!scraped) {
      console.error(`[suin-decretos] All sources failed for Decreto ${decreto.numero}`);
    }
  }

  if (currentBatch.length > 0) {
    saveBatch(currentBatch, batchNum);
  }

  console.log(`\n[suin-decretos] Complete! Total scraped: ${totalScraped}`);
}

main().catch(console.error);
