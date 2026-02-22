import { Pinecone, Index } from "@pinecone-database/pinecone";
import { PINECONE_HOST } from "@/config/constants";

let pineconeClient: Pinecone | null = null;
let pineconeIndex: Index | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export function getIndex(): Index {
  if (!pineconeIndex) {
    const pc = getPineconeClient();
    pineconeIndex = pc.index(
      process.env.PINECONE_INDEX_NAME || "estatuto-tributario",
      PINECONE_HOST
    );
  }
  return pineconeIndex;
}

/**
 * Retry with exponential backoff for Pinecone operations.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries) throw e;
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 500;
      console.warn(`[pinecone] Retry ${i + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

export { getPineconeClient };
