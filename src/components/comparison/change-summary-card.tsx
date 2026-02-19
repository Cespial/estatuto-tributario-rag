"use client";

import { DiffSummary } from "./diff-utils";

interface ChangeSummaryCardProps {
  summary: DiffSummary;
  labelA: string;
  labelB: string;
  articleA?: string;
  articleB?: string;
  aiSummary?: string;
}

function getChangeIntensity(changeRatio: number): string {
  if (changeRatio >= 0.35) return "Alta";
  if (changeRatio >= 0.15) return "Media";
  return "Baja";
}

function buildNarrative(
  summary: DiffSummary,
  labelA: string,
  labelB: string
): string {
  const { added, removed, modified } = summary.stats;
  const intensity = getChangeIntensity(summary.changeRatio);

  return `La comparación entre ${labelA} y ${labelB} muestra una intensidad de cambio ${intensity.toLowerCase()}, con ${added} adiciones, ${removed} eliminaciones y ${modified} modificaciones de redacción.`;
}

export function ChangeSummaryCard({
  summary,
  labelA,
  labelB,
  articleA,
  articleB,
  aiSummary,
}: ChangeSummaryCardProps) {
  const intensity = getChangeIntensity(summary.changeRatio);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="heading-serif text-xl">Resumen ejecutivo de cambios</h3>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">
          Intensidad: {intensity}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {aiSummary || buildNarrative(summary, labelA, labelB)}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/30">
          <p className="text-[11px] uppercase tracking-[0.05em] text-emerald-700 dark:text-emerald-300">
            Adiciones
          </p>
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">+{summary.stats.added}</p>
        </div>
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm dark:bg-red-950/30">
          <p className="text-[11px] uppercase tracking-[0.05em] text-red-700 dark:text-red-300">
            Eliminaciones
          </p>
          <p className="font-semibold text-red-900 dark:text-red-100">-{summary.stats.removed}</p>
        </div>
        <div className="rounded-md bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/30">
          <p className="text-[11px] uppercase tracking-[0.05em] text-amber-700 dark:text-amber-300">
            Modificaciones
          </p>
          <p className="font-semibold text-amber-900 dark:text-amber-100">~{summary.stats.modified}</p>
        </div>
      </div>

      {(articleA || articleB) && (
        <p className="mt-3 text-xs text-muted-foreground">
          Alcance: {articleA || "Artículo A"} {articleB ? `vs ${articleB}` : ""}
        </p>
      )}
    </div>
  );
}
