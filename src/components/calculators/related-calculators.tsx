"use client";

import Link from "next/link";
import {
  CALCULATORS_BY_ID,
  CALCULATORS_CATALOG,
} from "@/config/calculators-catalog";
import { trackCalculatorUsage } from "@/lib/calculators/popularity";

interface RelatedCalculatorsProps {
  currentId: string;
  relatedIds?: string[];
}

export function RelatedCalculators({
  currentId,
  relatedIds,
}: RelatedCalculatorsProps) {
  const source = relatedIds && relatedIds.length > 0
    ? relatedIds
    : CALCULATORS_BY_ID[currentId]?.related ?? [];

  const related = source
    .map((id) => CALCULATORS_BY_ID[id])
    .filter(Boolean)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-3 heading-serif text-lg">Calculadoras relacionadas</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {related.map((calc) => (
          <Link
            key={calc.id}
            href={calc.href}
            onClick={() => trackCalculatorUsage(calc.id)}
            className="rounded-lg border border-border/60 bg-card p-4 text-sm transition-colors hover:bg-muted/40"
          >
            <p className="font-semibold text-foreground">{calc.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {calc.description}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Basado en afinidad de uso dentro de las {CALCULATORS_CATALOG.length} calculadoras disponibles.
      </div>
    </div>
  );
}
