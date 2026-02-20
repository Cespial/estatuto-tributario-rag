"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { getFormalBookLabel } from "@/lib/constants/et-books";
import { Printer, GitCompare } from "lucide-react";

interface ArticleHeaderProps {
  idArticulo: string;
  titulo: string;
  tituloCort: string;
  slug: string;
  libro: string;
  libroFull: string;
  estado: string;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  vigente: { label: "Vigente", color: "bg-muted text-foreground border border-border" },
  modificado: { label: "Modificado", color: "bg-muted text-foreground border border-border" },
  derogado: { label: "Derogado", color: "bg-muted text-muted-foreground border border-border line-through" },
};

export function ArticleHeader({ idArticulo, titulo, slug, libro, libroFull, estado }: ArticleHeaderProps) {
  const estadoConfig = ESTADO_CONFIG[estado] || ESTADO_CONFIG.vigente;
  const breadcrumbLibro = getFormalBookLabel(libro).split(":")[0];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/explorador" className="hover:text-foreground">
            Explorador
          </Link>
          <span>/</span>
          <span>{breadcrumbLibro}</span>
          <span>/</span>
          <span className="text-foreground">{idArticulo}</span>
        </nav>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Printer className="h-3.5 w-3.5" />
            PDF
          </button>
          <Link
            href={`/comparar?left=${slug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Comparar
          </Link>
        </div>
      </div>

      {/* Title + badge */}
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <h1 className="heading-serif text-2xl">{titulo}</h1>
        <span
          className={clsx(
            "mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            estadoConfig.color
          )}
        >
          {estadoConfig.label}
        </span>
        <div className="mt-1">
          <BookmarkButton
            id={idArticulo}
            type="art"
            title={`${idArticulo} — ${titulo}`}
            href={`/articulo/${slug}`}
            preview={titulo}
            showLabel
            allowWorkspacePicker
            className="rounded-md border border-border px-2 py-1"
          />
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{libroFull}</p>
    </div>
  );
}
