/**
 * Phase 4 — Leyes Tributarias Scraper (Secretaría del Senado)
 *
 * Scrapes the full text of priority tax reform laws from secretariasenado.gov.co
 *
 * Usage: npx tsx scripts/scraping/scrapers/senado-leyes.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchHtml, stripHtml } from "../utils/html-fetcher";
import { createGovScraper } from "../utils/rate-limiter";
import { extractArticleRefs } from "../utils/regex-patterns";

const OUTPUT_DIR = path.resolve("data/scraped/leyes");

export interface LeyScraped {
  id: string;
  numero: string;
  year: number;
  titulo: string;
  textoCompleto: string;
  articulos: Array<{
    numero: string;
    texto: string;
    articulosETModificados: string[];
  }>;
  totalArticulos: number;
  articulosETAfectados: string[];
  fuenteUrl: string;
  fechaScraping: string;
}

// Priority tax laws with multiple source URLs for resilience
const PRIORITY_LAWS = [
  { numero: "2277", year: 2022, titulo: "Reforma Tributaria para la Igualdad", path: "ley_2277_2022" },
  { numero: "2155", year: 2021, titulo: "Inversión Social", path: "ley_2155_2021" },
  { numero: "2010", year: 2019, titulo: "Crecimiento Económico", path: "ley_2010_2019" },
  { numero: "1943", year: 2018, titulo: "Financiamiento (inexequible)", path: "ley_1943_2018" },
  { numero: "1819", year: 2016, titulo: "Reforma Tributaria Estructural", path: "ley_1819_2016" },
  { numero: "1739", year: 2014, titulo: "Impuesto a la Riqueza", path: "ley_1739_2014" },
  { numero: "1607", year: 2012, titulo: "Reforma Tributaria 2012", path: "ley_1607_2012" },
  { numero: "1430", year: 2010, titulo: "Normas Tributarias de Control", path: "ley_1430_2010" },
];

// Decreto 624/1989 (Estatuto Tributario original)
const ET_ORIGINAL = {
  numero: "624",
  year: 1989,
  titulo: "Estatuto Tributario (Decreto original)",
  path: "decreto_0624_1989",
};

// Build all possible source URLs for a law
function buildLawUrls(lawPath: string): string[] {
  return [
    // Primary: Senado
    `https://www.secretariasenado.gov.co/senado/basedoc/${lawPath}.html`,
    // Fallback: DIAN Normograma (for some laws)
    `https://normograma.dian.gov.co/dian/compilacion/docs/${lawPath}.htm`,
  ];
}

function parseLey(
  html: string,
  url: string,
  numero: string,
  year: number,
  titulo: string
): LeyScraped | null {
  const text = stripHtml(html);
  if (text.length < 100) return null;

  // Extract individual articles
  // Use a more specific regex: Case-sensitive "ARTÍCULO", sequential-looking numbers
  // and ensure it's at the start of a block/line if possible.
  const articulos: LeyScraped["articulos"] = [];
  const artRegex =
    /(?:^|\n)\s*ART[IÍ]CULO\s+(\d+)[°º.]?\s*([\s\S]*?)(?=(?:^|\n)\s*ART[IÍ]CULO\s+\d+|$)/g;

  let match;
  while ((match = artRegex.exec(text)) !== null) {
    const artNum = match[1];
    const artText = match[2].trim();

    if (artText.length < 10) continue;

    const etRefs = extractArticleRefs(artText);

    articulos.push({
      numero: artNum,
      texto: artText.slice(0, 10000),
      articulosETModificados: etRefs,
    });
  }

  // Collect all ET articles affected
  const allETRefs = new Set<string>();
  for (const art of articulos) {
    for (const ref of art.articulosETModificados) {
      allETRefs.add(ref);
    }
  }

  return {
    id: `ley-${numero}-${year}`,
    numero,
    year,
    titulo,
    textoCompleto: text.slice(0, 200000), // Cap at 200K chars
    articulos,
    totalArticulos: articulos.length,
    articulosETAfectados: Array.from(allETRefs),
    fuenteUrl: url,
    fechaScraping: new Date().toISOString(),
  };
}

async function main() {
  console.log("[senado-leyes] Starting tax law scraper...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const limiter = createGovScraper();
  const allLaws = [...PRIORITY_LAWS, ET_ORIGINAL];

  let successCount = 0;
  let failCount = 0;

  for (const law of allLaws) {
    const outputPath = path.join(OUTPUT_DIR, `ley-${law.numero}-${law.year}.json`);

    if (fs.existsSync(outputPath)) {
      console.log(`[senado-leyes] Skipping Ley ${law.numero}/${law.year} (already scraped)`);
      successCount++;
      continue;
    }

    const urls = buildLawUrls(law.path);
    let scraped = false;

    for (const url of urls) {
      console.log(`[senado-leyes] Fetching: ${law.titulo} (${url})`);

      try {
        // Normograma uses ISO-8859-1, Senado uses Latin-1 (auto-detected)
        const isNormograma = url.includes("normograma");
        const { html } = await limiter.execute(() =>
          fetchHtml(url, {
            timeout: 60000,
            ...(isNormograma ? { encoding: "iso-8859-1" as const } : {}),
          })
        );

        const parsed = parseLey(html, url, law.numero, law.year, law.titulo);

        if (parsed && parsed.totalArticulos > 0) {
          fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), "utf-8");
          console.log(
            `[senado-leyes] Saved: Ley ${law.numero}/${law.year} — ${parsed.totalArticulos} articles, ${parsed.articulosETAfectados.length} ET refs`
          );
          scraped = true;
          successCount++;
          break;
        } else {
          console.warn(`[senado-leyes] Could not parse from ${url}`);
        }
      } catch (error) {
        console.warn(
          `[senado-leyes] Failed from ${url}:`,
          (error as Error).message
        );
      }
    }

    if (!scraped) {
      failCount++;
      console.error(`[senado-leyes] All sources failed for Ley ${law.numero}/${law.year}`);
    }
  }

  console.log(`\n[senado-leyes] Complete! ${successCount} scraped, ${failCount} failed`);
}

main().catch(console.error);
