"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";

interface ArticleIndexItem {
  id: string;
  slug: string;
  titulo: string;
  total_mods: number;
}

interface ArticleVersionSelectorProps {
  onSelect: (slug: string) => void;
  selectedSlug?: string;
}

export function ArticleVersionSelector({ onSelect, selectedSlug }: ArticleVersionSelectorProps) {
  const [articles, setArticles] = useState<ArticleIndexItem[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch("/data/articles-index.json");
        const data: ArticleIndexItem[] = await response.json();
        // Only show articles that have modifications
        setArticles(data.filter(a => a.total_mods > 0));
      } catch (error) {
        console.error("Failed to load articles index:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    if (!search) return articles.slice(0, 100);
    const lowSearch = search.toLowerCase();
    return articles
      .filter(a => 
        a.id.toLowerCase().includes(lowSearch) || 
        a.titulo.toLowerCase().includes(lowSearch)
      )
      .slice(0, 50);
  }, [articles, search]);

  const selectedArticle = articles.find(a => a.slug === selectedSlug);

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          Seleccionar Artículo con Historia
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "flex w-full items-center justify-between rounded border border-border bg-card px-4 py-3 text-left shadow-sm transition-all duration-300 hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20",
            isOpen && "border-foreground/40 ring-2 ring-foreground/20"
          )}
        >
          <span className={clsx("block truncate", !selectedArticle && "text-muted-foreground")}>
            {selectedArticle ? `${selectedArticle.id}: ${selectedArticle.titulo}` : "Buscar artículo..."}
          </span>
          <ChevronDown className={clsx("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border/60 bg-card p-2 shadow animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              placeholder="Ej: Art. 241 o 'dividendos'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border-none bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden rounded-md">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground italic">Cargando artículos...</div>
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.slug}
                  onClick={() => {
                    onSelect(article.slug);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted hover:text-foreground",
                    selectedSlug === article.slug ? "bg-muted font-semibold text-foreground" : "text-foreground"
                  )}
                >
                  <div className="flex flex-col truncate">
                    <span className="font-semibold">{article.id}</span>
                    <span className="truncate text-xs opacity-70">{article.titulo}</span>
                  </div>
                  {selectedSlug === article.slug && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground italic">No se encontraron artículos.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
