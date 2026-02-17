"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph2D = dynamic(() => import("react-force-graph-2d") as any, {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Cargando grafo...
    </div>
  ),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

interface GraphNode {
  id: string;
  label: string;
  titulo: string;
  libro: string;
  estado: string;
  complexity: number;
  refs_out: number;
  refs_in: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface RelationshipGraphProps {
  data: GraphData;
  maxNodes?: number;
}

const LIBRO_COLORS: Record<string, string> = {
  "Titulo Preliminar": "#6b7280",
  "Libro I - Renta": "#2563eb",
  "Libro II - Retencion": "#dc2626",
  "Libro III - IVA": "#16a34a",
  "Libro IV - Timbre": "#ca8a04",
  "Libro V - Procedimiento": "#9333ea",
  "Libro VI - GMF": "#0891b2",
};

export function RelationshipGraph({ data, maxNodes = 200 }: RelationshipGraphProps) {
  const router = useRouter();

  // Limit nodes to top N most connected
  const graphData = useMemo(() => {
    const topNodes = data.nodes.slice(0, maxNodes);
    const nodeIds = new Set(topNodes.map((n) => n.id));
    const filteredEdges = data.edges.filter(
      (e) => nodeIds.has(e.source as string) && nodeIds.has(e.target as string)
    );
    return {
      nodes: topNodes,
      links: filteredEdges.map((e) => ({ source: e.source, target: e.target })),
    };
  }, [data, maxNodes]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    if (node.id) router.push(`/articulo/${node.id}`);
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => {
    return LIBRO_COLORS[node.libro] || "#6b7280";
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeVal = useCallback((node: any) => {
    return 3 + (node.complexity || 0) * 0.8;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeLabel = useCallback((node: any) => {
    return `${node.label}: ${node.titulo}\n(${node.libro}, ${node.estado})`;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = 3 + (node.complexity || 0) * 0.8;
    const color = LIBRO_COLORS[node.libro] || "#6b7280";

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (globalScale > 2) {
      ctx.font = `${10 / globalScale}px sans-serif`;
      ctx.fillStyle = "#888";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + size + 8 / globalScale);
    }
  }, []);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg border border-border bg-background">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={nodeLabel}
        nodeColor={nodeColor}
        nodeVal={nodeVal}
        linkColor={() => "rgba(128,128,128,0.3)"}
        linkWidth={0.5}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        nodeCanvasObject={nodeCanvasObject}
      />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-lg bg-background/90 p-2 text-xs backdrop-blur-sm">
        {Object.entries(LIBRO_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{name.replace("Libro ", "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
