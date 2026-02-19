"use client";

import { DiffSegment } from "./diff-utils";
import { clsx } from "clsx";

interface DiffMinimapProps {
  segments: DiffSegment[];
}

function changeColor(type: DiffSegment["type"]): string {
  if (type === "added") return "bg-emerald-500";
  if (type === "removed") return "bg-red-500";
  if (type === "modified") return "bg-amber-500";
  return "bg-transparent";
}

export function DiffMinimap({ segments }: DiffMinimapProps) {
  const changed = segments.filter((segment) => segment.type !== "same");

  if (changed.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        Sin cambios detectados.
      </div>
    );
  }

  const total = segments.length || 1;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
        Mapa de cambios
      </p>
      <div className="relative h-56 rounded bg-muted/40">
        {changed.map((segment) => {
          const index = segments.findIndex((item) => item.id === segment.id);
          const top = Math.max(0, Math.min(100, (index / total) * 100));
          return (
            <button
              key={segment.id}
              onClick={() => {
                const target = document.getElementById(`diff-${segment.id}`);
                target?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={clsx(
                "absolute left-0 right-0 h-1 rounded transition-opacity hover:opacity-80",
                changeColor(segment.type)
              )}
              style={{ top: `${top}%` }}
              title={`${segment.type.toUpperCase()}: ${segment.text.slice(0, 120)}`}
              aria-label={`Ir al cambio ${segment.id}`}
            />
          );
        })}
      </div>
    </div>
  );
}
