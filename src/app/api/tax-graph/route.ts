import { NextResponse } from "next/server";
import { getRelatedContext } from "@/lib/rag/graph-retriever";

// Estructura del Grafo para el Frontend
interface GraphData {
  nodes: { data: { id: string; label: string; type: string; parent?: string } }[];
  edges: { data: { source: string; target: string; label: string } }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q"); // Búsqueda simple (legacy)
  const idsParam = searchParams.get("ids"); // Múltiples IDs: "art-240,ley-2277"
  const mode = searchParams.get("mode"); // "general" o "focus"

  // MODO GENERAL: Retorna la estructura de alto nivel del Estatuto
  if (mode === "general") {
    return NextResponse.json(getGeneralGraphStructure());
  }

  // MODO ENFOQUE (Contextual)
  let targetIds: string[] = [];

  if (idsParam) {
    targetIds = idsParam.split(",").map(normalizeId);
  } else if (query) {
    targetIds = [normalizeId(query)];
  } else {
    // Si no hay query ni IDs, devolver general por defecto
    return NextResponse.json(getGeneralGraphStructure());
  }

  // Filtrar IDs vacíos
  targetIds = targetIds.filter(Boolean);

  if (targetIds.length === 0) {
    return NextResponse.json(getGeneralGraphStructure());
  }

  // Obtener conexiones para todos los objetivos
  const connections = getRelatedContext(targetIds);

  // Construir respuesta
  const nodes = new Map<string, { data: { id: string; label: string; type: string } }>();
  const edges: { data: { source: string; target: string; label: string } }[] = [];

  // 1. Añadir nodos centrales (los que buscó el usuario)
  targetIds.forEach(id => {
    nodes.set(id, { 
      data: { 
        id, 
        label: formatLabel(id), 
        type: "center" 
      } 
    });
  });

  // 2. Añadir conexiones y nodos relacionados
  for (const conn of connections) {
    // Nodo Origen (si no existe ya)
    if (!nodes.has(conn.sourceId)) {
      nodes.set(conn.sourceId, {
        data: { 
          id: conn.sourceId, 
          label: formatLabel(conn.sourceId), 
          type: getType(conn.sourceId)
        }
      });
    }

    // Nodo Destino (si no existe ya)
    if (!nodes.has(conn.relatedId)) {
      nodes.set(conn.relatedId, {
        data: { 
          id: conn.relatedId, 
          label: formatLabel(conn.relatedId), 
          type: getType(conn.relatedId)
        }
      });
    }

    // Arista
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

// Helpers

function normalizeId(raw: string): string {
  if (raw.startsWith("et-") || raw.startsWith("ley-") || raw.startsWith("dur-")) return raw;
  // Asumir que es un artículo del ET si es solo número
  if (/^\d/.test(raw) || raw.startsWith("art-")) {
    const num = raw.replace("art-", "");
    return `et-art-${num}`;
  }
  return raw;
}

function getType(id: string): string {
  if (id.startsWith("et-")) return "estatuto";
  if (id.startsWith("ley-")) return "ley";
  if (id.startsWith("dur-")) return "decreto";
  return "default";
}

function formatLabel(id: string): string {
  if (id.startsWith("et-art-")) return `Art. ${id.replace("et-art-", "")}`;
  if (id.startsWith("ley-")) {
    const parts = id.split("-");
    return `Ley ${parts[1]} (${parts[2]})`;
  }
  if (id.startsWith("dur-")) return "DUR 1625";
  return id;
}

function getGeneralGraphStructure(): GraphData {
  // Estructura estática de alto nivel para el mapa general
  const books = [
    { id: "libro-1", label: "Libro I: Renta", type: "libro" },
    { id: "libro-2", label: "Libro II: Retención", type: "libro" },
    { id: "libro-3", label: "Libro III: IVA", type: "libro" },
    { id: "libro-4", label: "Libro IV: Timbre", type: "libro" },
    { id: "libro-5", label: "Libro V: Procedimiento", type: "libro" },
    { id: "et-root", label: "Estatuto Tributario", type: "root" }
  ];

  const edges = books.filter(b => b.type === "libro").map(b => ({
    data: { source: "et-root", target: b.id, label: "contiene" }
  }));

  // Añadir algunos nodos clave de ejemplo conectados a los libros
  const examples = [
    { id: "et-art-240", label: "Art. 240 (Tarifa)", type: "estatuto", parent: "libro-1" },
    { id: "et-art-365", label: "Art. 365 (Retención)", type: "estatuto", parent: "libro-2" },
    { id: "et-art-420", label: "Art. 420 (Hecho Gen. IVA)", type: "estatuto", parent: "libro-3" },
    { id: "et-art-869", label: "Art. 869 (Abuso)", type: "estatuto", parent: "libro-5" }
  ];

  const exampleEdges = [
    { data: { source: "libro-1", target: "et-art-240", label: "contiene" } },
    { data: { source: "libro-2", target: "et-art-365", label: "contiene" } },
    { data: { source: "libro-3", target: "et-art-420", label: "contiene" } },
    { data: { source: "libro-5", target: "et-art-869", label: "contiene" } }
  ];

  return {
    nodes: [...books.map(b => ({ data: b })), ...examples.map(e => ({ data: e }))],
    edges: [...edges, ...exampleEdges]
  };
}
