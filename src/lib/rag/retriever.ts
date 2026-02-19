import { getIndex } from "@/lib/pinecone/client";
import { embedQueries } from "@/lib/pinecone/embedder";
import { EnhancedQuery, RetrievalResult } from "@/types/rag";
import { ScoredChunk, ChunkMetadata } from "@/types/pinecone";
import { RAG_CONFIG } from "@/config/constants";
import { ChatPageContext } from "@/types/chat-history";

interface RetrieveOptions {
  topK?: number;
  similarityThreshold?: number;
  libroFilter?: string;
  pageContext?: ChatPageContext;
}

export async function retrieve(
  query: EnhancedQuery,
  options: RetrieveOptions = {}
): Promise<RetrievalResult> {
  const {
    similarityThreshold = RAG_CONFIG.similarityThreshold,
  } = options;

  const topK = determineTopK(query, options.topK);
  const filter = buildFilter(query, options.libroFilter, options.pageContext);

  // Build all query texts for parallel embedding
  const queryTexts: string[] = [query.original];
  if (query.rewritten !== query.original) {
    queryTexts.push(query.rewritten);
  }
  if (query.hyde) {
    queryTexts.push(query.hyde);
  }
  if (query.subQueries?.length) {
    queryTexts.push(...query.subQueries);
  }

  // Embed all queries in parallel
  const embeddings = await embedQueries(queryTexts);

  // Query Pinecone with each embedding in parallel
  const index = getIndex();
  const queryPromises = embeddings.map((vector) =>
    index.query({
      vector,
      topK,
      includeMetadata: true,
      filter: filter || undefined,
    })
  );

  // If specific articles detected, also fetch by metadata
  if (query.detectedArticles.length > 0) {
    for (const artId of query.detectedArticles) {
      queryPromises.push(
        index.query({
          vector: embeddings[0],
          topK: 25,
          includeMetadata: true,
          filter: { id_articulo: { $eq: artId } },
        })
      );
    }
  }

  const results = await Promise.all(queryPromises);

  // Merge and dedup: keep max score per chunk ID
  const chunkMap = new Map<string, ScoredChunk>();

  for (const result of results) {
    for (const match of result.matches || []) {
      if (!match.metadata || (match.score ?? 0) < similarityThreshold) continue;

      const existing = chunkMap.get(match.id);
      const score = match.score ?? 0;

      if (!existing || score > existing.score) {
        chunkMap.set(match.id, {
          id: match.id,
          score,
          metadata: match.metadata as unknown as ChunkMetadata,
        });
      }
    }
  }

  // Sort by score descending
  const chunks = Array.from(chunkMap.values()).sort(
    (a, b) => b.score - a.score
  );

  return { chunks, query };
}

function determineTopK(query: EnhancedQuery, override?: number): number {
  if (override) return override;
  if (query.detectedArticles.length > 0) return 25;
  if (query.subQueries && query.subQueries.length > 1) return 20;
  return RAG_CONFIG.topK;
}

function buildFilter(
  query: EnhancedQuery,
  libroFilter?: string,
  pageContext?: ChatPageContext
): Record<string, unknown> | null {
  const conditions: Record<string, unknown>[] = [];

  if (libroFilter) {
    conditions.push({ categoria_libro: { $eq: libroFilter } });
  } else if (query.detectedLibro) {
    conditions.push({ categoria_libro: { $eq: query.detectedLibro } });
  } else if (pageContext?.module === "tablas-retencion") {
    conditions.push({ categoria_libro: { $eq: "II - Retención en la Fuente" } });
  } else if (pageContext?.module === "calculadora" && pageContext.calculatorSlug?.includes("renta")) {
    conditions.push({
      categoria_libro: { $eq: "I - Impuesto sobre la Renta y Complementarios" },
    });
  } else if (
    pageContext?.module === "calculadora" &&
    pageContext.calculatorSlug?.includes("retencion")
  ) {
    conditions.push({ categoria_libro: { $eq: "II - Retención en la Fuente" } });
  }

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}
