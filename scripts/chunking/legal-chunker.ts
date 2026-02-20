/**
 * Phase 5 — Legal Chunker
 *
 * Intelligent chunking for Colombian legal text that respects document structure:
 * - Never cuts mid-paragraph, mid-numeral, mid-literal
 * - Chunk size: 500-800 tokens
 * - Overlap: 100 tokens (last paragraph of previous chunk)
 * - Respects hierarchy: Artículo > Parágrafo > Numeral > Literal > Inciso
 */

export interface LegalChunk {
  text: string;
  index: number;
  totalChunks: number;
  metadata: Record<string, unknown>;
}

export interface ChunkOptions {
  /** Target chunk size in tokens (default: 600) */
  targetTokens?: number;
  /** Maximum chunk size in tokens (default: 800) */
  maxTokens?: number;
  /** Overlap in tokens (default: 100) */
  overlapTokens?: number;
}

// Approximate: 1 token ≈ 4 characters for Spanish legal text
const CHARS_PER_TOKEN = 4;

/**
 * Legal boundary patterns, ordered by hierarchy (highest priority first).
 */
const BOUNDARY_PATTERNS = [
  // Artículo boundary
  /(?=ART[IÍ]CULO\s+\d)/i,
  // Parágrafo boundary
  /(?=PAR[AÁ]GRAFO\s+(?:TRANSITORIO\s+)?\d)/i,
  /(?=Par[aá]grafo\s+(?:transitorio\s+)?\d)/,
  // Numeral boundary
  /(?=\n\s*\d+\.\s+)/,
  // Literal boundary
  /(?=\n\s*[a-z]\)\s+)/,
  /(?=\n\s*[a-z]\.\s+)/,
  // Paragraph boundary (double newline)
  /\n\s*\n/,
  // Single newline as last resort
  /\n/,
];

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Split text at the best legal boundary near the target position.
 */
function findBestSplit(text: string, targetChars: number): number {
  // Search within a window around the target position
  const windowStart = Math.max(0, targetChars - 200);
  const windowEnd = Math.min(text.length, targetChars + 200);
  const window = text.slice(windowStart, windowEnd);

  // Try each boundary pattern (highest priority first)
  for (const pattern of BOUNDARY_PATTERNS) {
    const matches = [...window.matchAll(new RegExp(pattern, "g"))];
    if (matches.length > 0) {
      // Find the match closest to target
      let bestMatch = matches[0];
      let bestDist = Math.abs(
        (windowStart + bestMatch.index!) - targetChars
      );

      for (const match of matches) {
        const dist = Math.abs((windowStart + match.index!) - targetChars);
        if (dist < bestDist) {
          bestMatch = match;
          bestDist = dist;
        }
      }

      return windowStart + bestMatch.index!;
    }
  }

  // Fallback: split at target position (last resort)
  return targetChars;
}

/**
 * Chunk legal text respecting document structure.
 */
export function chunkLegalText(
  text: string,
  baseMetadata: Record<string, unknown> = {},
  options: ChunkOptions = {}
): LegalChunk[] {
  const {
    targetTokens = 600,
    maxTokens = 800,
    overlapTokens = 100,
  } = options;

  const totalTokens = estimateTokens(text);

  // If text fits in one chunk, return as-is
  if (totalTokens <= maxTokens) {
    return [
      {
        text: text.trim(),
        index: 0,
        totalChunks: 1,
        metadata: { ...baseMetadata },
      },
    ];
  }

  const targetChars = targetTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;
  const chunks: LegalChunk[] = [];
  let position = 0;

  while (position < text.length) {
    const remaining = text.length - position;

    // If remaining fits in max, take it all
    if (remaining <= maxTokens * CHARS_PER_TOKEN) {
      chunks.push({
        text: text.slice(position).trim(),
        index: chunks.length,
        totalChunks: 0, // Will be set after
        metadata: { ...baseMetadata },
      });
      break;
    }

    // Find best split point
    const splitAt = findBestSplit(text, position + targetChars);
    const chunkText = text.slice(position, splitAt).trim();

    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        index: chunks.length,
        totalChunks: 0,
        metadata: { ...baseMetadata },
      });
    }

    // Advance position with overlap
    position = Math.max(position + 1, splitAt - overlapChars);
  }

  // Set totalChunks on all chunks
  for (const chunk of chunks) {
    chunk.totalChunks = chunks.length;
  }

  return chunks;
}

