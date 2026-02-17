import { EnhancedQuery, RerankedChunk } from "@/types/rag";
import { ScoredChunk } from "@/types/pinecone";
import { RAG_CONFIG } from "@/config/constants";

export function heuristicRerank(
  chunks: ScoredChunk[],
  query: EnhancedQuery,
  maxResults: number = RAG_CONFIG.maxRerankedResults
): RerankedChunk[] {
  const queryLower = query.original.toLowerCase();
  const isHistoryQuery = /histor|anteri|derogad|cambio|modificac/i.test(queryLower);

  // Detect if query mentions a specific law
  const leyMatch = queryLower.match(/ley\s+(\d+)/);
  const queryLey = leyMatch ? leyMatch[1] : null;

  const reranked: RerankedChunk[] = chunks.map((chunk) => {
    let boost = 0;
    const meta = chunk.metadata;

    // Boost by chunk type
    if (meta.chunk_type === "contenido") boost += 0.15;
    else if (meta.chunk_type === "modificaciones") boost += 0.10;
    else if (meta.chunk_type === "texto_anterior") boost += 0.05;

    // Boost if article is directly mentioned in query
    for (const artId of query.detectedArticles) {
      if (meta.id_articulo === artId) {
        boost += 0.30;
        break;
      }
    }

    // Boost if title terms match query
    const titleWords = meta.titulo.toLowerCase().split(/\s+/);
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);
    const titleMatches = queryWords.filter((w) => titleWords.some((tw) => tw.includes(w)));
    if (titleMatches.length > 0) {
      boost += Math.min(titleMatches.length * 0.05, 0.15);
    }

    // Penalize derogated content (unless asking about history)
    if (meta.chunk_type === "texto_anterior" && !isHistoryQuery) {
      boost -= 0.15;
    }

    // Boost derogated content for history queries
    if (isHistoryQuery && meta.chunk_type === "texto_anterior") {
      boost += 0.20;
    }

    // --- v2 enriched boosts ---

    // Boost vigente articles for non-history queries
    if (!isHistoryQuery && meta.estado === "vigente") {
      boost += 0.05;
    }

    // Boost when query mentions a specific ley and article was modified by it
    if (queryLey && meta.leyes_modificatorias) {
      const hasLey = meta.leyes_modificatorias.some(
        (l) => l.includes(`Ley ${queryLey}`)
      );
      if (hasLey) {
        boost += 0.15;
      }
    }

    // Minor complexity factor: slightly prefer more complex articles
    // as they tend to be more substantive
    if (meta.complexity_score && meta.complexity_score >= 5) {
      boost += 0.02;
    }

    return {
      ...chunk,
      rerankedScore: chunk.score + boost,
    };
  });

  return reranked
    .sort((a, b) => b.rerankedScore - a.rerankedScore)
    .slice(0, maxResults);
}
