"use client";

import { useMemo } from "react";
import { ENRICHED_GLOSARIO } from "@/lib/knowledge/knowledge-index";
import { TermTooltip } from "@/components/knowledge/TermTooltip";

interface InteractiveTaxTextProps {
  text: string;
  className?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TERM_ALIASES = ENRICHED_GLOSARIO.flatMap((term) => [
  { key: term.termino.toLowerCase(), term },
  ...term.aliases.map((alias) => ({ key: alias.toLowerCase(), term })),
]);

const ALIAS_LOOKUP = new Map(TERM_ALIASES.map((item) => [item.key, item.term]));
const PATTERN = TERM_ALIASES.map((item) => escapeRegExp(item.key)).sort(
  (a, b) => b.length - a.length
);
const TERM_REGEX = new RegExp(`(${PATTERN.join("|")})`, "gi");

export function InteractiveTaxText({ text, className }: InteractiveTaxTextProps) {
  const nodes = useMemo(() => {
    if (!text.trim()) return text;

    const parts = text.split(TERM_REGEX);

    return parts.map((part, index) => {
      const term = ALIAS_LOOKUP.get(part.toLowerCase());

      if (!term) {
        return <span key={`plain-${index}`}>{part}</span>;
      }

      return (
        <TermTooltip key={`term-${index}-${term.id}`} term={term}>
          {part}
        </TermTooltip>
      );
    });
  }, [text]);

  return <span className={className}>{nodes}</span>;
}
