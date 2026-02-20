import { EnhancedQuery, RerankedChunk, RerankedMultiSourceChunk } from "@/types/rag";
import { ScoredChunk, ScoredMultiSourceChunk } from "@/types/pinecone";
import { RAG_CONFIG, MULTI_SOURCE_BOOST } from "@/config/constants";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

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

export async function llmRerank(
  chunks: RerankedChunk[],
  query: string
): Promise<RerankedChunk[]> {
  if (chunks.length <= 1) return chunks;

  // We only rerank the top 8 chunks to save tokens and time
  const candidates = chunks.slice(0, 8);
  const remaining = chunks.slice(8);

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system:
        "Eres un experto legal analizando el Estatuto Tributario colombiano. " +
        "Tu tarea es ordenar los siguientes fragmentos de artículos del más relevante al menos relevante para responder la consulta del usuario. " +
        "Responde SOLAMENTE con una lista de IDs separados por comas, sin explicaciones. " +
        "IDs disponibles: " +
        candidates.map((c) => c.id).join(", "),
      prompt: `Consulta: ${query}\n\nFragmentos:\n${candidates
        .map((c) => `[ID: ${c.id}] Art. ${c.metadata.id_articulo}: ${c.metadata.text.slice(0, 400)}`)
        .join("\n\n")}`,
    });

    const orderedIds = text
      .split(",")
      .map((id) => id.trim())
      .filter((id) => candidates.some((c) => c.id === id));

    const rerankedCandidates = orderedIds
      .map((id) => candidates.find((c) => c.id === id)!)
      .concat(candidates.filter((c) => !orderedIds.includes(c.id)));

    return [...rerankedCandidates, ...remaining];
  } catch (error) {
    console.error("[reranker] llmRerank failed:", error);
    return chunks;
  }
}

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

/**
 * Rerank multi-source chunks (doctrina, jurisprudencia, decretos, resoluciones)
 * using graph boost signals and source-type heuristics.
 */
export function heuristicRerankMultiSource(
  chunks: ScoredMultiSourceChunk[],
  query: EnhancedQuery,
  maxResults: number = 5
): RerankedMultiSourceChunk[] {
  const currentYear = new Date().getFullYear();

  const reranked: RerankedMultiSourceChunk[] = chunks.map((chunk) => {
    let boost = 0;
    const meta = chunk.metadata;

    // Graph-based boosts
    if (meta.pagerank && meta.pagerank > 0.01) {
      boost += MULTI_SOURCE_BOOST.pagerankHigh;
    }

    // Doctrina boosts
    if (meta.doc_type === "doctrina") {
      if (meta.vigente) {
        boost += MULTI_SOURCE_BOOST.doctrinaVigente;
      } else {
        boost += MULTI_SOURCE_BOOST.doctrinaRevocada;
      }
    }

    // Jurisprudencia boosts
    if (meta.doc_type === "sentencia") {
      const tipo = meta.tipo?.toUpperCase();
      if (tipo === "SU") {
        boost += MULTI_SOURCE_BOOST.sentenciaUnificacion;
      } else if (tipo === "C") {
        boost += MULTI_SOURCE_BOOST.sentenciaC;
      }

      // Penalize old sentencias (> 10 years)
      if (meta.fecha) {
        const sentYear = parseInt(meta.fecha.slice(0, 4), 10);
        if (currentYear - sentYear > 10) {
          boost += MULTI_SOURCE_BOOST.sentenciaAntigua;
        }
      }
    }

    // Decreto boosts (recent decrees preferred)
    if (meta.doc_type === "decreto" && meta.decreto_year) {
      if (currentYear - meta.decreto_year < 3) {
        boost += MULTI_SOURCE_BOOST.decretoReciente;
      }
    }

    // Boost if chunk references articles detected in query
    if (query.detectedArticles.length > 0 && meta.articulos_slugs) {
      const overlap = query.detectedArticles.filter((art) => {
        const slug = art.replace(/^Art\.\s*/, "");
        return meta.articulos_slugs.includes(slug);
      });
      if (overlap.length > 0) {
        boost += 0.15;
      }
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
