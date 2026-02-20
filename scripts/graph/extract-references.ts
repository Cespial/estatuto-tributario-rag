/**
 * Phase 0.1 — Extract references from existing article data to build a graph seed.
 *
 * Reads 1,294 article JSONs and extracts all legal references (laws, decrees,
 * sentences, concepts, resolutions) using regex patterns + parsed fields.
 *
 * Output: public/data/graph-seed.json
 *
 * Usage: npx tsx scripts/graph/extract-references.ts
 */

import * as fs from "fs";
import * as path from "path";
import {
  ArticleJSON,
  GraphSeed,
  GraphEdge,
  ArticleEntity,
  LawEntity,
  DecreeEntity,
  SentenceEntity,
  ConceptEntity,
  ResolutionEntity,
} from "./types";
import {
  extractLaws,
  extractDecrees,
  extractSentences,
  extractConcepts,
  extractResolutions,
  extractOficios,
  extractArticleRefs,
} from "../scraping/utils/regex-patterns";

const ARTICLES_DIR = path.resolve("public/data/articles");
const OUTPUT_PATH = path.resolve("public/data/graph-seed.json");

function loadArticles(): ArticleJSON[] {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"));
  console.log(`[extract-references] Loading ${files.length} article files...`);

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf-8");
    return JSON.parse(raw) as ArticleJSON;
  });
}

