/**
 * Phase 0.3 — Compute graph metrics using Graphology.
 *
 * Reads graph-seed.json, builds a directed graph, computes:
 * - PageRank (importance by citations)
 * - Betweenness centrality (bridge articles)
 * - Community detection (Louvain clusters)
 * - In/out degree
 *
 * Output: public/data/graph-metrics.json
 *
 * Usage: npx tsx scripts/graph/compute-metrics.ts
 */

import * as fs from "fs";
import * as path from "path";
import Graph from "graphology";
import pagerank from "graphology-metrics/centrality/pagerank";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";
import louvain from "graphology-communities-louvain";
import { GraphSeed, GraphMetrics } from "./types";

const SEED_PATH = path.resolve("public/data/graph-seed.json");
const OUTPUT_PATH = path.resolve("public/data/graph-metrics.json");

function loadSeed(): GraphSeed {
  const raw = fs.readFileSync(SEED_PATH, "utf-8");
  return JSON.parse(raw) as GraphSeed;
}

function buildGraph(seed: GraphSeed): Graph {
  const graph = new Graph({ type: "directed", multi: false });

  // Add all article nodes
  for (const [slug, entity] of Object.entries(seed.entities.articles)) {
    const nodeId = `art-${slug}`;
    graph.addNode(nodeId, {
      type: "article",
      label: entity.titulo,
      libro: entity.libro,
      estado: entity.estado,
      complexity: entity.complexity,
    });
  }

  // Add external entity nodes
  for (const [key, entity] of Object.entries(seed.entities.laws)) {
    if (!graph.hasNode(key)) {
      graph.addNode(key, {
        type: "law",
        label: `Ley ${entity.numero} de ${entity.year}`,
      });
    }
  }

  for (const [key, entity] of Object.entries(seed.entities.decrees)) {
    if (!graph.hasNode(key)) {
      graph.addNode(key, {
        type: "decree",
        label: `Decreto ${entity.numero} de ${entity.year}`,
      });
    }
  }

  for (const [key, entity] of Object.entries(seed.entities.sentences)) {
    if (!graph.hasNode(key)) {
      graph.addNode(key, {
        type: "sentence",
        label: `${entity.tipo}-${entity.numero}/${entity.year}`,
      });
    }
  }

  for (const [key, entity] of Object.entries(seed.entities.concepts)) {
    if (!graph.hasNode(key)) {
      graph.addNode(key, {
        type: "concept",
        label: `Concepto ${entity.numero} de ${entity.year}`,
      });
    }
  }

  for (const [key, entity] of Object.entries(seed.entities.resolutions)) {
    if (!graph.hasNode(key)) {
      graph.addNode(key, {
        type: "resolution",
        label: `Resolución ${entity.numero} de ${entity.year}`,
      });
    }
  }

  // Add edges (skip if source/target node doesn't exist)
  let skippedEdges = 0;
  for (const edge of seed.edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      const edgeKey = `${edge.source}->${edge.target}`;
      if (!graph.hasEdge(edgeKey)) {
        try {
          graph.addEdgeWithKey(edgeKey, edge.source, edge.target, {
            type: edge.type,
            year: edge.year,
          });
        } catch {
          // Parallel edge — skip
          skippedEdges++;
        }
      }
    } else {
      skippedEdges++;
    }
  }

  console.log(
    `[compute-metrics] Graph built: ${graph.order} nodes, ${graph.size} edges (${skippedEdges} skipped)`
  );
  return graph;
}

