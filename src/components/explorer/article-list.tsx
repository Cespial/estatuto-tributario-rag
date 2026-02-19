"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useArticlePanel } from "@/contexts/article-panel-context";
import { ET_BOOK_COLOR_MAP } from "@/lib/constants/et-books";

interface ArticleIndex {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  estado: string;
  total_mods: number;
  total_refs: number;
  total_referenced_by: number;
  complexity: number;
  has_normas: boolean;
  ultima_modificacion_year?: number | null;
  has_derogado_text?: boolean;
}

interface ArticleListProps {
  articles: ArticleIndex[];
  total: number;
}

export function ArticleList({ articles, total }: ArticleListProps) {
  const { openPanel } = useArticlePanel();

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No se encontraron artículos con esos filtros. Pruebe otro criterio de
        búsqueda.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          Mostrando {articles.length} de {total} artículos
        </p>
        <p className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
          Vista compacta
        </p>
      </div>

      <div className="max-h-[700px] overflow-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
              <th className="px-4 py-2">Artículo</th>
              <th className="px-2 py-2">Título</th>
              <th className="px-2 py-2">Libro</th>
              <th className="px-2 py-2 text-right">Mods</th>
              <th className="px-2 py-2 text-right">Refs</th>
              <th className="px-2 py-2 text-right">Citado por</th>
              <th className="px-2 py-2 text-right">Complej.</th>
              <th className="px-4 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const badges = [
                article.ultima_modificacion_year
                  ? `Modificado ${article.ultima_modificacion_year}`
                  : null,
                article.has_derogado_text ? "Con texto derogado" : null,
                article.has_normas ? "Con normas" : null,
              ].filter(Boolean) as string[];

              return (
                <tr
                  key={article.slug}
                  className="border-b border-border/40 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openPanel(article.slug)}
                      className="font-medium text-foreground hover:underline"
                    >
                      {article.id}
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <div>
                      <p className="line-clamp-1 font-medium">{article.titulo}</p>
                      {badges.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {badges.slice(0, 2).map((badge) => (
                            <span
                              key={badge}
                              className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            ET_BOOK_COLOR_MAP[article.libro] || "#6b7280",
                        }}
                      />
                      {article.libro}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right font-medium">
                    {article.total_mods}
                  </td>
                  <td className="px-2 py-3 text-right font-medium">
                    {article.total_refs}
                  </td>
                  <td className="px-2 py-3 text-right font-medium">
                    {article.total_referenced_by}
                  </td>
                  <td className="px-2 py-3 text-right font-medium">
                    <span
                      className={clsx(
                        article.complexity >= 6
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {article.complexity}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/articulo/${article.slug}`}
                      className="text-xs font-medium text-foreground hover:underline"
                    >
                      Abrir ficha
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
