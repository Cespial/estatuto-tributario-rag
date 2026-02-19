"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteEditor({ value, onChange }: NoteEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          Nota enriquecida
        </p>
        <div className="rounded-md border border-border bg-muted/30 p-0.5">
          <button
            onClick={() => setMode("edit")}
            className={clsx(
              "rounded px-2 py-1 text-xs",
              mode === "edit"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Editar
          </button>
          <button
            onClick={() => setMode("preview")}
            className={clsx(
              "rounded px-2 py-1 text-xs",
              mode === "preview"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Vista previa
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          className="min-h-[130px] w-full resize-y bg-transparent px-3 py-3 text-sm outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escriba su nota en Markdown. Ejemplo: **Importante**\n- Validar base UVT\n- Revisar Art. 383"
        />
      ) : (
        <div className="prose-chat min-h-[130px] px-3 py-3 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || "_Sin contenido para previsualizar._"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
