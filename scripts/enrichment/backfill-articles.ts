/**
 * Phase 7 — Backfill Articles with External Source References
 *
 * For each of the 1,294 articles, searches the scraped data to find:
 * - Doctrina (conceptos/oficios) that mention this article
 * - Jurisprudencia (sentencias) that analyze this article
 * - Decretos that regulate this article
 *
 * Updates the article JSON files with linked external sources.
 *
 * Usage: npx tsx scripts/enrichment/backfill-articles.ts
 */

import * as fs from "fs";
import * as path from "path";
import { ArticleJSON } from "../graph/types";
import { DoctrinaScraped } from "../scraping/parsers/doctrina-parser";
import { SentenciaScraped } from "../scraping/parsers/sentencia-parser";
import { DecretoScraped } from "../scraping/parsers/decreto-parser";

const ARTICLES_DIR = path.resolve("public/data/articles");
const DOCTRINA_DIR = path.resolve("data/scraped/doctrina");
const JURISPRUDENCIA_DIR = path.resolve("data/scraped/jurisprudencia");
const DECRETOS_DIR = path.resolve("data/scraped/decretos");

interface LinkedDoctrina {
  id: string;
  tipo: string;
  numero: string;
  fecha: string;
  tema: string;
  vigente: boolean;
}

interface LinkedSentencia {
  id: string;
  corte: string;
  tipo: string;
  numero: string;
  year: number;
  decision?: string;
}

interface LinkedDecreto {
  id: string;
  decretoNumero: string;
  articuloNumero: string;
  vigente: boolean;
}

/**
 * Load all scraped data from batch files in a directory.
 */
function loadBatchData<T>(dir: string): T[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const items: T[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) items.push(...data);
    else items.push(data);
  }

  return items;
}

/**
 * Build an index: article slug → list of doctrina that reference it.
 */
function buildDoctrinaIndex(
  docs: DoctrinaScraped[]
): Map<string, LinkedDoctrina[]> {
  const index = new Map<string, LinkedDoctrina[]>();

  for (const doc of docs) {
    for (const slug of doc.articulosSlugs || []) {
      const existing = index.get(slug) || [];
      existing.push({
        id: doc.id,
        tipo: doc.tipo,
        numero: doc.numero,
        fecha: doc.fecha,
        tema: doc.tema,
        vigente: doc.vigente,
      });
      index.set(slug, existing);
    }
  }

  return index;
}

/**
 * Build an index: article slug → list of sentencias that reference it.
 */
function buildSentenciaIndex(
  docs: SentenciaScraped[]
): Map<string, LinkedSentencia[]> {
  const index = new Map<string, LinkedSentencia[]>();

  for (const doc of docs) {
    for (const slug of doc.articulosSlugs || []) {
      const existing = index.get(slug) || [];
      existing.push({
        id: doc.id,
        corte: doc.corte,
        tipo: doc.tipo,
        numero: doc.numero,
        year: doc.year,
        decision: doc.decision,
      });
      index.set(slug, existing);
    }
  }

  return index;
}

/**
 * Extract ET article numbers from decreto text using patterns specific to regulatory text.
 * Looks for phrases like "artículo 240 del Estatuto Tributario" or "artículos 240 y 241 del E.T."
 */
function extractETRefsFromDecretoText(text: string): string[] {
  const refs = new Set<string>();

  // Pattern: "artículo(s) N (y N)* del Estatuto Tributario"
  const etPattern =
    /art[ií]culos?\s+([\d,\s\-y]+)\s+del\s+(?:Estatuto\s+Tributario|E\.?\s*T\.?)/gi;
  let match;
  while ((match = etPattern.exec(text)) !== null) {
    const nums = match[1].match(/\d{1,4}(?:-\d{1,2})?/g);
    if (nums) {
      for (const n of nums) refs.add(n);
    }
  }

  // Pattern: "en desarrollo del artículo N" or "reglamentario del artículo N"
  const regPattern =
    /(?:desarrollo|reglamentario|aplicaci[oó]n|cumplimiento)\s+(?:del|de\s+los?)\s+art[ií]culos?\s+([\d,\s\-y]+)/gi;
  while ((match = regPattern.exec(text)) !== null) {
    const nums = match[1].match(/\d{1,4}(?:-\d{1,2})?/g);
    if (nums) {
      for (const n of nums) {
        // Only add 1-4 digit numbers (not DUR article numbers like 1.2.1.5.1)
        if (!n.includes('.') && parseInt(n) <= 9999) refs.add(n);
      }
    }
  }

  return Array.from(refs);
}

