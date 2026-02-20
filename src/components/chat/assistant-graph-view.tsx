"use client";

import { useEffect, useState, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface AssistantGraphViewProps {
  articleIds: string[];
  theme?: "light" | "dark";
}

export function AssistantGraphView({ articleIds, theme = "light" }: AssistantGraphViewProps) {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Colors based on globals.css
  const colors = {
    estatuto: theme === "light" ? "#0f0e0d" : "#fafaf9",
    ley: "#38A169",
    decreto: "#DD6B20",
    edge: theme === "light" ? "#e5e5e3" : "#33312c",
    text: theme === "light" ? "#706d66" : "#8f8b85",
    bg: theme === "light" ? "#fafaf9" : "#0f0e0d",
  };

  const stylesheet: any = [
    {
      selector: "node",
      style: {
        "background-color": colors.estatuto,
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 6,
        color: colors.text,
        "font-size": "10px",
        "font-family": "var(--font-geist-sans)",
        width: 25,
        height: 25,
        "transition-property": "background-color, width, height",
        "transition-duration": "0.3s"
      }
    },
    {
      selector: "node[type = 'ley']",
      style: { "background-color": colors.ley }
    },
    {
      selector: "node[type = 'decreto']",
      style: { "background-color": colors.decreto }
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": colors.edge,
        "target-arrow-color": colors.edge,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "opacity": 0.6
      }
    }
  ];

  useEffect(() => {
    if (articleIds.length === 0) return;

    const fetchSubGraph = async () => {
      setLoading(true);
      try {
        // Query the first detected article for now, or all if API supports it
        const res = await fetch(`/api/tax-graph?q=${encodeURIComponent(articleIds[0])}`);
        const data = await res.json();
        setGraphData(data);
      } catch (err) {
        console.error("Failed to fetch assistant graph:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubGraph();
  }, [articleIds]);

  if (articleIds.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <Network className="w-12 h-12 text-muted-foreground opacity-20" />
        <p className="text-sm text-muted-foreground max-w-[240px]">
          Las conexiones legales aparecerán aquí cuando menciones artículos del Estatuto.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-background flex flex-col">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="flex-1">
        {graphData && (
          <CytoscapeComponent
            elements={CytoscapeComponent.normalizeElements(graphData)}
            style={{ width: "100%", height: "100%" }}
            stylesheet={stylesheet}
            layout={{ 
              name: "cose", 
              animate: true,
              componentSpacing: 60,
              nodeRepulsion: 10000 
            }}
            cy={(cy) => {
              cy.userZoomingEnabled(true);
            }}
          />
        )}
      </div>

      {/* Mini Legend */}
      <div className="p-3 border-t border-border flex gap-4 justify-center">
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-primary"></span> Estatuto
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-600"></span> Leyes
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-orange-600"></span> Decretos
        </span>
      </div>
    </div>
  );
}
