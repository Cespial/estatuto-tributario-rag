import { RAGConfig } from "@/types/rag";

export const RAG_CONFIG: RAGConfig = {
  topK: 15,
  similarityThreshold: 0.35,
  maxContextTokens: 6000,
  maxRerankedResults: 8,
  useHyDE: true,
  useLLMRerank: false,
  useQueryExpansion: true,
  useSiblingRetrieval: true,
};

export const EMBEDDING_MODEL = "multilingual-e5-large";
export const EMBEDDING_DIMS = 1024;

export const PINECONE_HOST = "https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io";

export const SUGGESTED_QUESTIONS = [
  "¿Cuál es la tarifa del impuesto de renta para personas jurídicas?",
  "¿Qué bienes están exentos de IVA?",
  "¿Cuál es la sanción por no declarar renta?",
  "¿Cómo se calcula la retención en la fuente por salarios?",
];
