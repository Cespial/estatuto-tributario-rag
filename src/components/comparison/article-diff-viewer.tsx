"use client";

import { useMemo } from "react";
import {
  buildSideBySideRows,
  computeWordDiff,
  summarizeDiff,
  type DiffSegment,
} from "./diff-utils";
import { clsx } from "clsx";

interface ArticleDiffViewerProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
  viewMode?: "inline" | "side-by-side";
  segments?: DiffSegment[];
}

export function ArticleDiffViewer({
  oldText,
  newText,
  oldLabel = "Versión Anterior",
  newLabel = "Versión Nueva",
  viewMode = "inline",
  segments: externalSegments,
}: ArticleDiffViewerProps) {
  const diff = useMemo(
    () => externalSegments || computeWordDiff(oldText, newText),
    [externalSegments, oldText, newText]
  );
  const summary = useMemo(() => summarizeDiff(diff), [diff]);
  const rows = useMemo(() => buildSideBySideRows(diff), [diff]);

  return (
    <div className="flex flex-col gap-4">
      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-red-100 ring-1 ring-red-200 dark:bg-red-950/40 dark:ring-red-900/60" />
            <span className="text-muted-foreground">{oldLabel} (Eliminación)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-900/60" />
            <span className="text-muted-foreground">{newLabel} (Adición)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-amber-100 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-900/60" />
            <span className="text-muted-foreground">Modificación</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          <span className="text-red-700 dark:text-red-300">-{summary.stats.removed}</span>
          <span className="text-emerald-700 dark:text-emerald-300">+{summary.stats.added}</span>
          <span className="text-amber-700 dark:text-amber-300">~{summary.stats.modified}</span>
        </div>
      </div>

      {/* Diff Content */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        {viewMode === "inline" ? (
          <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed text-foreground whitespace-pre-wrap font-sans">
            {diff.map((segment) => (
              <span key={segment.id} id={`diff-${segment.id}`} className="diff-anchor">
                <DiffSegmentComponent segment={segment} />
              </span>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-1/2 px-3 py-2 text-left text-xs uppercase tracking-[0.05em] text-muted-foreground">
                    {oldLabel}
                  </th>
                  <th className="w-1/2 px-3 py-2 text-left text-xs uppercase tracking-[0.05em] text-muted-foreground">
                    {newLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    id={`diff-${row.id}`}
                    className={clsx(
                      "align-top border-b border-border/50",
                      row.changeType === "added" && "bg-emerald-50/70 dark:bg-emerald-950/20",
                      row.changeType === "removed" && "bg-red-50/70 dark:bg-red-950/20",
                      row.changeType === "modified" && "bg-amber-50/70 dark:bg-amber-950/20"
                    )}
                  >
                    <td className="px-3 py-2 text-foreground">
                      {row.leftText || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {row.rightText || <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DiffSegmentComponent({ segment }: { segment: DiffSegment }) {
  if (segment.type === "added") {
    return (
      <span className="mx-0.5 inline rounded-sm bg-emerald-100 px-0.5 text-emerald-900 transition-colors dark:bg-emerald-950/50 dark:text-emerald-200">
        {segment.text}
      </span>
    );
  }

  if (segment.type === "removed") {
    return (
      <span className="mx-0.5 inline rounded-sm bg-red-100 px-0.5 text-red-900 line-through transition-colors dark:bg-red-950/50 dark:text-red-200">
        {segment.text}
      </span>
    );
  }

  if (segment.type === "modified") {
    return (
      <span
        className="mx-0.5 inline rounded-sm bg-amber-100 px-0.5 text-amber-900 transition-colors dark:bg-amber-950/50 dark:text-amber-200"
        title={`Antes: ${segment.oldText || ""}\nDespués: ${segment.newText || segment.text}`}
      >
        {segment.newText || segment.text}
      </span>
    );
  }

  return <span className="text-foreground transition-colors">{segment.text}</span>;
}
