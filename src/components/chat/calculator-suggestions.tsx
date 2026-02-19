"use client";
import Link from "next/link";
import { Calculator } from "lucide-react";
import type { CalculatorSuggestion } from "@/lib/chat/calculator-context";

interface CalculatorSuggestionsProps {
  suggestions: CalculatorSuggestion[];
}

export function CalculatorSuggestions({ suggestions }: CalculatorSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-border/40 px-4 py-3">
      <p className="mb-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">Calculadoras sugeridas</p>
      <div className="flex flex-wrap gap-2">
      {suggestions.map((calc) => (
        <Link
          key={calc.href}
          href={calc.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          title={calc.description}
        >
          <Calculator className="h-3 w-3" />
          {calc.name}
        </Link>
      ))}
      </div>
    </div>
  );
}
