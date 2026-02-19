"use client";

import { useMemo, useState } from "react";
import { computeWordDiff, countChanges } from "@/components/comparison/diff-utils";

interface ArticleInlineDiffProps {
  vigenteTexto: string;
  versionesAnteriores: string[];
}

export function ArticleInlineDiff({
  vigenteTexto,
  versionesAnteriores,
}: ArticleInlineDiffProps) {
  const [selectedVersion, setSelectedVersion] = useState(0);
  const hasVersions = versionesAnteriores.length > 0 && Boolean(vigenteTexto);
  const baseText = versionesAnteriores[selectedVersion] || versionesAnteriores[0] || "";
  const diffSegments = useMemo(
    () => (hasVersions ? computeWordDiff(baseText, vigenteTexto) : []),
    [baseText, hasVersions, vigenteTexto]
  );
  const changes = useMemo(() => countChanges(diffSegments), [diffSegments]);

  if (!hasVersions) return null;

  return (
    <section className="mb-6 rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="heading-serif text-lg">Texto original vs texto vigente</h2>
        <div className="text-xs text-muted-foreground">
          +{changes.added} / -{changes.removed} palabras
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {versionesAnteriores.slice(0, 6).map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedVersion(index)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              selectedVersion === index
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Versión {index + 1}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-muted ring-1 ring-border line-through" />
          Texto eliminado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-foreground/10 ring-1 ring-foreground/40 underline" />
          Texto adicionado
        </span>
      </div>

      <div className="max-h-[360px] overflow-auto rounded border border-border bg-muted/20 p-3 text-sm leading-relaxed">
        {diffSegments.map((segment, index) => {
          if (segment.type === "added") {
            return (
              <span
                key={index}
                className="mx-0.5 inline rounded-sm bg-foreground/10 px-0.5 underline decoration-foreground/40"
              >
                {segment.text}
              </span>
            );
          }
          if (segment.type === "removed") {
            return (
              <span
                key={index}
                className="mx-0.5 inline rounded-sm bg-muted px-0.5 text-muted-foreground line-through"
              >
                {segment.text}
              </span>
            );
          }
          return <span key={index}>{segment.text} </span>;
        })}
      </div>
    </section>
  );
}
