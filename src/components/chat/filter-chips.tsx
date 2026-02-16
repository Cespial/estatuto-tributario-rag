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
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
          !selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-border"
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
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            selected === libro.key
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          {libro.label}
        </button>
      ))}
    </div>
  );
}
