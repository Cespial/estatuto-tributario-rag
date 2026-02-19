import Link from "next/link";

interface RelatedArticleItem {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  reason: string;
}

interface RelatedArticlesProps {
  items: RelatedArticleItem[];
}

export function RelatedArticles({ items }: RelatedArticlesProps) {
  if (!items.length) return null;

  return (
    <section id="relacionados" className="mb-6">
      <h2 className="heading-serif mb-3 text-lg">Artículos relacionados</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.slice(0, 8).map((item) => (
          <Link
            key={item.slug}
            href={`/articulo/${item.slug}`}
            className="rounded-lg border border-border/60 bg-card p-3 transition-colors hover:bg-muted/30"
          >
            <p className="text-sm font-semibold">{item.id}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.titulo}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {item.libro} · {item.reason}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
