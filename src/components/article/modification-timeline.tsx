import { clsx } from "clsx";

interface Modification {
  tipo: string;
  norma_tipo: string;
  norma_numero: string;
  norma_year: number;
  norma_articulo?: string;
}

interface ModificationTimelineProps {
  modifications: Modification[];
  leyesModificatorias: string[];
}

const TIPO_COLORS: Record<string, string> = {
  modificado: "bg-yellow-500",
  derogado: "bg-red-500",
  adicionado: "bg-blue-500",
  sustituido: "bg-purple-500",
  reglamentado: "bg-green-500",
};

export function ModificationTimeline({ modifications, leyesModificatorias }: ModificationTimelineProps) {
  if (modifications.length === 0) return null;

  // Group by year
  const byYear = new Map<number, Modification[]>();
  for (const mod of modifications) {
    const existing = byYear.get(mod.norma_year) || [];
    existing.push(mod);
    byYear.set(mod.norma_year, existing);
  }
  const years = Array.from(byYear.keys()).sort();

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold">
        Timeline de modificaciones ({modifications.length})
      </h2>
      <div className="relative ml-3 border-l-2 border-border pl-6">
        {years.map((year) => {
          const mods = byYear.get(year)!;
          return (
            <div key={year} className="relative mb-4 pb-2">
              {/* Year marker */}
              <div className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-background">
                <div
                  className={clsx(
                    "h-2 w-2 rounded-full",
                    TIPO_COLORS[mods[0].tipo] || "bg-gray-500"
                  )}
                />
              </div>
              <div className="text-sm font-bold text-foreground">{year}</div>
              <div className="mt-1 space-y-1">
                {mods.map((mod, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        TIPO_COLORS[mod.tipo] || "bg-gray-500"
                      )}
                    />
                    <span>
                      {mod.norma_tipo} {mod.norma_numero}
                      {mod.norma_articulo && ` Art. ${mod.norma_articulo}`}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground/70">
                      ({mod.tipo})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Leyes summary */}
      {leyesModificatorias.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {leyesModificatorias.map((ley) => (
            <span
              key={ley}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {ley}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
