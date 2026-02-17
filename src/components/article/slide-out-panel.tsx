"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useArticlePanel } from "@/contexts/article-panel-context";
import { clsx } from "clsx";

interface ArticleData {
  id_articulo: string;
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;
  estado: string;
  complexity_score: number;
  contenido_texto: string;
  total_modificaciones: number;
  ultima_modificacion_year: number | null;
  modificaciones_parsed: Array<{ tipo: string; norma_tipo: string; norma_numero: string; norma_year: number }>;
  normas_parsed: Record<string, string[]>;
}

const ESTADO_COLORS: Record<string, string> = {
  vigente: "bg-green-500",
  modificado: "bg-yellow-500",
  derogado: "bg-red-500",
};

export function SlideOutPanel() {
  const { isOpen, slug, closePanel } = useArticlePanel();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      return;
    }
    setLoading(true);
    fetch(`/data/articles/${slug}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closePanel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closePanel]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closePanel}
      />
      {/* Panel */}
      <div
        className={clsx(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-background shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-4">
          <div className="flex items-center gap-2">
            {article && (
              <span
                className={clsx(
                  "h-2.5 w-2.5 rounded-full",
                  ESTADO_COLORS[article.estado] || "bg-gray-500"
                )}
              />
            )}
            <span className="font-semibold">
              {article?.id_articulo || "Cargando..."}
            </span>
          </div>
          <button
            onClick={closePanel}
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {article && !loading && (
          <div className="space-y-4 p-4">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold">{article.titulo_corto}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{article.libro}</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted p-2 text-center">
                <div className="text-lg font-bold">{article.total_modificaciones}</div>
                <div className="text-xs text-muted-foreground">Modificaciones</div>
              </div>
              <div className="rounded-lg bg-muted p-2 text-center">
                <div className="text-lg font-bold">{article.ultima_modificacion_year || "N/A"}</div>
                <div className="text-xs text-muted-foreground">Ultima mod.</div>
              </div>
              <div className="rounded-lg bg-muted p-2 text-center">
                <div className="text-lg font-bold">{article.complexity_score}/10</div>
                <div className="text-xs text-muted-foreground">Complejidad</div>
              </div>
            </div>

            {/* Content preview */}
            <div>
              <h4 className="mb-1 text-sm font-semibold">Contenido</h4>
              <p className="line-clamp-6 text-sm text-muted-foreground">
                {article.contenido_texto || "Sin contenido disponible"}
              </p>
            </div>

            {/* Mini timeline */}
            {article.modificaciones_parsed.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">
                  Modificaciones ({article.modificaciones_parsed.length})
                </h4>
                <div className="space-y-1.5">
                  {article.modificaciones_parsed.slice(0, 5).map((mod, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className={clsx(
                          "h-1.5 w-1.5 rounded-full",
                          mod.tipo === "derogado" ? "bg-red-500" : "bg-yellow-500"
                        )}
                      />
                      <span>
                        {mod.norma_tipo} {mod.norma_numero}/{mod.norma_year}
                      </span>
                      <span className="capitalize text-muted-foreground/70">
                        ({mod.tipo})
                      </span>
                    </div>
                  ))}
                  {article.modificaciones_parsed.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{article.modificaciones_parsed.length - 5} mas...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Normas summary */}
            {article.normas_parsed && Object.values(article.normas_parsed).some(arr => arr.length > 0) && (
              <div>
                <h4 className="mb-1 text-sm font-semibold">Normas relacionadas</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(article.normas_parsed).map(([key, items]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <span
                        key={key}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        {key}: {items.length}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link
                href={`/articulo/${article.slug}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                onClick={closePanel}
              >
                Ver ficha completa
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={article.url_origen}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
