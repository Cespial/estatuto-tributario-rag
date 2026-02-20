import { NextResponse } from "next/server";
import { getRelatedContext } from "@/lib/rag/graph-retriever";

// Simple graph structure for frontend
interface GraphData {
  nodes: { data: { id: string; label: string; type: string } }[];
  edges: { data: { source: string; target: string; label: string } }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q"); // e.g., "240"

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
  }

  // Normalize ID (simple heuristic)
  const articleId = query.startsWith("et-") ? query : `et-art-${query}`;
  
  // Get direct connections
  const connections = getRelatedContext([articleId]);

  // Build graph response
  const nodes = new Map<string, { data: { id: string; label: string; type: string } }>();
  const edges: { data: { source: string; target: string; label: string } }[] = [];

  // Add center node
  nodes.set(articleId, { 
    data: { id: articleId, label: `Art. ${query}`, type: "center" } 
  });

  for (const conn of connections) {
    // Add related node
    const relatedLabel = conn.relatedId.replace("dur-", "DUR ").replace("ley-", "Ley ");
    
    nodes.set(conn.relatedId, {
      data: { 
        id: conn.relatedId, 
        label: relatedLabel, 
        type: conn.relatedId.split("-")[0] // "ley", "dur", "et"
      }
    });

    // Add edge
    edges.push({
      data: {
        source: conn.sourceId,
        target: conn.relatedId,
        label: conn.relation
      }
    });
  }

  return NextResponse.json({
    nodes: Array.from(nodes.values()),
    edges
  });
}
