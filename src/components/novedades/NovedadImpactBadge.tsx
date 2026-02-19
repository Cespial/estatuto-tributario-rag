"use client";

import { clsx } from "clsx";
import type { NovedadImpactoVisual } from "@/config/novedades-data";

interface NovedadImpactBadgeProps {
  impacto: NovedadImpactoVisual;
}

const CONFIG: Record<NovedadImpactoVisual, { label: string; className: string }> = {
  alto: {
    label: "Impacto alto",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200",
  },
  medio: {
    label: "Impacto medio",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-200",
  },
  informativo: {
    label: "Informativo",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-900/30 dark:text-sky-200",
  },
};

export function NovedadImpactBadge({ impacto }: NovedadImpactBadgeProps) {
  const config = CONFIG[impacto];
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

