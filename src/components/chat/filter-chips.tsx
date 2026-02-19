"use client";

import { LIBROS } from "@/config/categories";

interface FilterChipsProps {
  selected: string | undefined;
  onChange: (libro: string | undefined) => void;
}

export function FilterChips({ selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(undefined)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !selected
            ? "border border-foreground bg-foreground text-background"
            : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
        }`}
      >
        Todos
      </button>
      {LIBROS.map((libro) => (
        <button
          key={libro.key}
          onClick={() =>
            onChange(selected === libro.key ? undefined : libro.key)
          }
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === libro.key
              ? "border border-foreground bg-foreground text-background"
              : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          {libro.label}
        </button>
      ))}
    </div>
  );
}
