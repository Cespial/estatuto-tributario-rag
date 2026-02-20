/**
 * Phase 5 — Validate Upsert
 *
 * Verifies that Pinecone has data in each namespace after upserting.
 * Runs a sample query per namespace and reports stats.
 *
 * Usage: npx tsx scripts/embedding/validate-upsert.ts
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PINECONE_HOST =
  "https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io";
const EMBEDDING_MODEL = "multilingual-e5-large";

const NAMESPACES = ["", "doctrina", "jurisprudencia", "decretos", "resoluciones", "leyes"];

const SAMPLE_QUERIES: Record<string, string> = {
  "": "tarifa impuesto renta personas jurídicas",
  doctrina: "concepto DIAN subcapitalización precios de transferencia",
  jurisprudencia: "sentencia constitucionalidad impuesto patrimonio",
  decretos: "decreto reglamentario retención en la fuente salarios",
  resoluciones: "resolución DIAN plazos declaración renta",
  leyes: "reforma tributaria tarifa impuesto renta personas jurídicas",
};

async function main() {
  console.log("[validate] Starting Pinecone validation...\n");

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(
    process.env.PINECONE_INDEX_NAME || "estatuto-tributario",
    PINECONE_HOST
  );

  // Get index stats
  try {
    const stats = await index.describeIndexStats();
    console.log("=== Index Stats ===");
    console.log(`Total vectors: ${stats.totalRecordCount}`);
    console.log("Namespaces:");
    for (const [ns, nsStats] of Object.entries(stats.namespaces || {})) {
      console.log(`  "${ns || "(default)"}": ${nsStats.recordCount} vectors`);
    }
    console.log();
  } catch (error) {
    console.error("[validate] Failed to get stats:", error);
  }

  // Sample query per namespace
  for (const ns of NAMESPACES) {
    const query = SAMPLE_QUERIES[ns] || "impuesto renta";
    const label = ns || "(default)";

    try {
      // Embed the query
      const embedResult = await pc.inference.embed({
        model: EMBEDDING_MODEL,
        inputs: [query],
        parameters: { inputType: "query", truncate: "END" },
      });

      const embedding = embedResult.data[0];
      if (!("values" in embedding)) {
        console.error(`[validate] Failed to embed query for namespace "${label}"`);
        continue;
      }

      // Query the namespace
      const nsIndex = index.namespace(ns);
      const result = await nsIndex.query({
        vector: embedding.values,
        topK: 3,
        includeMetadata: true,
      });

      const matches = result.matches || [];
      console.log(`--- Namespace: "${label}" ---`);
      console.log(`  Query: "${query}"`);
      console.log(`  Results: ${matches.length}`);

      if (matches.length > 0) {
        console.log(`  Top match: ${matches[0].id} (score: ${matches[0].score?.toFixed(4)})`);
        const meta = matches[0].metadata || {};
        if (meta.doc_type) console.log(`    Type: ${meta.doc_type}`);
        if (meta.doc_id) console.log(`    Doc ID: ${meta.doc_id}`);
        const text = (meta.text as string) || "";
        if (text) console.log(`    Text: ${text.slice(0, 150)}...`);
        console.log(`  ✓ PASS`);
      } else {
        console.log(`  ✗ FAIL — No results found`);
      }
      console.log();
    } catch (error) {
      console.error(
        `[validate] Namespace "${label}" failed:`,
        (error as Error).message
      );
      console.log();
    }
  }

  console.log("[validate] Validation complete.");
}

main().catch(console.error);
