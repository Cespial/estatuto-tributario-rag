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
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-2 border-b border-border bg-muted/50 font-medium text-xs uppercase tracking-wider text-muted-foreground">
              <div className="px-4 py-2 border-r border-border">{oldLabel}</div>
              <div className="px-4 py-2">{newLabel}</div>
            </div>
            <div className="divide-y divide-border/40">
              {rows.map((row) => (
                <div
                  key={row.id}
                  id={`diff-${row.id}`}
                  className={clsx(
                    "grid grid-cols-2 group",
                    row.changeType === "added" && "bg-emerald-50/40 dark:bg-emerald-950/10",
                    row.changeType === "removed" && "bg-red-50/40 dark:bg-red-950/10",
                    row.changeType === "modified" && "bg-amber-50/40 dark:bg-amber-950/10"
                  )}
                >
                  <div className="px-4 py-3 text-sm leading-relaxed border-r border-border/40 min-h-[1.5rem] whitespace-pre-wrap font-sans">
                    {row.changeType === "added" ? (
                      <span className="opacity-0">—</span>
                    ) : (
                      <span className={clsx(
                        row.changeType === "removed" && "text-red-900 dark:text-red-200 line-through decoration-red-500/50",
                        row.changeType === "modified" && "text-amber-900 dark:text-amber-200"
                      )}>
                        {row.leftText}
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 text-sm leading-relaxed min-h-[1.5rem] whitespace-pre-wrap font-sans">
                    {row.changeType === "removed" ? (
                      <span className="opacity-0">—</span>
                    ) : (
                      <span className={clsx(
                        row.changeType === "added" && "text-emerald-900 dark:text-emerald-200 font-medium",
                        row.changeType === "modified" && "text-amber-900 dark:text-amber-200 font-medium"
                      )}>
                        {row.rightText}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
