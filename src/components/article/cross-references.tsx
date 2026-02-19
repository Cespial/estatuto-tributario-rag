import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface CrossReferencesProps {
  crossReferences: string[];
  referencedBy: string[];
  slugToIdMap?: Record<string, string>;
}

function isValidArticleSlug(value: string): boolean {
  return /^[a-z0-9-]+$/i.test(value);
}

export function CrossReferences({
  crossReferences,
  referencedBy,
  slugToIdMap = {},
}: CrossReferencesProps) {
  const validCrossReferences = crossReferences.filter(isValidArticleSlug);
  const validReferencedBy = referencedBy.filter(isValidArticleSlug);
  const droppedCount =
    crossReferences.length +
    referencedBy.length -
    validCrossReferences.length -
    validReferencedBy.length;

  if (validCrossReferences.length === 0 && validReferencedBy.length === 0) {
    return null;
  }

  return (
    <section id="referencias" className="mb-6">
      <h2 className="heading-serif mb-3 text-lg">Referencias cruzadas</h2>

      {validCrossReferences.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ArrowUpRight className="h-4 w-4" />
            Este artículo referencia ({validCrossReferences.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {validCrossReferences.map((slug) => (
              <Link
                key={slug}
                href={`/articulo/${slug}`}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                {slugToIdMap[slug] || `Art. ${slug}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {validReferencedBy.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ArrowDownLeft className="h-4 w-4" />
            Referenciado por ({validReferencedBy.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {validReferencedBy.map((slug) => (
              <Link
                key={slug}
                href={`/articulo/${slug}`}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                {slugToIdMap[slug] || `Art. ${slug}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {droppedCount > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Se ocultaron {droppedCount} referencias sin slug válido en el dataset.
        </p>
      )}
    </section>
  );
}
