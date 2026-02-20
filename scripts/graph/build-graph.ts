/**
 * Phase 8 — Advanced Tax Knowledge Graph Builder
 *
 * Scans scraped legal documents to build a multidimensional graph:
 * - Nodes: Articles (ET, Ley, Decreto), with Year and Topic metadata.
 * - Edges: Typed relations (MODIFIES, REGULATES, etc.)
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Graph Types
interface TaxNode {
  id: string;
  label: string;
  type: "estatuto" | "ley" | "decreto" | "sentencia" | "doctrina" | "libro" | "root";
  group?: string;
  year?: number;
  topic?: string;
  data?: any;
}

interface TaxEdge {
  source: string;
  target: string;
  relation: "MODIFIES" | "REGULATES" | "REFERENCES" | "AFFECTS" | "INTERPRETS" | "CONTAINS";
  context?: string;
  year?: number;
}

interface TaxGraph {
  nodes: TaxNode[];
  edges: TaxEdge[];
  metadata: {
    generatedAt: string;
    stats: {
      nodes: number;
      edges: number;
    };
  };
}

// Improved Regex Patterns (Maximum Flexibility)
const REGEX_MODIFIES = /(?:modif[ií]quese|adici[oó]nese|der[oó]guese|sustit[uú]yase)(?:[\s\S]{1,100}?)art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;
const REGEX_REGULATES = /(?:reglamenta|desarrolla|aplicaci[oó]n)(?:[\s\S]{1,100}?)art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;
const REGEX_REFERENCES = /art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;

function inferTopic(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("renta")) return "Renta";
  if (t.includes("iva") || t.includes("ventas")) return "IVA";
  if (t.includes("procedimiento")) return "Procedimiento";
  if (t.includes("igualdad") || t.includes("reforma")) return "Reforma Estructural";
  return "General";
}

function inferTopicFromArt(num: string): string {
  const n = parseInt(num);
  if (isNaN(n)) return "Especial";
  if (n <= 364) return "Renta";
  if (n <= 419) return "Retención";
  if (n <= 512) return "IVA";
  if (n <= 616) return "Consumo / Timbre";
  return "Procedimiento";
}

async function buildGraph() {
  console.log("[graph] Starting Advanced Tax Graph construction...");
  
  const nodes: Map<string, TaxNode> = new Map();
  const edges: TaxEdge[] = [];

  const addNode = (id: string, label: string, type: TaxNode["type"], extra: Partial<TaxNode> = {}) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, label, type, ...extra });
    } else {
      // Merge extra metadata if node already exists
      const existing = nodes.get(id)!;
      nodes.set(id, { ...existing, ...extra });
    }
  };

  // 1. Process LEYES (The Modifiers)
  const leyFiles = glob.sync("data/scraped/leyes/*.json");
  console.log(`[graph] Processing ${leyFiles.length} Leyes...`);

  for (const file of leyFiles) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    const leyId = `ley-${data.numero}-${data.year}`;
    
    addNode(leyId, `Ley ${data.numero} de ${data.year}`, "ley", {
      year: data.year,
      group: data.titulo,
      topic: inferTopic(data.titulo)
    });

    if (data.articulos) {
      for (const art of data.articulos) {
        let match;
        REGEX_MODIFIES.lastIndex = 0;
        while ((match = REGEX_MODIFIES.exec(art.texto)) !== null) {
          const etArtNum = match[1];
          const etNodeId = `et-art-${etArtNum}`;
          
          addNode(etNodeId, `Art. ${etArtNum} ET`, "estatuto", {
            topic: inferTopicFromArt(etArtNum)
          });
          
          edges.push({
            source: leyId,
            target: etNodeId,
            relation: "MODIFIES",
            year: data.year,
            context: `Ley ${data.numero} Art. ${art.numero} modifica Art. ${etArtNum} ET`
          });
        }
      }
    }
  }

  // 2. Process DECRETOS (The Regulators)
  const decFiles = glob.sync("data/scraped/decretos/*.json");
  console.log(`[graph] Processing ${decFiles.length} Decretos...`);

  for (const file of decFiles) {
    const raw = fs.readFileSync(file, "utf-8");
    const json = JSON.parse(raw);
    const docs = Array.isArray(json) ? json : [json];

    for (const doc of docs) {
      if (!doc.id) continue;
      const decNodeId = doc.id;
      const year = doc.decretoYear || 2016;
      
      addNode(decNodeId, `DUR Art. ${doc.id.split("-").pop()}`, "decreto", {
        year,
        topic: "Reglamentación"
      });

      if (doc.articulosSlugs) {
        for (const slug of doc.articulosSlugs) {
           const etNodeId = `et-art-${slug}`;
           addNode(etNodeId, `Art. ${slug} ET`, "estatuto", {
             topic: inferTopicFromArt(slug)
           });
           edges.push({
             source: decNodeId,
             target: etNodeId,
             relation: "REGULATES",
             year,
             context: "Reglamentación DUR 1625"
           });
        }
      }
    }
  }

  // 3. Final Assembly
  const graph: TaxGraph = {
    nodes: Array.from(nodes.values()),
    edges,
    metadata: {
      generatedAt: new Date().toISOString(),
      stats: {
        nodes: nodes.size,
        edges: edges.length
      }
    }
  };

  const outputPath = path.resolve("data/graph/tax-graph.json");
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
  
  console.log(`[graph] Built Advanced Graph: ${nodes.size} nodes, ${edges.length} edges.`);
}

buildGraph().catch(console.error);
