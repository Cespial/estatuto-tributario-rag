import { getIndex } from "@/lib/pinecone/client";
import { RerankedChunk, ArticleGroup, AssembledContext, SourceCitation } from "@/types/rag";
import { ChunkMetadata } from "@/types/pinecone";
import { estimateTokens } from "@/lib/utils/article-parser";
import { RAG_CONFIG } from "@/config/constants";

export async function assembleContext(
  chunks: RerankedChunk[],
  options: { useSiblingRetrieval?: boolean; maxTokens?: number } = {}
): Promise<AssembledContext> {
  const {
    useSiblingRetrieval = RAG_CONFIG.useSiblingRetrieval,
    maxTokens = RAG_CONFIG.maxContextTokens,
  } = options;

  let allChunks = [...chunks];

  // Sibling retrieval: fetch all chunks of the same article if it was split
  if (useSiblingRetrieval) {
    allChunks = await fetchSiblingChunks(allChunks);
  }

  // Dedup by composite key
  const deduped = dedup(allChunks);

  // Group by article
  const groups = groupByArticle(deduped);

  // Sort groups by max score
  groups.sort((a, b) => b.maxScore - a.maxScore);

  // Apply token budget
  const { articles, totalTokens } = applyTokenBudget(groups, maxTokens);

  // Build source citations with enriched fields
  const sources: SourceCitation[] = articles.map((g) => ({
    idArticulo: g.idArticulo,
    titulo: g.titulo,
    url: g.urlOrigen,
    categoriaLibro: g.categoriaLibro,
    relevanceScore: g.maxScore,
    estado: g.estado,
    totalModificaciones: g.totalModificaciones,
    slug: g.slug,
  }));

  return {
    articles,
    sources,
    totalTokensEstimate: totalTokens,
  };
}

async function fetchSiblingChunks(
  chunks: RerankedChunk[]
): Promise<RerankedChunk[]> {
  const index = getIndex();

  // Find articles that have multiple chunks (total_chunks > 1)
  const articlesToExpand = new Set<string>();
  const existingIds = new Set(chunks.map((c) => c.id));

  for (const chunk of chunks) {
    if (chunk.metadata.total_chunks > 1) {
      articlesToExpand.add(chunk.metadata.id_articulo);
    }
  }

  if (articlesToExpand.size === 0) return chunks;

  // For each article needing expansion, fetch all its chunks by querying metadata
  const siblingPromises = Array.from(articlesToExpand).map(async (artId) => {
    const result = await index.query({
      vector: new Array(1024).fill(0),
      topK: 30,
      includeMetadata: true,
      filter: { id_articulo: { $eq: artId } },
    });
    return result.matches || [];
  });

  const siblingResults = await Promise.all(siblingPromises);

  // Find the max score for each article from the original chunks
  const articleScores = new Map<string, number>();
  for (const chunk of chunks) {
    const current = articleScores.get(chunk.metadata.id_articulo) ?? 0;
    articleScores.set(
      chunk.metadata.id_articulo,
      Math.max(current, chunk.rerankedScore)
    );
  }

  // Add siblings not already present
  for (const matches of siblingResults) {
    for (const match of matches) {
      if (!existingIds.has(match.id) && match.metadata) {
        const meta = match.metadata as unknown as ChunkMetadata;
        const artScore = articleScores.get(meta.id_articulo) ?? 0;

        chunks.push({
          id: match.id,
          score: match.score ?? 0,
          metadata: meta,
          rerankedScore: artScore * 0.9, // Siblings get slightly lower score
        });
        existingIds.add(match.id);
      }
    }
  }

  return chunks;
}

function dedup(chunks: RerankedChunk[]): RerankedChunk[] {
  const seen = new Map<string, RerankedChunk>();

  for (const chunk of chunks) {
    const key = `${chunk.metadata.id_articulo}::${chunk.metadata.chunk_type}::${chunk.metadata.chunk_index}`;
    const existing = seen.get(key);

    if (!existing || chunk.rerankedScore > existing.rerankedScore) {
      seen.set(key, chunk);
    }
  }

  return Array.from(seen.values());
}

function groupByArticle(chunks: RerankedChunk[]): ArticleGroup[] {
  const groups = new Map<string, ArticleGroup>();

  for (const chunk of chunks) {
    const artId = chunk.metadata.id_articulo;
    let group = groups.get(artId);

    if (!group) {
      group = {
        idArticulo: artId,
        titulo: chunk.metadata.titulo,
        categoriaLibro: chunk.metadata.categoria_libro,
        categoriaTitulo: chunk.metadata.categoria_titulo,
        urlOrigen: chunk.metadata.url_origen,
        contenido: [],
        modificaciones: [],
        textoAnterior: [],
        maxScore: 0,
        // Enriched fields from v2 metadata
        estado: chunk.metadata.estado,
        totalModificaciones: chunk.metadata.total_modificaciones,
        slug: chunk.metadata.slug,
      };
      groups.set(artId, group);
    }

    group.maxScore = Math.max(group.maxScore, chunk.rerankedScore);

    const text = chunk.metadata.text;
    switch (chunk.metadata.chunk_type) {
      case "contenido":
        group.contenido.push(text);
        break;
      case "modificaciones":
        group.modificaciones.push(text);
        break;
      case "texto_anterior":
        group.textoAnterior.push(text);
        break;
    }
  }

  return Array.from(groups.values());
}

function applyTokenBudget(
  groups: ArticleGroup[],
  maxTokens: number
): { articles: ArticleGroup[]; totalTokens: number } {
  const selected: ArticleGroup[] = [];
  let totalTokens = 0;

  for (const group of groups) {
    const articleText = formatArticleForContext(group);
    const tokens = estimateTokens(articleText);

    if (totalTokens + tokens > maxTokens && selected.length > 0) {
      break;
    }

    selected.push(group);
    totalTokens += tokens;
  }

  return { articles: selected, totalTokens };
}

export function formatArticleForContext(group: ArticleGroup): string {
  const parts: string[] = [];

  parts.push(`## ${group.titulo}`);
  parts.push(`Categoría: ${group.categoriaLibro} > ${group.categoriaTitulo}`);
  parts.push(`URL: ${group.urlOrigen}`);
  if (group.estado) {
    parts.push(`Estado: ${group.estado}`);
  }
  parts.push("");

  if (group.contenido.length > 0) {
    parts.push("### Contenido vigente");
    parts.push(group.contenido.join("\n\n"));
    parts.push("");
  }

  if (group.modificaciones.length > 0) {
    parts.push("### Modificaciones");
    parts.push(group.modificaciones.join("\n\n"));
    parts.push("");
  }

  if (group.textoAnterior.length > 0) {
    parts.push("### Texto anterior (derogado)");
    parts.push(group.textoAnterior.join("\n\n"));
    parts.push("");
  }

  return parts.join("\n");
}

export function buildContextString(context: AssembledContext): string {
  return context.articles.map(formatArticleForContext).join("\n---\n\n");
}
