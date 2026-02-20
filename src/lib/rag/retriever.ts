import { getIndex } from "@/lib/pinecone/client";
import { embedQueries } from "@/lib/pinecone/embedder";
import { EnhancedQuery, RetrievalResult, PineconeNamespace } from "@/types/rag";
import { ScoredChunk, ChunkMetadata, ScoredMultiSourceChunk, MultiSourceChunkMetadata } from "@/types/pinecone";
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

  // Query Pinecone default namespace with each embedding in parallel
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

  // Dynamic threshold adjustment: use the top score of the first query result as anchor
  let dynamicThreshold = similarityThreshold;
  const firstResultMatches = results[0]?.matches || [];
  if (firstResultMatches.length > 0) {
    const topScore = firstResultMatches[0].score ?? 0;
    if (topScore > 0.75) dynamicThreshold = 0.35;
    else if (topScore < 0.60) dynamicThreshold = 0.25;
  }

  // Merge and dedup: keep max score per chunk ID
  const chunkMap = new Map<string, ScoredChunk>();

  for (const result of results) {
    for (const match of result.matches || []) {
      if (!match.metadata || (match.score ?? 0) < dynamicThreshold) continue;

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

  // Multi-namespace retrieval for external sources
  let multiSourceChunks: ScoredMultiSourceChunk[] | undefined;
  if (RAG_CONFIG.useMultiNamespace && RAG_CONFIG.additionalNamespaces.length > 0) {
    multiSourceChunks = await retrieveMultiNamespace(
      embeddings[0],
      RAG_CONFIG.additionalNamespaces,
      dynamicThreshold
    );
  }

  return { chunks, query, multiSourceChunks };
}

/**
 * Query additional Pinecone namespaces in parallel for external legal sources.
 */
async function retrieveMultiNamespace(
  vector: number[],
  namespaces: PineconeNamespace[],
  threshold: number
): Promise<ScoredMultiSourceChunk[]> {
  const index = getIndex();
  const topK = RAG_CONFIG.multiNamespaceTopK;

  const nsPromises = namespaces
    .filter((ns) => ns !== "")
    .map(async (ns) => {
      try {
        const nsIndex = index.namespace(ns);
        const result = await nsIndex.query({
          vector,
          topK,
          includeMetadata: true,
        });

        return (result.matches || [])
          .filter((m) => m.metadata && (m.score ?? 0) >= threshold)
          .map((m) => ({
            id: m.id,
            score: m.score ?? 0,
            metadata: m.metadata as unknown as MultiSourceChunkMetadata,
            namespace: ns,
          }));
      } catch (error) {
        console.error(`[retriever] Namespace "${ns}" query failed:`, error);
        return [];
      }
    });

  const allResults = await Promise.all(nsPromises);
  return allResults
    .flat()
    .sort((a, b) => b.score - a.score);
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
