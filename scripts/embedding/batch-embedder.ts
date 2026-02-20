/**
 * Phase 5 — Batch Embedder
 *
 * Embeds chunks using Pinecone Inference (multilingual-e5-large)
 * with rate limiting, batching, and progress tracking.
 *
 * Usage: npx tsx scripts/embedding/batch-embedder.ts [namespace]
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

const EMBEDDING_MODEL = "multilingual-e5-large";
const BATCH_SIZE = 96; // Pinecone Inference limit
const RATE_LIMIT_MS = 16000; // ~4 batches/min to stay under 250K tokens/min limit

export interface EmbeddingInput {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface EmbeddingResult {
  id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

let pinecone: Pinecone | null = null;

function getPinecone(): Pinecone {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Embed a single batch of texts (max 96).
 */
async function embedBatch(
  texts: string[],
  retries = 5
): Promise<number[][]> {
  const pc = getPinecone();

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await pc.inference.embed({
        model: EMBEDDING_MODEL,
        inputs: texts.map((t) => t.normalize("NFC")),
        parameters: { inputType: "passage", truncate: "END" },
      });

      return result.data.map((d) => {
        if ("values" in d) return d.values;
        throw new Error("Expected dense embedding");
      });
    } catch (error) {
      const errorMsg = (error as Error).message || String(error);
      const is429 = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED");

      if (attempt < retries - 1) {
        // Longer delay for rate limits, shorter for other errors
        const delay = is429
          ? 30000 + attempt * 15000  // 30s, 45s, 60s, 75s for rate limits
          : Math.pow(2, attempt) * 1000;
        console.warn(
          `[batch-embedder] Attempt ${attempt + 1}/${retries} failed${is429 ? " (rate limit)" : ""}. Retrying in ${delay / 1000}s...`
        );
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  throw new Error("Unreachable");
}

/**
 * Embed all inputs in batches with rate limiting and progress tracking.
 */
export async function embedAll(
  inputs: EmbeddingInput[],
  options?: {
    onProgress?: (completed: number, total: number) => void;
    existingIds?: Set<string>;
  }
): Promise<EmbeddingResult[]> {
  const { onProgress, existingIds } = options || {};

  // Filter out already-embedded items
  const toEmbed = existingIds
    ? inputs.filter((i) => !existingIds.has(i.id))
    : inputs;

  console.log(
    `[batch-embedder] Embedding ${toEmbed.length} chunks (${inputs.length - toEmbed.length} skipped as existing)`
  );

  const results: EmbeddingResult[] = [];
  let completed = 0;

  for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
    const batch = toEmbed.slice(i, i + BATCH_SIZE);
    const texts = batch.map((b) => b.text);

    const embeddings = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      results.push({
        id: batch[j].id,
        values: embeddings[j],
        metadata: batch[j].metadata,
      });
    }

    completed += batch.length;

    if (onProgress && completed % 1000 < BATCH_SIZE) {
      onProgress(completed, toEmbed.length);
    }

    // Rate limiting
    if (i + BATCH_SIZE < toEmbed.length) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(`[batch-embedder] Embedded ${results.length} chunks`);
  return results;
}
