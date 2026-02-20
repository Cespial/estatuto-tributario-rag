/**
 * Phase 5 — Metadata Enricher
 *
 * Adds graph metrics (PageRank, community, degree) to chunk metadata
 * before upserting to Pinecone.
 */

import * as fs from "fs";
import * as path from "path";
import { GraphMetrics } from "../graph/types";
import { LegalChunk } from "./legal-chunker";

const METRICS_PATH = path.resolve("public/data/graph-metrics.json");

let cachedMetrics: GraphMetrics | null = null;

function loadMetrics(): GraphMetrics {
  if (cachedMetrics) return cachedMetrics;

  if (!fs.existsSync(METRICS_PATH)) {
    console.warn(
      "[metadata-enricher] graph-metrics.json not found. Run compute-metrics.ts first."
    );
    return {
      nodes: {},
      communities: {},
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        totalCommunities: 0,
        avgPagerank: 0,
        topArticlesByPagerank: [],
        topArticlesByBetweenness: [],
      },
    };
  }

  cachedMetrics = JSON.parse(fs.readFileSync(METRICS_PATH, "utf-8"));
  return cachedMetrics!;
}

export interface EnrichedChunkMetadata {
  // Identity
  doc_id: string;
  doc_type:
    | "articulo"
    | "doctrina"
    | "sentencia"
    | "decreto"
    | "resolucion"
    | "ley";
  numero: string;
  fecha?: string;

  // Chunking
  chunk_index: number;
  total_chunks: number;
  text: string;

  // ET linking
  articulos_et: string[];
  articulos_slugs: string[];

  // Classification
  tema: string;
  libro_et?: string;
  vigente: boolean;

  // Graph metrics
  pagerank?: number;
  community_id?: number;
  degree_in?: number;
  degree_out?: number;

  // Source
  fuente_url: string;
  fuente_sitio: string;

  // Extra fields (passthrough from chunk metadata)
  [key: string]: unknown;
}

/**
 * Enrich a chunk with graph metrics from the pre-computed graph-metrics.json.
 */
export function enrichChunk(chunk: LegalChunk): EnrichedChunkMetadata {
  const metrics = loadMetrics();
  const meta = chunk.metadata as Record<string, unknown>;

  // Find related article nodes in the graph
  const artSlugs = (meta.articulos_slugs as string[]) || [];
  let maxPagerank = 0;
  let communityId: number | undefined;
  let totalDegreeIn = 0;
  let totalDegreeOut = 0;

  for (const slug of artSlugs) {
    const nodeKey = `art-${slug}`;
    const nodeMetrics = metrics.nodes[nodeKey];
    if (nodeMetrics) {
      if (nodeMetrics.pagerank > maxPagerank) {
        maxPagerank = nodeMetrics.pagerank;
        communityId = nodeMetrics.communityId;
      }
      totalDegreeIn += nodeMetrics.degreeIn;
      totalDegreeOut += nodeMetrics.degreeOut;
    }
  }

  // Also check if the doc itself is a node (e.g., sentences, concepts)
  const docId = meta.doc_id as string;
  if (docId && metrics.nodes[docId]) {
    const docMetrics = metrics.nodes[docId];
    maxPagerank = Math.max(maxPagerank, docMetrics.pagerank);
    communityId = communityId ?? docMetrics.communityId;
  }

  return {
    doc_id: (meta.doc_id as string) || "",
    doc_type: (meta.doc_type as EnrichedChunkMetadata["doc_type"]) || "doctrina",
    numero: (meta.numero as string) || "",
    fecha: meta.fecha as string | undefined,
    chunk_index: chunk.index,
    total_chunks: chunk.totalChunks,
    text: chunk.text,
    articulos_et: (meta.articulos_et as string[]) || [],
    articulos_slugs: artSlugs,
    tema: (meta.tema as string) || "",
    libro_et: meta.libro_et as string | undefined,
    vigente: (meta.vigente as boolean) ?? true,
    pagerank: maxPagerank > 0 ? maxPagerank : undefined,
    community_id: communityId,
    degree_in: totalDegreeIn > 0 ? totalDegreeIn : undefined,
    degree_out: totalDegreeOut > 0 ? totalDegreeOut : undefined,
    fuente_url: (meta.fuente_url as string) || "",
    fuente_sitio: (meta.fuente_sitio as string) || "",
    // Pass through extra fields
    ...Object.fromEntries(
      Object.entries(meta).filter(
        ([k]) =>
          ![
            "doc_id", "doc_type", "numero", "fecha", "articulos_et",
            "articulos_slugs", "tema", "libro_et", "vigente",
            "fuente_url", "fuente_sitio",
          ].includes(k)
      )
    ),
  };
}

/**
 * Enrich a batch of chunks.
 */
export function enrichChunks(chunks: LegalChunk[]): EnrichedChunkMetadata[] {
  return chunks.map(enrichChunk);
}