function computeMetrics(graph: Graph, seed: GraphSeed): GraphMetrics {
  console.log("[compute-metrics] Computing PageRank...");
  // @ts-ignore - PagerankOptions type mismatch in current graphology version
  const pagerankResult = pagerank(graph, { alpha: 0.85, maxIterations: 100 });

  console.log("[compute-metrics] Computing betweenness centrality...");
  // For large graphs, use approximate betweenness with sampling
  let betweennessResult: Record<string, number>;
  if (graph.order > 5000) {
    // Approximate for large graphs — compute only on article subgraph
    const articleGraph = new Graph({ type: "directed", multi: false });
    for (const [slug] of Object.entries(seed.entities.articles)) {
      articleGraph.addNode(`art-${slug}`);
    }
    for (const edge of seed.edges) {
      if (
        edge.source.startsWith("art-") &&
        edge.target.startsWith("art-") &&
        articleGraph.hasNode(edge.source) &&
        articleGraph.hasNode(edge.target)
      ) {
        try {
          articleGraph.addEdge(edge.source, edge.target);
        } catch {
          // Skip parallel edges
        }
      }
    }
    betweennessResult = betweennessCentrality(articleGraph);
    // Fill missing nodes with 0
    graph.forEachNode((node) => {
      if (!(node in betweennessResult)) {
        betweennessResult[node] = 0;
      }
    });
  } else {
    betweennessResult = betweennessCentrality(graph);
  }

  console.log("[compute-metrics] Computing Louvain communities...");
  // Louvain needs undirected graph
  const undirected = new Graph({ type: "undirected", multi: false });
  graph.forEachNode((node, attrs) => {
    undirected.addNode(node, attrs);
  });
  graph.forEachEdge((_, __, source, target) => {
    if (!undirected.hasEdge(source, target)) {
      try {
        undirected.addEdge(source, target);
      } catch {
        // Skip
      }
    }
  });

  const communityResult = louvain(undirected, {
    resolution: 1.0,
  });

  // Build output
  const nodes: GraphMetrics["nodes"] = {};
  const communities: Record<number, string[]> = {};

  graph.forEachNode((node) => {
    const communityId = communityResult[node] ?? 0;
    const inDegree = graph.inDegree(node);
    const outDegree = graph.outDegree(node);

    nodes[node] = {
      pagerank: pagerankResult[node] ?? 0,
      betweenness: betweennessResult[node] ?? 0,
      communityId,
      degreeIn: inDegree,
      degreeOut: outDegree,
    };

    if (!communities[communityId]) {
      communities[communityId] = [];
    }
    communities[communityId].push(node);
  });

  // Compute stats
  const articleNodes = Object.entries(nodes).filter(([k]) =>
    k.startsWith("art-")
  );
  const pagerankValues = articleNodes.map(([, v]) => v.pagerank);
  const avgPagerank =
    pagerankValues.length > 0
      ? pagerankValues.reduce((a, b) => a + b, 0) / pagerankValues.length
      : 0;

  const topByPagerank = articleNodes
    .sort(([, a], [, b]) => b.pagerank - a.pagerank)
    .slice(0, 20)
    .map(([id, v]) => ({ id, pagerank: v.pagerank }));

  const topByBetweenness = articleNodes
    .sort(([, a], [, b]) => b.betweenness - a.betweenness)
    .slice(0, 20)
    .map(([id, v]) => ({ id, betweenness: v.betweenness }));

  return {
    nodes,
    communities,
    stats: {
      totalNodes: graph.order,
      totalEdges: graph.size,
      totalCommunities: Object.keys(communities).length,
      avgPagerank,
      topArticlesByPagerank: topByPagerank,
      topArticlesByBetweenness: topByBetweenness,
    },
  };
}

function main() {
  console.log("[compute-metrics] Loading graph seed...");
  const seed = loadSeed();
  console.log(
    `[compute-metrics] Loaded: ${seed.stats.totalArticles} articles, ${seed.stats.totalEdges} edges`
  );

  const graph = buildGraph(seed);
  const metrics = computeMetrics(graph, seed);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(metrics, null, 2), "utf-8");

  console.log("\n=== Graph Metrics Stats ===");
  console.log(`Total nodes:       ${metrics.stats.totalNodes}`);
  console.log(`Total edges:       ${metrics.stats.totalEdges}`);
  console.log(`Communities:       ${metrics.stats.totalCommunities}`);
  console.log(`Avg PageRank:      ${metrics.stats.avgPagerank.toFixed(6)}`);
  console.log("\nTop 10 articles by PageRank:");
  for (const item of metrics.stats.topArticlesByPagerank.slice(0, 10)) {
    console.log(`  ${item.id}: ${item.pagerank.toFixed(6)}`);
  }
  console.log("\nTop 10 articles by Betweenness:");
  for (const item of metrics.stats.topArticlesByBetweenness.slice(0, 10)) {
    console.log(`  ${item.id}: ${item.betweenness.toFixed(6)}`);
  }
  console.log(`\nOutput: ${OUTPUT_PATH}`);
}

main();
