"use client";

import { Info } from "lucide-react";

interface RetentionConceptTooltipProps {
  text?: string;
}

export function RetentionConceptTooltip({ text }: RetentionConceptTooltipProps) {
  if (!text) return null;

  return (
    <span className="group relative inline-flex align-middle">
      <Info className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-52 -translate-x-1/2 rounded-md border border-border bg-card p-2 text-[11px] text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
