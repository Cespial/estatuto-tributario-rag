/**
 * Test RAG Context Assembly with Graph Enrichment
 * 
 * Simulates a retrieval of Article 240 and checks if graph connections are added.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { assembleContext } from "@/lib/rag/context-assembler";
import { RerankedChunk } from "@/types/rag";

// Mock chunk simulating retrieval of Art. 240
const mockChunks: RerankedChunk[] = [
  {
    id: "et-art-240-chunk-0",
    rerankedScore: 0.95,
    score: 0.95,
    metadata: {
      id_articulo: "et-art-240",
      titulo: "Artículo 240. Tarifa general para personas jurídicas.",
      categoria_libro: "I - Impuesto sobre la Renta",
      categoria_titulo: "Tarifas",
      url_origen: "https://estatuto.co/240",
      chunk_type: "contenido",
      chunk_index: 0,
      text: "La tarifa general del impuesto sobre la renta aplicable a las sociedades nacionales y sus asimiladas... será del 35%.",
      total_chunks: 1,
      // Metadata fields
      estado: "Vigente",
      slug: "240"
    }
  }
];

async function test() {
  console.log("--- Testing RAG Context Assembly for Art. 240 ---\n");
  
  const context = await assembleContext(mockChunks);
  
  console.log("--- Generated Context (Start) ---");
  console.log(context.articles[0].titulo);
  
  const { buildContextString } = await import("@/lib/rag/context-assembler");
  const finalString = buildContextString(context);
  
  console.log(finalString);
  console.log("\n--- Generated Context (End) ---");
}

test().catch(console.error);