function buildGraphSeed(articles: ArticleJSON[]): GraphSeed {
  const articleEntities: Record<string, ArticleEntity> = {};
  const laws: Record<string, LawEntity> = {};
  const decrees: Record<string, DecreeEntity> = {};
  const sentences: Record<string, SentenceEntity> = {};
  const concepts: Record<string, ConceptEntity> = {};
  const resolutions: Record<string, ResolutionEntity> = {};
  const edges: GraphEdge[] = [];

  for (const art of articles) {
    const artKey = `art-${art.slug}`;

    // Register article entity
    articleEntities[art.slug] = {
      id: artKey,
      slug: art.slug,
      titulo: art.titulo_corto || art.titulo,
      libro: art.libro,
      estado: art.estado,
      complexity: art.complexity_score,
    };

    // Combine all text for regex scanning
    const allText = [
      art.contenido_texto,
      art.contenido_html,
      art.modificaciones_raw,
      ...(art.normas_parsed?.jurisprudencia || []),
      ...(art.normas_parsed?.decretos || []),
      ...(art.normas_parsed?.doctrina_dian || []),
      ...(art.normas_parsed?.notas || []),
      ...(art.normas_parsed?.otros || []),
      art.concordancias,
      art.doctrina_dian_scrape,
      art.notas_editoriales,
    ]
      .filter(Boolean)
      .join("\n");

    // --- Extract from parsed fields first (more reliable) ---

    // 1. Modificaciones parsed → laws that modified this article
    for (const mod of art.modificaciones_parsed || []) {
      const lawKey = `Ley-${mod.norma_numero}-${mod.norma_year}`;
      if (!laws[lawKey]) {
        laws[lawKey] = {
          tipo: mod.norma_tipo,
          numero: mod.norma_numero,
          year: mod.norma_year,
        };
      }
      edges.push({
        source: artKey,
        target: lawKey,
        type: "modificado_por",
        year: mod.norma_year,
      });
    }

    // 2. Leyes modificatorias (flat list, also add as laws)
    for (const leyStr of art.leyes_modificatorias || []) {
      const match = leyStr.match(/Ley\s+(\d+)\s+de\s+(\d{4})/i);
      if (match) {
        const lawKey = `Ley-${match[1]}-${match[2]}`;
        if (!laws[lawKey]) {
          laws[lawKey] = {
            tipo: "Ley",
            numero: match[1],
            year: parseInt(match[2], 10),
          };
        }
        // Edge already added via modificaciones_parsed, avoid dups
      }
    }

    // 3. Cross references (article → article)
    for (const refSlug of art.cross_references || []) {
      edges.push({
        source: artKey,
        target: `art-${refSlug}`,
        type: "referencia",
      });
    }

    // 4. Referenced by (article ← article)
    for (const refSlug of art.referenced_by || []) {
      edges.push({
        source: `art-${refSlug}`,
        target: artKey,
        type: "referencia",
      });
    }

    // --- Regex extraction from all text ---

    // 5. Laws from text
    for (const law of extractLaws(allText)) {
      if (!laws[law.key]) {
        laws[law.key] = { tipo: law.tipo, numero: law.numero, year: law.year };
      }
    }

    // 6. Decrees from text
    for (const decree of extractDecrees(allText)) {
      if (!decrees[decree.key]) {
        decrees[decree.key] = {
          tipo: decree.tipo,
          numero: decree.numero,
          year: decree.year,
        };
      }
      edges.push({
        source: artKey,
        target: decree.key,
        type: "reglamentado_por",
        year: decree.year,
      });
    }

    // 7. Sentences from text
    for (const sent of extractSentences(allText)) {
      if (!sentences[sent.key]) {
        sentences[sent.key] = {
          tipo: sent.tipo,
          numero: sent.numero,
          year: sent.year,
        };
      }
      edges.push({
        source: artKey,
        target: sent.key,
        type: "interpretado_por",
        year: sent.year,
      });
    }

    // 8. Concepts from text
    for (const concept of extractConcepts(allText)) {
      if (!concepts[concept.key]) {
        concepts[concept.key] = {
          numero: concept.numero,
          year: concept.year,
        };
      }
      edges.push({
        source: artKey,
        target: concept.key,
        type: "interpretado_por",
        year: concept.year,
      });
    }

    // 9. Resolutions from text
    for (const res of extractResolutions(allText)) {
      if (!resolutions[res.key]) {
        resolutions[res.key] = { numero: res.numero, year: res.year };
      }
      edges.push({
        source: artKey,
        target: res.key,
        type: "reglamentado_por",
        year: res.year,
      });
    }

    // 10. Oficios (treat as concepts)
    for (const oficio of extractOficios(allText)) {
      const conceptKey = `Oficio-${oficio.numero}-${oficio.year}`;
      if (!concepts[conceptKey]) {
        concepts[conceptKey] = { numero: oficio.numero, year: oficio.year };
      }
      edges.push({
        source: artKey,
        target: conceptKey,
        type: "interpretado_por",
        year: oficio.year,
      });
    }

    // 11. Article references from body text (regex-extracted)
    const bodyArticleRefs = extractArticleRefs(art.contenido_texto || "");
    for (const refSlug of bodyArticleRefs) {
      // Avoid self-references and duplicates with cross_references
      if (
        refSlug !== art.slug &&
        !(art.cross_references || []).includes(refSlug)
      ) {
        edges.push({
          source: artKey,
          target: `art-${refSlug}`,
          type: "referencia",
        });
      }
    }
  }

  // Deduplicate edges
  const edgeSet = new Set<string>();
  const dedupedEdges: GraphEdge[] = [];
  for (const edge of edges) {
    const edgeKey = `${edge.source}|${edge.target}|${edge.type}`;
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      dedupedEdges.push(edge);
    }
  }

  return {
    entities: {
      articles: articleEntities,
      laws,
      decrees,
      sentences,
      concepts,
      resolutions,
    },
    edges: dedupedEdges,
    stats: {
      totalArticles: Object.keys(articleEntities).length,
      totalLaws: Object.keys(laws).length,
      totalDecrees: Object.keys(decrees).length,
      totalSentences: Object.keys(sentences).length,
      totalConcepts: Object.keys(concepts).length,
      totalResolutions: Object.keys(resolutions).length,
      totalEdges: dedupedEdges.length,
    },
  };
}

function main() {
  console.log("[extract-references] Starting graph seed extraction...");

  const articles = loadArticles();
  const seed = buildGraphSeed(articles);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(seed, null, 2), "utf-8");

  console.log("\n=== Graph Seed Stats ===");
  console.log(`Articles:    ${seed.stats.totalArticles}`);
  console.log(`Laws:        ${seed.stats.totalLaws}`);
  console.log(`Decrees:     ${seed.stats.totalDecrees}`);
  console.log(`Sentences:   ${seed.stats.totalSentences}`);
  console.log(`Concepts:    ${seed.stats.totalConcepts}`);
  console.log(`Resolutions: ${seed.stats.totalResolutions}`);
  console.log(`Edges:       ${seed.stats.totalEdges}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
}

main();
