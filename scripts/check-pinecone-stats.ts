import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PINECONE_HOST = "https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io";

async function main() {
  const pc = new Pinecone();
  const index = pc.index("estatuto-tributario", PINECONE_HOST);
  const stats = await index.describeIndexStats();
  console.log(JSON.stringify(stats, null, 2));
}

main().catch(console.error);
