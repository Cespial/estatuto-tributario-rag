/**
 * Graph Retriever
 * 
 * Provides semantic connections for retrieved documents using the Tax Knowledge Graph.
 * When a vector search finds "Art. 240", this module finds "Decree 1625 Art. 1.2..."
 */

import * as fs from "fs";
import * as path from "path";

// Types matching build-graph.ts output
interface TaxNode {
  id: string;
  label: string;
  type: string;
  group?: string;
}

interface TaxEdge {
  source: string;
  target: string;
  relation: string;
  context?: string;
}

interface TaxGraph {
  nodes: TaxNode[];
  edges: TaxEdge[];
}

let cachedGraph: TaxGraph | null = null;

function loadGraph(): TaxGraph {
  if (cachedGraph) return cachedGraph;

  try {
    const graphPath = path.resolve(process.cwd(), "data/graph/tax-graph.json");
    if (!fs.existsSync(graphPath)) {
      console.warn("[graph-retriever] Graph file not found at", graphPath);
      return { nodes: [], edges: [] };
    }
    const raw = fs.readFileSync(graphPath, "utf-8");
    cachedGraph = JSON.parse(raw);
    console.log(`[graph-retriever] Loaded graph with ${cachedGraph?.nodes.length} nodes`);
    return cachedGraph!;
  } catch (error) {
    console.error("[graph-retriever] Failed to load graph:", error);
    return { nodes: [], edges: [] };
  }
}

export interface GraphContext {
  sourceId: string;
  relatedId: string;
  relation: string;
  snippet?: string;
}

/**
 * Given a list of document IDs (e.g., "et-art-240"), find related documents in the graph.
 */
export function getRelatedContext(docIds: string[]): GraphContext[] {
  const graph = loadGraph();
  const related: GraphContext[] = [];
  
  // Create a set for O(1) lookup
  const targetIds = new Set(docIds);

  for (const edge of graph.edges) {
    // Check outgoing edges (Source -> Target)
    if (targetIds.has(edge.source)) {
      related.push({
        sourceId: edge.source,
        relatedId: edge.target,
        relation: edge.relation,
        snippet: edge.context
      });
    }
    // Check incoming edges (Target <- Source)
    // Example: We found Art. 240 (Target), we want the Law that modifies it (Source)
    if (targetIds.has(edge.target)) {
      related.push({
        sourceId: edge.target,
        relatedId: edge.source,
        relation: `INVERSE_${edge.relation}`, // e.g. IS_MODIFIED_BY
        snippet: edge.context
      });
    }
  }

  return related;
}

/**
 * Get specific regulations for an article
 */
export function getRegulations(articleId: string): string[] {
  const graph = loadGraph();
  return graph.edges
    .filter(e => e.target === articleId && e.relation === "REGULATES")
    .map(e => e.source);
}

/**
 * Get modifications history for an article
 */
export function getModifications(articleId: string): string[] {
  const graph = loadGraph();
  return graph.edges
    .filter(e => e.target === articleId && e.relation === "MODIFIES")
    .map(e => e.source);
}
