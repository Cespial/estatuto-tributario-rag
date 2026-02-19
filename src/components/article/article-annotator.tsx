"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import { Highlighter, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useNotes } from "@/hooks/useNotes";
import type { NoteHighlight } from "@/types/productivity";

interface ArticleAnnotatorProps {
  targetId: string;
  children: ReactNode;
}

const COLOR_STYLES: Record<
  NoteHighlight["color"],
  { chip: string; border: string; label: string }
> = {
  amber: {
    chip: "bg-amber-100 text-amber-700 border-amber-200",
    border: "border-l-amber-400",
    label: "Ámbar",
  },
  blue: {
    chip: "bg-sky-100 text-sky-700 border-sky-200",
    border: "border-l-sky-400",
    label: "Azul",
  },
  green: {
    chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-400",
    label: "Verde",
  },
  rose: {
    chip: "bg-rose-100 text-rose-700 border-rose-200",
    border: "border-l-rose-400",
    label: "Rosado",
  },
};

export function ArticleAnnotator({ targetId, children }: ArticleAnnotatorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { getHighlightsFor, addHighlight, removeHighlight } = useNotes();

  const highlights = getHighlightsFor(targetId);
  const [selectedText, setSelectedText] = useState("");
  const [selectedColor, setSelectedColor] =
    useState<NoteHighlight["color"]>("amber");
  const [highlightNote, setHighlightNote] = useState("");

  const hasSelection = selectedText.length > 0;
  const summary = useMemo(
    () => `${highlights.length} resaltado${highlights.length === 1 ? "" : "s"}`,
    [highlights.length]
  );

  const handleCaptureSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || "";
    if (!text || text.length < 6) return;
    const anchor = selection?.anchorNode;
    if (!anchor || !containerRef.current?.contains(anchor)) return;
    setSelectedText(text.slice(0, 600));
  };

  const handleSaveHighlight = () => {
    if (!selectedText) return;
    addHighlight(targetId, {
      text: selectedText,
      color: selectedColor,
      note: highlightNote.trim() || undefined,
    });
    setSelectedText("");
    setHighlightNote("");
  };

  return (
    <section className="mb-6">
      <div ref={containerRef} onMouseUp={handleCaptureSelection}>
        {children}
      </div>

      <div className="mt-4 rounded-lg border border-border/60 bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Resaltados y anotaciones
          </p>
          <span className="text-xs text-muted-foreground">{summary}</span>
        </div>

        {hasSelection && (
          <div className="mb-3 rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              Texto seleccionado
            </p>
            <p className="mt-1 line-clamp-3 text-sm">{selectedText}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {(Object.keys(COLOR_STYLES) as NoteHighlight["color"][]).map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={clsx(
                      "rounded-full border px-2 py-0.5 text-xs transition-colors",
                      COLOR_STYLES[color].chip,
                      selectedColor === color
                        ? "ring-1 ring-foreground/40"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    {COLOR_STYLES[color].label}
                  </button>
                )
              )}
            </div>

            <textarea
              value={highlightNote}
              onChange={(event) => setHighlightNote(event.target.value)}
              placeholder="Anotación opcional..."
              className="mt-2 min-h-[68px] w-full rounded border border-border bg-card px-2 py-1.5 text-sm outline-none focus:border-foreground/40"
            />

            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedText("");
                  setHighlightNote("");
                }}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHighlight}
                className="inline-flex items-center gap-1.5 rounded bg-foreground px-3 py-1.5 text-xs font-medium text-background"
              >
                <Highlighter className="h-3.5 w-3.5" />
                Guardar resaltado
              </button>
            </div>
          </div>
        )}

        {highlights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Seleccione cualquier fragmento del contenido vigente y guarde su
            anotación.
          </p>
        ) : (
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className={clsx(
                  "rounded-md border border-border bg-muted/20 p-3",
                  "border-l-4",
                  COLOR_STYLES[highlight.color].border
                )}
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="text-sm">{highlight.text}</p>
                  <button
                    onClick={() => removeHighlight(targetId, highlight.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Eliminar resaltado"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {highlight.note && (
                  <p className="text-xs text-muted-foreground">{highlight.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
