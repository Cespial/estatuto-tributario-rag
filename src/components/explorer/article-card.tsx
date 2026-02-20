"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useArticlePanel } from "@/contexts/article-panel-context";
import { ET_BOOK_COLOR_MAP } from "@/lib/constants/et-books";

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
  ultimaModYear?: number | null;
  hasDerogadoText?: boolean;
  previewSnippet?: string;
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
  ultimaModYear = null,
  hasDerogadoText = false,
  previewSnippet = "",
}: ArticleCardProps) {
  const { openPanel } = useArticlePanel();
  const estadoCfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.vigente;
  const libroColor = ET_BOOK_COLOR_MAP[libro] || "#6b7280";
  const badges = [
    ultimaModYear ? `Modificado ${ultimaModYear}` : null,
    hasDerogadoText ? "Con texto derogado" : null,
    hasNormas ? "Con normas" : null,
  ].filter(Boolean) as string[];

  const cleanSnippet = previewSnippet
    ? previewSnippet.replace(/<[^>]*>/g, "").slice(0, 100) + (previewSnippet.length > 100 ? "..." : "")
    : "";

  return (
    <div
      className="group flex cursor-pointer flex-col rounded-lg border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-px hover:border-border hover:shadow"
      onClick={() => openPanel(slug)}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: libroColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-foreground">{id}</span>
        </div>
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
      <p className="mb-2 text-xs text-muted-foreground">{libro}</p>

      {cleanSnippet && (
        <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/80">
          {cleanSnippet}
        </p>
      )}

      {badges.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {badges.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
        {totalMods > 0 && <span>{totalMods} mods</span>}
        {totalRefs > 0 && <span>{totalRefs} refs</span>}
        {totalReferencedBy > 0 && <span>{totalReferencedBy} cited</span>}
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
