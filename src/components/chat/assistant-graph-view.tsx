"use client";

import { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Network, Globe, Map as MapIcon, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface AssistantGraphViewProps {
  articleIds: string[];
  theme?: "light" | "dark";
}

export function AssistantGraphView({ articleIds, theme = "light" }: AssistantGraphViewProps) {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"context" | "general">("context");

  // Colors based on globals.css
  const colors = {
    estatuto: theme === "light" ? "#0f0e0d" : "#fafaf9",
    ley: "#38A169",
    decreto: "#DD6B20",
    libro: "#3182CE",
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
      selector: "node[type = 'libro']",
      style: { 
        "background-color": colors.libro,
        width: 40,
        height: 40,
        "font-size": "12px",
        "font-weight": "bold"
      }
    },
    {
      selector: "node[type = 'root']",
      style: { 
        "background-color": colors.estatuto,
        width: 50,
        height: 50,
        "font-size": "14px",
        "font-weight": "bold"
      }
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
    // Si no hay artículos, forzar vista general
    if (articleIds.length === 0 && viewMode === "context") {
      setViewMode("general");
    }
  }, [articleIds]);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      try {
        let url = "/api/tax-graph";
        
        if (viewMode === "general") {
          url += "?mode=general";
        } else if (articleIds.length > 0) {
          // Join IDs for multi-node query
          const idsParam = articleIds.join(",");
          url += `?ids=${encodeURIComponent(idsParam)}`;
        } else {
          // Fallback to general if context is empty
          url += "?mode=general";
        }

        const res = await fetch(url);
        const data = await res.json();
        setGraphData(data);
      } catch (err) {
        console.error("Failed to fetch assistant graph:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [articleIds, viewMode]);

  return (
    <div className="h-full w-full relative bg-background flex flex-col group">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm transition-opacity">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      
      {/* View Toggle - Floating */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-card/80 backdrop-blur border border-border p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setViewMode("context")}
          disabled={articleIds.length === 0}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-full transition-all",
            viewMode === "context" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground disabled:opacity-50"
          )}
        >
          <Network className="w-3 h-3" />
          Contexto
        </button>
        <button
          onClick={() => setViewMode("general")}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-full transition-all",
            viewMode === "general" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="w-3 h-3" />
          Mapa General
        </button>
      </div>

      <div className="flex-1">
        {graphData && (
          <CytoscapeComponent
            elements={CytoscapeComponent.normalizeElements(graphData)}
            style={{ width: "100%", height: "100%" }}
            stylesheet={stylesheet}
            layout={{ 
              name: viewMode === "general" ? "breadthfirst" : "cose", 
              animate: true,
              animationDuration: 500,
              padding: 20,
              componentSpacing: 60,
              nodeRepulsion: 10000,
              // Specific options for breadthfirst (tree-like)
              directed: true,
              circle: false,
              spacingFactor: 1.5,
            }}
            cy={(cy) => {
              cy.userZoomingEnabled(true);
              cy.minZoom(0.5);
              cy.maxZoom(2);
            }}
          />
        )}
      </div>

      {/* Mini Legend */}
      <div className="p-3 border-t border-border flex gap-4 justify-center bg-card/50 backdrop-blur-sm">
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
