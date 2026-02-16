export interface ChunkMetadata {
  id_articulo: string;
  titulo: string;
  categoria_libro: string;
  categoria_titulo: string;
  chunk_type: "contenido" | "modificaciones" | "texto_anterior";
  chunk_index: number;
  total_chunks: number;
  has_modifications: boolean;
  has_derogated_text: boolean;
  url_origen: string;
  text: string;
}

export interface ScoredChunk {
  id: string;
  score: number;
  metadata: ChunkMetadata;
}
