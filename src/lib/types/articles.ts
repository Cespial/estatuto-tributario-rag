export type ArticleEstado = "vigente" | "modificado" | "derogado";

export interface ArticleIndexItem {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  libro_full: string;
  estado: ArticleEstado | string;
  total_mods: number;
  total_refs: number;
  total_referenced_by: number;
  complexity: number;
  has_normas: boolean;
  url: string;
}

export interface ArticleIndexEnrichedItem extends ArticleIndexItem {
  titulo_corto?: string;
  preview_snippet: string;
  ultima_modificacion_year: number | null;
  leyes_modificatorias: string[];
  leyes_modificatorias_normalized: string[];
  total_normas: number;
  texto_derogado_count: number;
  has_derogado_text: boolean;
  cross_references_valid_count: number;
  cross_references_invalid_count: number;
  referenced_by_valid_count: number;
}

export interface FacetCount {
  key: string;
  label: string;
  count: number;
}

export interface ExplorerFacets {
  total_articles: number;
  generated_at: string;
  libros: FacetCount[];
  estados: FacetCount[];
  mod_years: Array<{ year: number; count: number }>;
  laws: Array<{ key: string; label: string; count: number }>;
  has_mods_count: number;
  has_normas_count: number;
  has_derogado_text_count: number;
}

export interface FeaturedArticle {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  estado: string;
  total_mods: number;
  total_refs: number;
  total_referenced_by: number;
  complexity: number;
  ultima_modificacion_year: number | null;
  has_derogado_text: boolean;
  badges: string[];
  reason: string;
}

export interface FeaturedArticlesPayload {
  generated_at: string;
  mas_consultados: FeaturedArticle[];
  mas_modificados: FeaturedArticle[];
  esenciales_estudiantes: FeaturedArticle[];
}

export interface DashboardRangeMetrics {
  key: "historico" | "ultima_reforma" | "ultimos_12_meses";
  label: string;
  modified_articles: number;
  modified_percentage: number;
  with_normas: number;
  with_derogado_text: number;
  granularity: "year";
  note?: string;
}

export interface DashboardTimeSeriesPayload {
  generated_at: string;
  years: number[];
  latest_year: number;
  granularity_notice: string;
  ranges: DashboardRangeMetrics[];
  reform_timeline: Array<{
    year: number;
    total: number;
    laws: Array<{ name: string; count: number }>;
  }>;
  laws_totals: Array<{ name: string; count: number }>;
  article_modification_trends: Array<{
    slug: string;
    id: string;
    titulo: string;
    series: Array<{ year: number; count: number }>;
  }>;
}
