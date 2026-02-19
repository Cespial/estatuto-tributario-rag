import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const COMPARISON_ROWS = [
  {
    criterion: "Tiempo por consulta",
    traditional: "Alto y variable",
    app: "Minutos con ruta clara",
  },
  {
    criterion: "Referencia normativa",
    traditional: "Dispersa",
    app: "Centralizada y consultable",
  },
  {
    criterion: "Costo de arranque",
    traditional: "Frecuentemente alto",
    app: "Gratis para empezar",
  },
  {
    criterion: "Curva de aprendizaje",
    traditional: "Media / alta",
    app: "Baja",
  },
  {
    criterion: "Soporte IA con contexto ET",
    traditional: "Limitado o nulo",
    app: "Incluido",
  },
];

export function ComparisonSection() {
  return (
    <section
      id="comparativa"
      aria-labelledby="comparativa-title"
      className="bg-background px-6 py-16 md:px-8 md:py-24"
    >
      <Reveal className="mx-auto max-w-5xl">
        <h2
          id="comparativa-title"
          className="heading-serif text-3xl text-foreground md:text-5xl"
        >
          Mas practico que trabajar en Excel + busquedas sueltas.
        </h2>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-3 border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-foreground/75">
            <p>Criterio</p>
            <p>Flujo tradicional</p>
            <p>Tributaria Colombia</p>
          </div>

          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.criterion}
              className="grid grid-cols-3 border-b border-border px-4 py-4 text-sm text-foreground last:border-b-0"
            >
              <p className="pr-3 font-medium">{row.criterion}</p>
              <p className="pr-3 text-muted-foreground">{row.traditional}</p>
              <p className="font-medium text-foreground">{row.app}</p>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Comparar mi flujo actual
        </Link>
      </Reveal>
    </section>
  );
}
