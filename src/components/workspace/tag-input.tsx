"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

function normalizeTag(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase().replace(/^#/, "");
  if (!cleaned) return null;
  return `#${cleaned}`;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "#renta #iva #urgente",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const normalized = normalizeTag(raw);
    if (!normalized || tags.includes(normalized)) return;
    onChange([...tags, normalized]);
  };

  return (
    <div className="rounded-md border border-border/60 bg-card p-2">
      <div className="mb-2 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((item) => item !== tag))}
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label={`Quitar ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            addTag(input);
            setInput("");
          } else if (e.key === "Backspace" && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-border/40 bg-muted/40 px-2 py-1.5 text-sm outline-none focus:border-foreground/30"
      />
    </div>
  );
}
