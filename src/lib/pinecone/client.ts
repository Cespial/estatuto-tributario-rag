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

export { getPineconeClient };
