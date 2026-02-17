import Link from "next/link";

interface CalculatorSourcesProps {
  articles: string[];
}

export function CalculatorSources({ articles }: CalculatorSourcesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Articulos relacionados:</span>
      {articles.map((art) => (
        <Link
          key={art}
          href={`/articulo/${art}`}
          className="text-xs text-primary hover:underline"
        >
          Art. {art}
        </Link>
      ))}
    </div>
  );
}
