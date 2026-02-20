// Shared types for knowledge graph extraction and metrics

export interface NormReference {
  tipo: string;
  numero: string;
  year: number;
  articulo?: string;
}

export interface ArticleEntity {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  estado: string;
  complexity: number;
}

export interface LawEntity {
  tipo: string;
  numero: string;
  year: number;
  titulo?: string;
}

export interface DecreeEntity {
  tipo: string;
  numero: string;
  year: number;
}

export interface SentenceEntity {
  tipo: string;
  numero: string;
  year: number;
}

export interface ConceptEntity {
  numero: string;
  year: number;
}

export interface ResolutionEntity {
  numero: string;
  year: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type:
    | "modificado_por"
    | "interpretado_por"
    | "reglamentado_por"
    | "referencia"
    | "referenciado_por"
    | "analizado_por"
    | "citado_en";
  year?: number;
}

export interface GraphSeed {
  entities: {
    articles: Record<string, ArticleEntity>;
    laws: Record<string, LawEntity>;
    decrees: Record<string, DecreeEntity>;
    sentences: Record<string, SentenceEntity>;
    concepts: Record<string, ConceptEntity>;
    resolutions: Record<string, ResolutionEntity>;
  };
  edges: GraphEdge[];
  stats: {
    totalArticles: number;
    totalLaws: number;
    totalDecrees: number;
    totalSentences: number;
    totalConcepts: number;
    totalResolutions: number;
    totalEdges: number;
  };
}

export interface GraphMetrics {
  nodes: Record<
    string,
    {
      pagerank: number;
      betweenness: number;
      communityId: number;
      degreeIn: number;
      degreeOut: number;
    }
  >;
  communities: Record<number, string[]>;
  stats: {
    totalNodes: number;
    totalEdges: number;
    totalCommunities: number;
    avgPagerank: number;
    topArticlesByPagerank: Array<{ id: string; pagerank: number }>;
    topArticlesByBetweenness: Array<{ id: string; betweenness: number }>;
  };
}

// Article JSON schema (as stored in public/data/articles/*.json)
export interface ArticleJSON {
  id_articulo: string;
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;
  libro_full: string;
  estado: string;
  complexity_score: number;
  contenido_texto: string;
  contenido_html: string;
  modificaciones_raw: string;
  modificaciones_parsed: Array<{
    tipo: string;
    norma_tipo: string;
    norma_numero: string;
    norma_year: number;
    norma_articulo?: string;
  }>;
  total_modificaciones: number;
  ultima_modificacion_year: number | null;
  leyes_modificatorias: string[];
  texto_derogado: string[];
  texto_derogado_parsed: Array<{
    index: number;
    snippet: string;
    full_length: number;
  }>;
  normas_parsed: {
    jurisprudencia: string[];
    decretos: string[];
    doctrina_dian: string[];
    notas: string[];
    otros: string[];
  };
  total_normas: number;
  cross_references: string[];
  referenced_by: string[];
  total_cross_references: number;
  concordancias: string;
  doctrina_dian_scrape: string;
  notas_editoriales: string;
}
