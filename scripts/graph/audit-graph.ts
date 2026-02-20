/**
 * Graph Auditor
 * 
 * Analyzes the tax graph for quality, connectivity, and missing links.
 */

import * as fs from "fs";
import * as path from "path";

const GRAPH_PATH = path.resolve("data/graph/tax-graph.json");

function audit() {
  if (!fs.existsSync(GRAPH_PATH)) {
    console.error("Graph file not found.");
    return;
  }

  const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf-8"));
  const { nodes, edges } = graph;

  console.log("=== TAX GRAPH AUDIT REPORT ===\n");
  console.log(`Total Nodes: ${nodes.length}`);
  console.log(`Total Edges: ${edges.length}`);
  console.log(`Density: ${(edges.length / nodes.length).toFixed(4)} edges/node\n`);

  // 1. Connectivity Analysis
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();

  edges.forEach((e: any) => {
    outgoing.set(e.source, (outgoing.get(e.source) || 0) + 1);
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
  });

  // 2. Top 10 High-Impact Articles (Most Cited/Modified)
  console.log("--- Top 10 High-Impact Nodes (In-degree) ---");
  const topIn = nodes
    .filter((n: any) => n.type === "estatuto")
    .map((n: any) => ({ id: n.id, label: n.label, count: incoming.get(n.id) || 0 }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);
  
  topIn.forEach((n: any, i: number) => {
    console.log(`${i+1}. ${n.label}: ${n.count} connections`);
  });
  console.log("");

  // 3. Top 5 Regulatory Sources (Most Out-degree)
  console.log("--- Top 5 Regulatory Sources (Out-degree) ---");
  const topOut = nodes
    .filter((n: any) => n.type !== "estatuto")
    .map((n: any) => ({ id: n.id, label: n.label, count: outgoing.get(n.id) || 0 }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  topOut.forEach((n: any, i: number) => {
    console.log(`${i+1}. ${n.label}: ${n.count} links extracted`);
  });
  console.log("");

  // 4. Orphan Analysis
  const estatutoNodes = nodes.filter((n: any) => n.type === "estatuto");
  const orphans = estatutoNodes.filter((n: any) => !incoming.has(n.id) && !outgoing.has(n.id));
  const orphanPercent = ((orphans.length / estatutoNodes.length) * 100).toFixed(1);

  console.log(`--- Orphan Analysis ---`);
  console.log(`Total ET Articles: ${estatutoNodes.length}`);
  console.log(`Orphan Articles (No connections): ${orphans.length} (${orphanPercent}%)`);
  
  if (orphans.length > 0) {
    console.log(`Sample Orphans: ${orphans.slice(0, 5).map((o: any) => o.label).join(", ")}`);
  }
  console.log("");

  // 5. Semantic Golden Check
  const goldenPairs = [
    { s: "ley-2277-2022", t: "et-art-240", rel: "MODIFIES" },
    { s: "ley-2277-2022", t: "et-art-242", rel: "MODIFIES" },
    { s: "ley-2010-2019", t: "et-art-115", rel: "MODIFIES" }
  ];

  console.log("--- Golden Pair Check ---");
  goldenPairs.forEach(pair => {
    const exists = edges.find((e: any) => e.source === pair.s && e.target === pair.t);
    console.log(`${pair.s} -> ${pair.t}: ${exists ? "✅ FOUND" : "❌ MISSING"}`);
  });
}

audit();
