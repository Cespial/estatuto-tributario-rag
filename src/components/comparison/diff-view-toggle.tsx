"use client";

import { clsx } from "clsx";

export type DiffViewMode = "inline" | "side-by-side";

interface DiffViewToggleProps {
  mode: DiffViewMode;
  onChange: (mode: DiffViewMode) => void;
}

export function DiffViewToggle({ mode, onChange }: DiffViewToggleProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-1">
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => onChange("inline")}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "inline"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Inline
        </button>
        <button
          onClick={() => onChange("side-by-side")}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "side-by-side"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Lado a lado
        </button>
      </div>
    </div>
  );
}
