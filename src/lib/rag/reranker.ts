import { EnhancedQuery, RerankedChunk } from "@/types/rag";
import { ScoredChunk } from "@/types/pinecone";
import { RAG_CONFIG } from "@/config/constants";

// Configurable boost values for heuristic reranking.
// These control how much each signal adjusts a chunk's relevance score.
const BOOST = {
  // Chunk type boosts: prefer content > modifications > old text
  chunkContenido: 0.15,
  chunkModificaciones: 0.10,
  chunkTextoAnterior: 0.05,
  // Direct article mention in query (e.g., "artículo 240")
  directArticleMention: 0.30,
  // Title word overlap with query (per word, capped at titleMatchMax)
  titleMatchPerWord: 0.05,
  titleMatchMax: 0.15,
  // Penalty for derogated text when not asking about history
  derogatedPenalty: -0.15,
  // Boost for derogated text when asking about history
  derogatedHistoryBoost: 0.20,
  // Prefer vigente articles for non-history queries
  vigenteBoost: 0.05,
  // Boost when query mentions a specific law and article was modified by it
  leyMatchBoost: 0.15,
  // Minor boost for complex articles (complexity >= 5)
  complexityBoost: 0.02,
} as const;

export function heuristicRerank(
  chunks: ScoredChunk[],
  query: EnhancedQuery,
  maxResults: number = RAG_CONFIG.maxRerankedResults
): RerankedChunk[] {
  const queryLower = query.original.toLowerCase();

  // Detect history-related queries with broader pattern matching
  const isHistoryQuery = /histor|evoluci[oó]n|anteri|derogad|cambio|modificac|reform|trayectoria/i.test(queryLower);

  // Detect if query mentions a specific law
  const leyMatch = queryLower.match(/ley\s+(\d+)/);
  const queryLey = leyMatch ? leyMatch[1] : null;

  const reranked: RerankedChunk[] = chunks.map((chunk) => {
    let boost = 0;
    const meta = chunk.metadata;

    // Boost by chunk type
    if (meta.chunk_type === "contenido") boost += BOOST.chunkContenido;
    else if (meta.chunk_type === "modificaciones") boost += BOOST.chunkModificaciones;
    else if (meta.chunk_type === "texto_anterior") boost += BOOST.chunkTextoAnterior;

    // Boost if article is directly mentioned in query
    for (const artId of query.detectedArticles) {
      if (meta.id_articulo === artId) {
        boost += BOOST.directArticleMention;
        break;
      }
    }

    // Boost if title terms match query
    const titleWords = meta.titulo.toLowerCase().split(/\s+/);
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);
    const titleMatches = queryWords.filter((w) => titleWords.some((tw) => tw.includes(w)));
    if (titleMatches.length > 0) {
      boost += Math.min(titleMatches.length * BOOST.titleMatchPerWord, BOOST.titleMatchMax);
    }

    // Penalize derogated content (unless asking about history)
    if (meta.chunk_type === "texto_anterior" && !isHistoryQuery) {
      boost += BOOST.derogatedPenalty;
    }

    // Boost derogated content for history queries
    if (isHistoryQuery && meta.chunk_type === "texto_anterior") {
      boost += BOOST.derogatedHistoryBoost;
    }

    // Boost vigente articles for non-history queries
    if (!isHistoryQuery && meta.estado === "vigente") {
      boost += BOOST.vigenteBoost;
    }

    // Boost when query mentions a specific ley and article was modified by it
    if (queryLey && meta.leyes_modificatorias) {
      const hasLey = meta.leyes_modificatorias.some(
        (l) => l.includes(`Ley ${queryLey}`)
      );
      if (hasLey) {
        boost += BOOST.leyMatchBoost;
      }
    }

    // Minor complexity factor: slightly prefer more complex articles
    if (meta.complexity_score && meta.complexity_score >= 5) {
      boost += BOOST.complexityBoost;
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
