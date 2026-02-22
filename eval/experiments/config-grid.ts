import { RAGConfig } from "@/types/rag";

export interface ExperimentConfig {
  name: string;
  description: string;
  ragConfig: Partial<RAGConfig>;
  promptVariant: string;
}

export const EXPERIMENT_GRID: ExperimentConfig[] = [
  // Baseline
  {
    name: "baseline",
    description: "Default configuration",
    ragConfig: {},
    promptVariant: "default",
  },

  // Top-K variations
  {
    name: "topk-5",
    description: "Reduced top_k = 5",
    ragConfig: { topK: 5, maxRerankedResults: 4 },
    promptVariant: "default",
  },
  {
    name: "topk-10",
    description: "top_k = 10",
    ragConfig: { topK: 10, maxRerankedResults: 6 },
    promptVariant: "default",
  },
  {
    name: "topk-25",
    description: "Increased top_k = 25",
    ragConfig: { topK: 25, maxRerankedResults: 10 },
    promptVariant: "default",
  },

  // Prompt variants
  {
    name: "prompt-detailed",
    description: "Detailed prompt variant",
    ragConfig: {},
    promptVariant: "detailed",
  },
  {
    name: "prompt-concise",
    description: "Concise prompt variant",
    ragConfig: {},
    promptVariant: "concise",
  },
  {
    name: "prompt-educational",
    description: "Educational prompt variant",
    ragConfig: {},
    promptVariant: "educational",
  },
  {
    name: "prompt-strict",
    description: "Strict legal prompt variant",
    ragConfig: {},
    promptVariant: "strict_legal",
  },

  // Feature toggles
  {
    name: "no-hyde",
    description: "Disable HyDE",
    ragConfig: { useHyDE: false },
    promptVariant: "default",
  },
  {
    name: "no-expansion",
    description: "Disable query expansion",
    ragConfig: { useQueryExpansion: false },
    promptVariant: "default",
  },
  {
    name: "no-siblings",
    description: "Disable sibling retrieval",
    ragConfig: { useSiblingRetrieval: false },
    promptVariant: "default",
  },
  {
    name: "no-hyde-no-expansion",
    description: "Disable both HyDE and query expansion",
    ragConfig: { useHyDE: false, useQueryExpansion: false },
    promptVariant: "default",
  },

  // Metadata filter experiments
  {
    name: "filter-contenido-only",
    description: "Only retrieve contenido chunks",
    ragConfig: {},
    promptVariant: "default",
  },
  {
    name: "filter-with-modifications",
    description: "Include modifications in retrieval",
    ragConfig: {},
    promptVariant: "default",
  },

  // Reranking
  {
    name: "rerank-llm",
    description: "LLM-based reranking (Haiku)",
    ragConfig: { useLLMRerank: true },
    promptVariant: "default",
  },

  // Threshold variations
  {
    name: "threshold-low",
    description: "Lower similarity threshold (0.22)",
    ragConfig: { similarityThreshold: 0.22 },
    promptVariant: "default",
  },
  {
    name: "threshold-high",
    description: "Higher similarity threshold (0.45)",
    ragConfig: { similarityThreshold: 0.45 },
    promptVariant: "default",
  },

  // Context budget variations
  {
    name: "context-10k",
    description: "Larger context budget (10000 tokens)",
    ragConfig: { maxContextTokens: 10000 },
    promptVariant: "default",
  },
  {
    name: "context-5k",
    description: "Smaller context budget (5000 tokens)",
    ragConfig: { maxContextTokens: 5000 },
    promptVariant: "default",
  },

  // Optimized combination (Phase 1-6 improvements)
  {
    name: "optimized-v2",
    description: "All Phase 1-6 optimizations applied",
    ragConfig: {
      topK: 15,
      similarityThreshold: 0.30,
      maxContextTokens: 8000,
      maxRerankedResults: 8,
      useHyDE: true,
      useQueryExpansion: true,
      useSiblingRetrieval: true,
      useMultiNamespace: true,
      externalSourceBudgetRatio: 0.30,
    },
    promptVariant: "default",
  },

  // Aggressive retrieval
  {
    name: "aggressive-retrieval",
    description: "More aggressive retrieval: higher topK, lower threshold, bigger context",
    ragConfig: {
      topK: 25,
      similarityThreshold: 0.22,
      maxContextTokens: 10000,
      maxRerankedResults: 12,
    },
    promptVariant: "default",
  },

  // LLM rerank with optimizations
  {
    name: "optimized-llm-rerank",
    description: "Optimized config + LLM reranking",
    ragConfig: {
      topK: 15,
      similarityThreshold: 0.30,
      maxContextTokens: 8000,
      useLLMRerank: true,
      externalSourceBudgetRatio: 0.30,
    },
    promptVariant: "default",
  },
];