/**
 * Chunk a doctrina document into pieces suitable for embedding.
 */
export function chunkDoctrina(
  doc: {
    id: string;
    tipo: string;
    numero: string;
    fecha: string;
    tema: string;
    sintesis: string;
    conclusionClave?: string;
    articulosSlugs: string[];
    vigente: boolean;
    fuenteUrl: string;
    fuenteSitio: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "doctrina",
    numero: doc.numero,
    fecha: doc.fecha,
    tema: doc.tema,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    vigente: doc.vigente,
    fuente_url: doc.fuenteUrl,
    fuente_sitio: doc.fuenteSitio,
  };

  return chunkLegalText(doc.sintesis, metadata, options);
}

/**
 * Chunk a sentencia document.
 */
export function chunkSentencia(
  doc: {
    id: string;
    corte: string;
    tipo: string;
    numero: string;
    year: number;
    tema: string;
    ratioDecidendi?: string;
    decision?: string;
    resumen: string;
    articulosSlugs: string[];
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "sentencia",
    corte: doc.corte,
    tipo: doc.tipo,
    numero: doc.numero,
    year: doc.year,
    tema: doc.tema,
    decision: doc.decision,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    fuente_url: doc.fuenteUrl,
  };

  // Prefer ratio decidendi for embedding, fall back to resumen
  const textToChunk = doc.ratioDecidendi || doc.resumen;
  return chunkLegalText(textToChunk, metadata, options);
}

/**
 * Chunk a decreto article.
 */
export function chunkDecreto(
  doc: {
    id: string;
    decretoNumero: string;
    decretoYear: number;
    articuloNumero: string;
    texto: string;
    articulosSlugs: string[];
    vigente: boolean;
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "decreto",
    decreto_numero: doc.decretoNumero,
    decreto_year: doc.decretoYear,
    articulo_numero: doc.articuloNumero,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    vigente: doc.vigente,
    fuente_url: doc.fuenteUrl,
  };

  return chunkLegalText(doc.texto, metadata, options);
}

/**
 * Chunk a resolución DIAN document.
 */
export function chunkResolucion(
  doc: {
    id: string;
    numero: string;
    year: number;
    fecha: string;
    tema: string;
    texto: string;
    articulosSlugs: string[];
    vigente: boolean;
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "resolucion",
    numero: doc.numero,
    fecha: doc.fecha,
    tema: doc.tema,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    vigente: doc.vigente,
    fuente_url: doc.fuenteUrl,
    fuente_sitio: "dian",
  };

  return chunkLegalText(doc.texto, metadata, options);
}

/**
 * Chunk a ley tributaria document. Chunks each article separately.
 */
export function chunkLey(
  doc: {
    id: string;
    numero: string;
    year: number;
    titulo: string;
    articulos: Array<{
      numero: string;
      texto: string;
      articulosETModificados: string[];
    }>;
    articulosETAfectados: string[];
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const allChunks: LegalChunk[] = [];

  for (const art of doc.articulos) {
    const metadata = {
      doc_id: `${doc.id}-art-${art.numero}`,
      doc_type: "ley",
      numero: doc.numero,
      fecha: `${doc.year}-01-01`,
      tema: doc.titulo,
      articulos_et: art.articulosETModificados.map((s) => `Art. ${s}`),
      articulos_slugs: art.articulosETModificados,
      vigente: true,
      fuente_url: doc.fuenteUrl,
      fuente_sitio: "senado",
      ley_articulo: art.numero,
    };

    const chunks = chunkLegalText(art.texto, metadata, options);
    allChunks.push(...chunks);
  }

  return allChunks;
}
