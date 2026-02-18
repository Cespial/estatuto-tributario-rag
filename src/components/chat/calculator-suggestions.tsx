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
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {suggestions.map((calc) => (
        <Link
          key={calc.href}
          href={calc.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Calculator className="h-3 w-3" />
          {calc.name}
        </Link>
      ))}
    </div>
  );
}
