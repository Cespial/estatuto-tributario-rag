import { clsx } from "clsx";
import { ScrollText } from "lucide-react";

interface Modification {
  tipo: string;
  norma_tipo: string;
  norma_numero: string;
  norma_year: number;
  norma_articulo?: string;
}

interface DerogatedItem {
  index: number;
  snippet: string;
  full_length: number;
  norma_ref?: string;
}

interface ModificationTimelineProps {
  modifications: Modification[];
  leyesModificatorias: string[];
  derogatedItems?: DerogatedItem[];
}

const TIPO_STYLES: Record<
  string,
  { dot: string; chip: string; label: string }
> = {
  modificado: {
    dot: "bg-foreground/70",
    chip: "border-border bg-muted text-muted-foreground",
    label: "Modificado",
  },
  derogado: {
    dot: "bg-foreground/30",
    chip: "border-border bg-muted text-muted-foreground",
    label: "Derogado",
  },
  adicionado: {
    dot: "bg-foreground/90",
    chip: "border-border bg-muted text-muted-foreground",
    label: "Adicionado",
  },
  sustituido: {
    dot: "bg-foreground/50",
    chip: "border-border bg-muted text-muted-foreground",
    label: "Sustituido",
  },
  reglamentado: {
    dot: "bg-foreground/80",
    chip: "border-border bg-muted text-muted-foreground",
    label: "Reglamentado",
  },
};

function lawKey(modification: Modification): string {
  return `${modification.norma_tipo} ${modification.norma_numero} de ${modification.norma_year}`;
}

export function ModificationTimeline({
  modifications,
  leyesModificatorias,
  derogatedItems = [],
}: ModificationTimelineProps) {
  if (modifications.length === 0) return null;

  const findSnippet = (law: string) => {
    return derogatedItems.find((item) => item.norma_ref?.includes(law))?.snippet;
  };

  const groupedByYear = new Map<number, Modification[]>();
  for (const modification of modifications) {
    const current = groupedByYear.get(modification.norma_year) || [];
    current.push(modification);
    groupedByYear.set(modification.norma_year, current);
  }

  const years = Array.from(groupedByYear.keys()).sort((a, b) => b - a);

  return (
    <section id="timeline" className="mb-6">
      <h2 className="heading-serif mb-3 text-lg">
        Timeline de modificaciones ({modifications.length})
      </h2>

      <div className="relative ml-3 border-l-2 border-foreground/20 pl-6">
        {years.map((year) => {
          const yearMods = groupedByYear.get(year) || [];
          const laws = new Map<
            string,
            { count: number; tipo: string; norma_articulo?: string }
          >();

          for (const modification of yearMods) {
            const key = lawKey(modification);
            const current = laws.get(key) || {
              count: 0,
              tipo: modification.tipo,
              norma_articulo: modification.norma_articulo,
            };
            current.count += 1;
            laws.set(key, current);
          }

          return (
            <div key={year} className="relative mb-5 pb-2">
              <div className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-background">
                <div
                  className={clsx(
                    "h-2 w-2 rounded-full",
                    TIPO_STYLES[yearMods[0]?.tipo || "modificado"]?.dot ||
                      "bg-foreground/40"
                  )}
                />
              </div>
              <div className="text-sm font-semibold text-foreground">{year}</div>

              <div className="mt-2 space-y-2">
                {Array.from(laws.entries())
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([law, data]) => {
                    const tipoStyle =
                      TIPO_STYLES[data.tipo] || TIPO_STYLES.modificado;
                    const snippet = findSnippet(law);
                    return (
                      <div
                        key={law}
                        className="group relative rounded-md border border-border/50 bg-muted/20 px-3 py-2 transition-colors hover:border-border hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-foreground">{law}</span>
                          <span
                            className={clsx(
                              "rounded-full border px-2 py-0.5 text-[11px]",
                              tipoStyle.chip
                            )}
                          >
                            {tipoStyle.label}
                          </span>
                          {data.count > 1 && (
                            <span className="text-[11px] text-muted-foreground">
                              {data.count} eventos
                            </span>
                          )}
                          {data.norma_articulo && (
                            <span className="text-[11px] text-muted-foreground">
                              Art. {data.norma_articulo}
                            </span>
                          )}
                        </div>
                        {snippet && (
                          <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-72 rounded-md border border-border bg-popover p-3 text-[11px] text-muted-foreground shadow-xl animate-in fade-in slide-in-from-bottom-2 group-hover:block">
                            <p className="font-medium text-foreground mb-1">Resumen del cambio:</p>
                            <p className="line-clamp-4 leading-relaxed">{snippet}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {leyesModificatorias.length > 0 && (
        <div className="mt-4 rounded-lg border border-border/60 bg-card p-3">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" />
            Leyes modificatorias identificadas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {leyesModificatorias.map((law) => (
              <span
                key={law}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {law}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
