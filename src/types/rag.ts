import { ScoredChunk } from "./pinecone";

export interface EnhancedQuery {
  original: string;
  rewritten: string;
  hyde?: string;
  subQueries?: string[];
  detectedArticles: string[];
  detectedLibro?: string;
}

export interface RetrievalResult {
  chunks: ScoredChunk[];
  query: EnhancedQuery;
}

export interface RerankedChunk extends ScoredChunk {
  rerankedScore: number;
}

export interface ArticleGroup {
  idArticulo: string;
  titulo: string;
  categoriaLibro: string;
  categoriaTitulo: string;
  urlOrigen: string;
  contenido: string[];
  modificaciones: string[];
  textoAnterior: string[];
  maxScore: number;
}

export interface AssembledContext {
  articles: ArticleGroup[];
  sources: SourceCitation[];
  totalTokensEstimate: number;
}

export interface SourceCitation {
  idArticulo: string;
  titulo: string;
  url: string;
  categoriaLibro: string;
  relevanceScore: number;
}

export interface RAGConfig {
  topK: number;
  similarityThreshold: number;
  maxContextTokens: number;
  maxRerankedResults: number;
  useHyDE: boolean;
  useLLMRerank: boolean;
  useQueryExpansion: boolean;
  useSiblingRetrieval: boolean;
}
