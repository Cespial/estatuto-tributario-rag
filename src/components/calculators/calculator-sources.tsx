import Link from "next/link";

interface ArticleSource {
  id: string;
  label?: string;
  reason?: string;
}

interface CalculatorSourcesProps {
  articles: Array<string | ArticleSource>;
}

export function CalculatorSources({ articles }: CalculatorSourcesProps) {
  if (articles.length === 0) return null;

  const normalized = articles.map((article) =>
    typeof article === "string"
      ? { id: article, label: `Art. ${article}` }
      : { id: article.id, label: article.label ?? `Art. ${article.id}`, reason: article.reason },
  );

  return (
    <div className="mt-8 pt-6 text-sm">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
        Articulos del ET relacionados:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {normalized.map((art) => (
          <Link
            key={art.id}
            href={`/articulo/${art.id}`}
            className="rounded border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-muted"
          >
            {art.label}
          </Link>
        ))}
      </div>
      {normalized.some((source) => !!source.reason) && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {normalized.map((source) =>
            source.reason ? (
              <p key={`${source.id}-reason`}>
                <strong>{source.label}:</strong> {source.reason}
              </p>
            ) : null,
          )}
        </div>
      )}
      {/* Keep spacing consistent with legacy pages */}
      <div className="h-0.5" />
    </div>
  );
}
