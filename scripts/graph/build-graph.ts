/**
 * Phase 8 — Tax Knowledge Graph Builder (V1)
 *
 * Scans scraped legal documents to build a graph of relationships:
 * - Nodes: Articles (ET, Ley, Decreto), Concepts, Sentences
 * - Edges: MODIFIES, REGULATES, REFERENCES, AFFECTS
 *
 * Output: data/graph/tax-graph.json (Nodes & Edges list)
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Graph Types
interface TaxNode {
  id: string;
  label: string;
  type: "estatuto" | "ley" | "decreto" | "sentencia" | "doctrina";
  group?: string; // e.g., "Renta", "IVA"
  data?: any;
}

interface TaxEdge {
  source: string;
  target: string;
  relation: "MODIFIES" | "REGULATES" | "REFERENCES" | "AFFECTS" | "INTERPRETS";
  context?: string; // Text snippet justifying the link
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
// Capture "Artículo X" ... (up to 50 chars of noise) ... "Estatuto/ET"
const REGEX_MODIFIES = /(?:modif[ií]quese|adici[oó]nese|der[oó]guese|sustit[uú]yase)(?:[\s\S]{1,100}?)art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;
const REGEX_REGULATES = /(?:reglamenta|desarrolla|aplicaci[oó]n)(?:[\s\S]{1,100}?)art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;
const REGEX_REFERENCES = /art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;

async function buildGraph() {
  console.log("[graph] Starting Tax Graph construction...");
  
  const nodes: Map<string, TaxNode> = new Map();
  const edges: TaxEdge[] = [];

  // Helper to add node
  const addNode = (id: string, label: string, type: TaxNode["type"], group?: string) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, label, type, group });
    }
  };

  // 1. Process ESTATUTO TRIBUTARIO (Base Nodes)
  // Since we don't have a single "Estatuto" file but many chunks, we'll infer nodes from references
  // or load from a specific estatuto scraping if available. For now, we'll create nodes on demand.

  // 2. Process LEYES (The Modifiers)
  const leyFiles = glob.sync("data/scraped/leyes/*.json");
  console.log(`[graph] Processing ${leyFiles.length} Leyes...`);

  for (const file of leyFiles) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    // data is typically { id, numero, articulos: [...] }
    
    // Create Node for the Ley itself
    const leyId = `ley-${data.numero}-${data.year}`;
    addNode(leyId, `Ley ${data.numero} de ${data.year}`, "ley", data.titulo);

    // Process each article in the Ley
    if (data.articulos) {
      for (const art of data.articulos) {
        const artId = `${leyId}-art-${art.numero}`;
        // addNode(artId, `Art. ${art.numero} Ley ${data.numero}`, "ley"); // Optional: Granular nodes

        // Check for modifications to Estatuto
        let match;
        while ((match = REGEX_MODIFIES.exec(art.texto)) !== null) {
          const etArtNum = match[1];
          const etNodeId = `et-art-${etArtNum}`;
          
          addNode(etNodeId, `Art. ${etArtNum} ET`, "estatuto");
          
          edges.push({
            source: leyId,
            target: etNodeId,
            relation: "MODIFIES",
            context: `Ley ${data.numero} Art. ${art.numero} modifica Art. ${etArtNum} ET`
          });
        }
      }
    }
  }

  // 3. Process DECRETOS (The Regulators)
  const decFiles = glob.sync("data/scraped/decretos/*.json");
  console.log(`[graph] Processing ${decFiles.length} Decretos...`);

  // Decretos are often split into batches. We need to handle array or single object.
  for (const file of decFiles) {
    const raw = fs.readFileSync(file, "utf-8");
    const json = JSON.parse(raw);
    const docs = Array.isArray(json) ? json : [json];

    for (const doc of docs) {
      // doc.id example: "dur-1625-art-1.2.1.10.4"
      if (!doc.id) continue;

      const decNodeId = doc.id;
      // Extract numeric part for label
      const match = doc.id.match(/art-(.*)$/);
      const label = match ? `DUR Art. ${match[1]}` : doc.id;
      
      addNode(decNodeId, label, "decreto");

      // Check text for "reglamenta el artículo X"
      let refMatch;
      // Reset regex index
      REGEX_REGULATES.lastIndex = 0; 
      
      // Also check specific "articulosSlugs" field if it exists and is populated
      if (doc.articulosSlugs && doc.articulosSlugs.length > 0) {
        for (const slug of doc.articulosSlugs) {
           const etNodeId = `et-art-${slug}`;
           addNode(etNodeId, `Art. ${slug} ET`, "estatuto");
           edges.push({
             source: decNodeId,
             target: etNodeId,
             relation: "REGULATES",
             context: "Vinculación explícita por metadatos"
           });
        }
      }

      // Text-based extraction for REFERENCES
      while ((refMatch = REGEX_REFERENCES.exec(doc.texto)) !== null) {
        const etArtNum = refMatch[1];
        const etNodeId = `et-art-${etArtNum}`;
        addNode(etNodeId, `Art. ${etArtNum} ET`, "estatuto");
        
        // Avoid duplicate edges if already caught by articulosSlugs
        const exists = edges.some(e => e.source === decNodeId && e.target === etNodeId);
        if (!exists) {
            edges.push({
                source: decNodeId,
                target: etNodeId,
                relation: "REFERENCES",
                context: "Mención en texto"
            });
        }
      }
    }
  }

  // 4. Output
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
  
  console.log(`[graph] Built graph with ${nodes.size} nodes and ${edges.length} edges.`);
  console.log(`[graph] Saved to ${outputPath}`);
}

buildGraph().catch(console.error);
