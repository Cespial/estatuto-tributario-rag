import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface CrossReferencesProps {
  crossReferences: string[];
  referencedBy: string[];
}

export function CrossReferences({ crossReferences, referencedBy }: CrossReferencesProps) {
  if (crossReferences.length === 0 && referencedBy.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="heading-serif mb-3 text-lg">Cross-references</h2>

      {crossReferences.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ArrowUpRight className="h-4 w-4" />
            Este articulo referencia ({crossReferences.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {crossReferences.map((slug) => (
              <Link
                key={slug}
                href={`/articulo/${slug}`}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                Art. {slug}
              </Link>
            ))}
          </div>
        </div>
      )}

      {referencedBy.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ArrowDownLeft className="h-4 w-4" />
            Referenciado por ({referencedBy.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {referencedBy.map((slug) => (
              <Link
                key={slug}
                href={`/articulo/${slug}`}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                Art. {slug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
