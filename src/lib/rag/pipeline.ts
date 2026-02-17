import { enhanceQuery } from "./query-enhancer";
import { retrieve } from "./retriever";
import { heuristicRerank } from "./reranker";
import { assembleContext } from "./context-assembler";
import { buildMessages } from "./prompt-builder";
import { AssembledContext, SourceCitation } from "@/types/rag";
import { RAG_CONFIG } from "@/config/constants";

export interface PipelineOptions {
  libroFilter?: string;
  useHyDE?: boolean;
  useLLMRerank?: boolean;
  useQueryExpansion?: boolean;
  useSiblingRetrieval?: boolean;
}

export interface DebugInfo {
  chunksRetrieved: number;
  tokensUsed: number;
  queryEnhanced: boolean;
}

export interface PipelineResult {
  system: string;
  contextBlock: string;
  sources: SourceCitation[];
  context: AssembledContext;
  debugInfo: DebugInfo;
}

export async function runRAGPipeline(
  query: string,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  // 1. Enhance query
  let enhancedQuery;
  try {
    enhancedQuery = await enhanceQuery(query, {
      useHyDE: options.useHyDE ?? RAG_CONFIG.useHyDE,
      useQueryExpansion: options.useQueryExpansion ?? RAG_CONFIG.useQueryExpansion,
    });
  } catch (error) {
    console.error("[rag-pipeline] Query enhancement failed, using raw query:", error);
    enhancedQuery = {
      original: query,
      rewritten: query,
      detectedArticles: [],
    };
  }

  // 2. Retrieve from Pinecone
  let retrievalResult;
  try {
    retrievalResult = await retrieve(enhancedQuery, {
      libroFilter: options.libroFilter || undefined,
    });
  } catch (error) {
    console.error("[rag-pipeline] Retrieval failed:", error);
    throw new Error("No se pudieron recuperar los artículos relevantes.");
  }

  // 3. Rerank
  const reranked = heuristicRerank(retrievalResult.chunks, enhancedQuery);

  // 4. Assemble context
  let context;
  try {
    context = await assembleContext(reranked, {
      useSiblingRetrieval: options.useSiblingRetrieval ?? RAG_CONFIG.useSiblingRetrieval,
    });
  } catch (error) {
    console.error("[rag-pipeline] Context assembly failed:", error);
    throw new Error("Error al ensamblar el contexto de respuesta.");
  }

  // 5. Build prompt
  const { system, contextBlock } = buildMessages(query, context);

  return {
    system,
    contextBlock,
    sources: context.sources,
    context,
    debugInfo: {
      chunksRetrieved: retrievalResult.chunks.length,
      tokensUsed: context.totalTokensEstimate,
      queryEnhanced: enhancedQuery.rewritten !== query,
    },
  };
}
