import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const DATA_DIR = path.join(ROOT, "public", "data");
const INDEX_PATH = path.join(DATA_DIR, "articles-index.json");
const ENRICHED_INDEX_PATH = path.join(DATA_DIR, "articles-index.enriched.json");
const ARTICLES_DIR = path.join(DATA_DIR, "articles");

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function main() {
  const [index, enriched] = await Promise.all([
    loadJson(INDEX_PATH),
    loadJson(ENRICHED_INDEX_PATH),
  ]);

  const articleFiles = (await readdir(ARTICLES_DIR)).filter((file) =>
    file.endsWith(".json")
  );
  const articleFileSet = new Set(articleFiles);
  const slugSet = new Set(index.map((item) => item.slug));
  const indexBySlug = new Map(index.map((item) => [item.slug, item]));

  let invalidCrossRefs = 0;
  let missingArticleFiles = 0;
  let mismatchedCounters = 0;

  for (const file of articleFiles) {
    const article = await loadJson(path.join(ARTICLES_DIR, file));
    const idx = indexBySlug.get(article.slug);
    if (!idx) continue;

    const crossRefs = Array.isArray(article.cross_references)
      ? article.cross_references
      : [];

    invalidCrossRefs += crossRefs.filter((slug) => !slugSet.has(slug)).length;

    if (idx.total_mods !== Number(article.total_modificaciones || 0)) {
      mismatchedCounters += 1;
    }
  }

  for (const item of index) {
    if (!articleFileSet.has(`${item.slug}.json`)) {
      missingArticleFiles += 1;
    }
  }

  if (enriched.length !== index.length) {
    throw new Error(
      `articles-index.enriched length mismatch: expected ${index.length}, got ${enriched.length}`
    );
  }

  process.stdout.write(
    [
      `articles-index count: ${index.length}`,
      `articles-index.enriched count: ${enriched.length}`,
      `missing article files: ${missingArticleFiles}`,
      `invalid cross-references: ${invalidCrossRefs}`,
      `mismatched counters: ${mismatchedCounters}`,
    ].join("\n") + "\n"
  );

  if (missingArticleFiles > 0 || mismatchedCounters > 0) {
    throw new Error("Data integrity checks failed.");
  }
}

main().catch((error) => {
  process.stderr.write(`verify-data-integrity failed: ${error.stack || error}\n`);
  process.exit(1);
});
