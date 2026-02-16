import { getPineconeClient } from "./client";
import { EMBEDDING_MODEL } from "@/config/constants";

export async function embedQuery(text: string): Promise<number[]> {
  const pc = getPineconeClient();
  const normalized = text.normalize("NFC");

  const result = await pc.inference.embed({
    model: EMBEDDING_MODEL,
    inputs: [normalized],
    parameters: { inputType: "query", truncate: "END" },
  });

  const embedding = result.data[0];
  if ("values" in embedding) {
    return embedding.values;
  }
  throw new Error("Expected dense embedding");
}

export async function embedQueries(texts: string[]): Promise<number[][]> {
  const pc = getPineconeClient();
  const normalized = texts.map((t) => t.normalize("NFC"));

  const result = await pc.inference.embed({
    model: EMBEDDING_MODEL,
    inputs: normalized,
    parameters: { inputType: "query", truncate: "END" },
  });

  return result.data.map((d) => {
    if ("values" in d) {
      return d.values;
    }
    throw new Error("Expected dense embedding");
  });
}
