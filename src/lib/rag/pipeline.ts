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

export interface PipelineResult {
  system: string;
  contextBlock: string;
  sources: SourceCitation[];
  context: AssembledContext;
}

export async function runRAGPipeline(
  query: string,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  // 1. Enhance query
  const enhancedQuery = await enhanceQuery(query, {
    useHyDE: options.useHyDE ?? RAG_CONFIG.useHyDE,
    useQueryExpansion: options.useQueryExpansion ?? RAG_CONFIG.useQueryExpansion,
  });

  // 2. Retrieve from Pinecone
  const retrievalResult = await retrieve(enhancedQuery, {
    libroFilter: options.libroFilter || undefined,
  });

  // 3. Rerank
  const reranked = heuristicRerank(retrievalResult.chunks, enhancedQuery);

  // 4. Assemble context
  const context = await assembleContext(reranked, {
    useSiblingRetrieval: options.useSiblingRetrieval ?? RAG_CONFIG.useSiblingRetrieval,
  });

  // 5. Build prompt
  const { system, contextBlock } = buildMessages(query, context);

  return {
    system,
    contextBlock,
    sources: context.sources,
    context,
  };
}
