"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenText, Calculator, FileText } from "lucide-react";
import { clsx } from "clsx";
import type { GlosarioTermEnriched } from "@/types/knowledge";

interface TermTooltipProps {
  term: GlosarioTermEnriched;
  children?: React.ReactNode;
  className?: string;
}

export function TermTooltip({ term, children, className }: TermTooltipProps) {
  const [open, setOpen] = useState(false);

  const firstCalculator = useMemo(
    () => term.relacionadasCalculadoras[0],
    [term.relacionadasCalculadoras]
  );

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        className={clsx(
          "inline-flex cursor-help items-center rounded-sm border-b border-dotted border-foreground/40 px-0.5 text-foreground/90 outline-none hover:border-foreground",
          className
        )}
      >
        {children ?? term.termino}
      </span>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-80 rounded-lg border border-border/70 bg-card p-3 shadow-lg">
          <p className="heading-serif text-base text-foreground">{term.termino}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            En palabras simples
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {term.explicacionSimple}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(term.articulos ?? []).slice(0, 2).map((article) => (
              <Link
                key={article}
                href={`/articulo/${article}`}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-muted"
              >
                <FileText className="h-3 w-3" />
                Art. {article}
              </Link>
            ))}
            {firstCalculator && (
              <Link
                href={firstCalculator}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-muted"
              >
                <Calculator className="h-3 w-3" />
                Calculadora
              </Link>
            )}
            <Link
              href={`/glosario?q=${encodeURIComponent(term.termino)}`}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-muted"
            >
              <BookOpenText className="h-3 w-3" />
              Ver término
            </Link>
          </div>
        </div>
      )}
    </span>
  );
}
