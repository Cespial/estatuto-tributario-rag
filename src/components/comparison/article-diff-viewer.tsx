"use client";

import { useMemo } from "react";
import { computeWordDiff, type DiffSegment } from "./diff-utils";

interface ArticleDiffViewerProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
}

export function ArticleDiffViewer({
  oldText,
  newText,
  oldLabel = "Versión Anterior",
  newLabel = "Versión Nueva"
}: ArticleDiffViewerProps) {
  const diff = useMemo(() => computeWordDiff(oldText, newText), [oldText, newText]);

  const stats = useMemo(() => {
    return diff.reduce(
      (acc, segment) => {
        if (segment.type === "added") acc.added += segment.text.trim() ? segment.text.split(/\s+/).length : 0;
        if (segment.type === "removed") acc.removed += segment.text.trim() ? segment.text.split(/\s+/).length : 0;
        return acc;
      },
      { added: 0, removed: 0 }
    );
  }, [diff]);

  return (
    <div className="flex flex-col gap-4">
      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-muted ring-1 ring-border line-through" />
            <span className="text-muted-foreground">{oldLabel} (Eliminado)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-foreground/10 ring-1 ring-foreground/40 underline" />
            <span className="text-muted-foreground">{newLabel} (Adicionado)</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-muted-foreground">-{stats.removed} palabras</span>
          <span className="text-foreground">+{stats.added} palabras</span>
        </div>
      </div>

      {/* Diff Content */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed text-foreground whitespace-pre-wrap font-sans">
          {diff.map((segment, idx) => (
            <DiffSegmentComponent key={idx} segment={segment} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiffSegmentComponent({ segment }: { segment: DiffSegment }) {
  if (segment.type === "added") {
    return (
      <span className="bg-foreground/10 underline decoration-foreground/40 rounded-sm px-0.5 mx-0.5 inline transition-colors">
        {segment.text}
      </span>
    );
  }

  if (segment.type === "removed") {
    return (
      <span className="bg-muted line-through text-muted-foreground rounded-sm px-0.5 mx-0.5 inline transition-colors">
        {segment.text}
      </span>
    );
  }

  return <span className="text-foreground transition-colors">{segment.text}</span>;
}
