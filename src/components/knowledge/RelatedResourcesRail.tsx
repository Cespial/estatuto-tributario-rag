import Link from "next/link";
import { ExternalLink, GraduationCap, Scale, Calculator, Hash } from "lucide-react";
import type { DoctrinaEnriched, GuiaEducativaEnriched } from "@/types/knowledge";

interface RelatedResourcesRailProps {
  title?: string;
  guides?: GuiaEducativaEnriched[];
  doctrine?: DoctrinaEnriched[];
  calculators?: string[];
  articles?: string[];
}

function calculatorLabel(path: string): string {
  const slug = path.replace("/calculadoras/", "").replaceAll("-", " ");
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function RelatedResourcesRail({
  title = "Recursos relacionados",
  guides = [],
  doctrine = [],
  calculators = [],
  articles = [],
}: RelatedResourcesRailProps) {
  const hasContent =
    guides.length > 0 || doctrine.length > 0 || calculators.length > 0 || articles.length > 0;

  if (!hasContent) return null;

  return (
    <section className="rounded-lg border border-border/60 bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>

      <div className="space-y-3">
        {guides.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              Guías interactivas
            </p>
            <div className="flex flex-wrap gap-2">
              {guides.slice(0, 4).map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guias/${guide.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/85 hover:bg-muted"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  {guide.titulo}
                </Link>
              ))}
            </div>
          </div>
        )}

        {doctrine.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Doctrina DIAN</p>
            <div className="flex flex-wrap gap-2">
              {doctrine.slice(0, 4).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/doctrina?doc=${doc.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/85 hover:bg-muted"
                >
                  <Scale className="h-3.5 w-3.5" />
                  {doc.numero}
                </Link>
              ))}
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Artículos ET</p>
            <div className="flex flex-wrap gap-2">
              {articles.slice(0, 6).map((article) => (
                <Link
                  key={article}
                  href={`/articulo/${article}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/85 hover:bg-muted"
                >
                  <Hash className="h-3.5 w-3.5" />
                  Art. {article}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {calculators.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Calculadoras</p>
            <div className="flex flex-wrap gap-2">
              {calculators.slice(0, 4).map((calc) => (
                <Link
                  key={calc}
                  href={calc}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/85 hover:bg-muted"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  {calculatorLabel(calc)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
