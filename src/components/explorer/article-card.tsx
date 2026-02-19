"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useArticlePanel } from "@/contexts/article-panel-context";

interface ArticleCardProps {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  estado: string;
  totalMods: number;
  totalRefs: number;
  totalReferencedBy: number;
  complexity: number;
  hasNormas: boolean;
}

const ESTADO_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  vigente: {
    label: "Vigente",
    dot: "bg-foreground",
    badge: "bg-muted text-foreground border border-border",
  },
  modificado: {
    label: "Modificado",
    dot: "bg-foreground/60",
    badge: "bg-muted text-foreground border border-border",
  },
  derogado: {
    label: "Derogado",
    dot: "bg-foreground/30",
    badge: "bg-muted text-muted-foreground border border-border",
  },
};

export function ArticleCard({
  id,
  slug,
  titulo,
  libro,
  estado,
  totalMods,
  totalRefs,
  totalReferencedBy,
  complexity,
  hasNormas,
}: ArticleCardProps) {
  const { openPanel } = useArticlePanel();
  const estadoCfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.vigente;

  return (
    <div
      className="group flex cursor-pointer flex-col rounded-lg border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-px hover:border-border hover:shadow"
      onClick={() => openPanel(slug)}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <span className="text-sm font-semibold text-foreground">{id}</span>
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            estadoCfg.badge
          )}
        >
          {estadoCfg.label}
        </span>
      </div>
      {/* Title */}
      <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-tight">
        {titulo}
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">{libro}</p>
      {/* Stats row */}
      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
        {totalMods > 0 && <span>{totalMods} mods</span>}
        {totalRefs > 0 && <span>{totalRefs} refs</span>}
        {totalReferencedBy > 0 && <span>{totalReferencedBy} cited</span>}
        {hasNormas && <span>normas</span>}
        <span className="ml-auto">{complexity}/10</span>
      </div>
      {/* Complexity bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/40 transition-all"
          style={{ width: `${complexity * 10}%` }}
        />
      </div>
      {/* Full link */}
      <Link
        href={`/articulo/${slug}`}
        className="mt-2 text-xs text-foreground opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        Ver ficha completa →
      </Link>
    </div>
  );
}
