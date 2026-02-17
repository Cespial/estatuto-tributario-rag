"use client";

import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { useArticlePanel } from "@/contexts/article-panel-context";

interface SourceCitationProps {
  idArticulo: string;
  titulo: string;
  url: string;
  categoriaLibro: string;
  estado?: "vigente" | "modificado" | "derogado";
  slug?: string;
}

const ESTADO_DOT: Record<string, string> = {
  vigente: "bg-green-500",
  modificado: "bg-yellow-500",
  derogado: "bg-red-500",
};

export function SourceCitation({
  idArticulo,
  url,
  categoriaLibro,
  estado,
  slug,
}: SourceCitationProps) {
  const { openPanel } = useArticlePanel();
  const shortLibro = categoriaLibro.split(" - ")[0] || categoriaLibro;

  const handleClick = (e: React.MouseEvent) => {
    if (slug) {
      e.preventDefault();
      openPanel(slug);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        {estado && (
          <span
            className={clsx(
              "h-1.5 w-1.5 rounded-full",
              ESTADO_DOT[estado] || "bg-gray-500"
            )}
          />
        )}
        {idArticulo}
        <span className="hidden text-muted-foreground sm:inline">
          · {shortLibro}
        </span>
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Ver en estatuto.co"
      >
        <ExternalLink className="h-3 w-3" />
      </a>
    </span>
  );
}
