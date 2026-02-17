"use client";

import { ArticleCard } from "./article-card";

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
}

interface ArticleGridProps {
  articles: ArticleIndex[];
  total: number;
}

export function ArticleGrid({ articles, total }: ArticleGridProps) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Mostrando {articles.length} de {total} artículos
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {articles.map((art) => (
          <ArticleCard
            key={art.slug || art.id}
            id={art.id}
            slug={art.slug}
            titulo={art.titulo}
            libro={art.libro}
            estado={art.estado}
            totalMods={art.total_mods}
            totalRefs={art.total_refs}
            totalReferencedBy={art.total_referenced_by}
            complexity={art.complexity}
            hasNormas={art.has_normas}
          />
        ))}
      </div>
      {articles.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No se encontraron artículos con esos filtros. Intenta buscar por número de artículo o una palabra clave diferente.
        </div>
      )}
    </div>
  );
}
