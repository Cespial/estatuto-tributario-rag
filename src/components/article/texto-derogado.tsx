"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface TextoDerogadoItem {
  index: number;
  snippet: string;
  full_length: number;
  norma_ref?: string;
}

interface TextoDerogadoProps {
  items: TextoDerogadoItem[];
  textoDerogadoRaw: (string | unknown)[];
}

export function TextoDerogado({ items, textoDerogadoRaw }: TextoDerogadoProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (items.length === 0) return null;

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <section className="mb-6">
      <h2 className="font-[family-name:var(--font-playfair)] mb-3 text-lg font-semibold tracking-tight">
        Versiones anteriores ({items.length})
      </h2>
      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = expanded.has(item.index);
          const fullText = textoDerogadoRaw[item.index]
            ? String(textoDerogadoRaw[item.index])
            : item.snippet;

          return (
            <div
              key={item.index}
              className="rounded-lg border border-border"
            >
              <button
                onClick={() => toggle(item.index)}
                className="flex w-full items-center gap-2 p-3 text-left text-sm hover:bg-muted/50"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="font-medium">
                  Version {item.index + 1}
                  {item.norma_ref && (
                    <span className="ml-2 text-muted-foreground">
                      ({item.norma_ref})
                    </span>
                  )}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.full_length.toLocaleString()} chars
                </span>
              </button>
              <div
                className={clsx(
                  "overflow-hidden border-t border-border transition-all",
                  isOpen ? "max-h-[500px] overflow-y-auto" : "max-h-0 border-t-0"
                )}
              >
                <p className="whitespace-pre-wrap p-3 text-sm text-muted-foreground">
                  {fullText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
