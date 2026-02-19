"use client";

import { clsx } from "clsx";

export type ComparisonMode = "historical" | "cross-article";

interface ComparisonModeToggleProps {
  mode: ComparisonMode;
  onChange: (mode: ComparisonMode) => void;
}

export function ComparisonModeToggle({ mode, onChange }: ComparisonModeToggleProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-1">
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => onChange("historical")}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "historical"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Mismo artículo
        </button>
        <button
          onClick={() => onChange("cross-article")}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "cross-article"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Artículo vs Artículo
        </button>
      </div>
    </div>
  );
}
