"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeForSearch } from "@/lib/utils/text-normalize";
import { useArticlePanel } from "@/contexts/article-panel-context";

interface SearchableArticle {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  estado: string;
  total_mods: number;
  has_normas: boolean;
  preview_snippet?: string;
  ultima_modificacion_year?: number | null;
  leyes_modificatorias_normalized?: string[];
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  articles: SearchableArticle[];
}

const MAX_SUGGESTIONS = 8;

export function SearchBar({ value, onChange, articles }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const [open, setOpen] = useState(false);
  const { openPanel } = useArticlePanel();

  useEffect(() => {
    const timeout = setTimeout(() => onChange(local), 250);
    return () => clearTimeout(timeout);
  }, [local, onChange]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocal(value), [value]);

  const suggestions = useMemo(() => {
    const query = normalizeForSearch(local);
    if (query.length < 2) return [];

    const ranked = articles
      .map((article) => {
        const id = normalizeForSearch(article.id);
        const titulo = normalizeForSearch(article.titulo);
        const slug = normalizeForSearch(article.slug);
        const laws = (article.leyes_modificatorias_normalized || [])
          .map((law) => normalizeForSearch(law))
          .join(" ");

        const searchBlob = `${id} ${titulo} ${slug} ${laws}`;
        const includes = searchBlob.includes(query);
        if (!includes) return null;

        const idIndex = id.indexOf(query);
        const titleIndex = titulo.indexOf(query);
        const slugIndex = slug.indexOf(query);

        const score =
          (idIndex >= 0 ? 0 : 100) +
          (titleIndex >= 0 ? titleIndex : 100) +
          (slugIndex >= 0 ? slugIndex : 100);

        return { article, score };
      })
      .filter(Boolean) as Array<{ article: SearchableArticle; score: number }>;

    return ranked
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_SUGGESTIONS)
      .map((item) => item.article);
  }, [articles, local]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={local}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Buscar por artículo, título o ley (ej. Ley 2277)..."
        aria-label="Buscar artículos"
        className="h-12 w-full rounded border border-border bg-card pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
      />
      {local && (
        <button
          onClick={() => {
            setLocal("");
            onChange("");
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-lg border border-border/60 bg-card p-2 shadow-lg">
          <p className="mb-2 px-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
            Sugerencias ({suggestions.length})
          </p>
          <div className="max-h-[420px] overflow-auto">
            {suggestions.map((article) => (
              <div
                key={article.slug}
                className="rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/40"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <button
                    onClick={() => openPanel(article.slug)}
                    className="text-left"
                  >
                    <p className="text-sm font-semibold">{article.id}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {article.titulo}
                    </p>
                  </button>
                  <Link
                    href={`/articulo/${article.slug}`}
                    className="text-xs font-medium text-foreground hover:underline"
                  >
                    Abrir
                  </Link>
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {article.preview_snippet || "Sin vista previa disponible"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>{article.libro}</span>
                  <span>•</span>
                  <span className="capitalize">{article.estado}</span>
                  {article.total_mods > 0 && (
                    <>
                      <span>•</span>
                      <span>{article.total_mods} modificaciones</span>
                    </>
                  )}
                  {article.ultima_modificacion_year && (
                    <>
                      <span>•</span>
                      <span>Última: {article.ultima_modificacion_year}</span>
                    </>
                  )}
                  {article.has_normas && (
                    <>
                      <span>•</span>
                      <span>Con normas</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
