"use client";

import { ExternalLink } from "lucide-react";

interface SourceCitationProps {
  idArticulo: string;
  titulo: string;
  url: string;
  categoriaLibro: string;
}

export function SourceCitation({
  idArticulo,
  url,
  categoriaLibro,
}: SourceCitationProps) {
  const shortLibro = categoriaLibro.split(" - ")[0] || categoriaLibro;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {idArticulo}
      <span className="hidden text-muted-foreground sm:inline">
        · {shortLibro}
      </span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
