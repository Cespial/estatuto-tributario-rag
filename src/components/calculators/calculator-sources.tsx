import Link from "next/link";

interface CalculatorSourcesProps {
  articles: string[];
}

export function CalculatorSources({ articles }: CalculatorSourcesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 pt-6 text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">Articulos relacionados:</span>
      {articles.map((art) => (
        <Link
          key={art}
          href={`/articulo/${art}`}
          className="rounded border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-muted"
        >
          Art. {art}
        </Link>
      ))}
    </div>
  );
}