/**
 * Build an index: article slug → list of decretos that regulate it.
 * Uses both pre-extracted articulosSlugs AND improved text-based extraction.
 */
function buildDecretoIndex(
  docs: DecretoScraped[]
): Map<string, LinkedDecreto[]> {
  const index = new Map<string, LinkedDecreto[]>();

  for (const doc of docs) {
    // Combine pre-extracted slugs with improved text extraction
    const allSlugs = new Set(doc.articulosSlugs || []);
    for (const slug of extractETRefsFromDecretoText(doc.texto)) {
      allSlugs.add(slug);
    }

    for (const slug of allSlugs) {
      const existing = index.get(slug) || [];
      existing.push({
        id: doc.id,
        decretoNumero: doc.decretoNumero,
        articuloNumero: doc.articuloNumero,
        vigente: doc.vigente,
      });
      index.set(slug, existing);
    }
  }

  return index;
}

async function main() {
  console.log("[backfill] Starting article enrichment backfill...");

  // Load scraped data
  console.log("[backfill] Loading scraped doctrina...");
  const doctrina = loadBatchData<DoctrinaScraped>(DOCTRINA_DIR);
  console.log(`[backfill] Loaded ${doctrina.length} doctrina documents`);

  console.log("[backfill] Loading scraped jurisprudencia...");
  const sentencias = loadBatchData<SentenciaScraped>(JURISPRUDENCIA_DIR);
  console.log(`[backfill] Loaded ${sentencias.length} sentencia documents`);

  console.log("[backfill] Loading scraped decretos...");
  const decretos = loadBatchData<DecretoScraped>(DECRETOS_DIR);
  console.log(`[backfill] Loaded ${decretos.length} decreto articles`);

  // Build indexes
  const doctrinaIndex = buildDoctrinaIndex(doctrina);
  const sentenciaIndex = buildSentenciaIndex(sentencias);
  const decretoIndex = buildDecretoIndex(decretos);

  // Load and update each article
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"));
  console.log(`[backfill] Processing ${files.length} articles...`);

  let enriched = 0;

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const article = JSON.parse(raw) as ArticleJSON & {
      doctrina_vinculada?: LinkedDoctrina[];
      jurisprudencia_vinculada?: LinkedSentencia[];
      decretos_vinculados?: LinkedDecreto[];
    };

    const slug = article.slug;
    let changed = false;

    // Link doctrina
    const linkedDoctrina = doctrinaIndex.get(slug);
    if (linkedDoctrina && linkedDoctrina.length > 0) {
      article.doctrina_vinculada = linkedDoctrina;
      // Also update the doctrina_dian_scrape field with a summary
      if (!article.doctrina_dian_scrape) {
        article.doctrina_dian_scrape = linkedDoctrina
          .slice(0, 5)
          .map((d) => `${d.tipo} ${d.numero} (${d.fecha}): ${d.tema}`)
          .join("\n");
      }
      changed = true;
    }

    // Link jurisprudencia
    const linkedSentencias = sentenciaIndex.get(slug);
    if (linkedSentencias && linkedSentencias.length > 0) {
      article.jurisprudencia_vinculada = linkedSentencias;
      changed = true;
    }

    // Link decretos
    const linkedDecretos = decretoIndex.get(slug);
    if (linkedDecretos && linkedDecretos.length > 0) {
      article.decretos_vinculados = linkedDecretos;
      changed = true;
    }

    // Update concordancias if empty
    if (!article.concordancias && (linkedDoctrina || linkedSentencias || linkedDecretos)) {
      const parts: string[] = [];
      if (linkedDoctrina) {
        parts.push(
          `Doctrina DIAN: ${linkedDoctrina.length} concepto(s) relacionado(s)`
        );
      }
      if (linkedSentencias) {
        parts.push(
          `Jurisprudencia: ${linkedSentencias.length} sentencia(s) relacionada(s)`
        );
      }
      if (linkedDecretos) {
        parts.push(
          `Decretos: ${linkedDecretos.length} artículo(s) reglamentario(s)`
        );
      }
      article.concordancias = parts.join(". ");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(article, null, 2), "utf-8");
      enriched++;
    }
  }

  console.log(
    `\n[backfill] Complete! Enriched ${enriched}/${files.length} articles`
  );
  console.log(`  Articles with doctrina:       ${doctrinaIndex.size}`);
  console.log(`  Articles with jurisprudencia:  ${sentenciaIndex.size}`);
  console.log(`  Articles with decretos:        ${decretoIndex.size}`);
}

main().catch(console.error);
