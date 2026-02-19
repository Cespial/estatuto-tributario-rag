import { FileEdit, Scale, FileX, Landmark } from "lucide-react";

interface ActionKpiCardsProps {
  modifiedArticles: number;
  modifiedPercentage: number;
  withNormas: number;
  withDerogadoText: number;
  topLaw?: { name: string; count: number } | null;
}

export function ActionKpiCards({
  modifiedArticles,
  modifiedPercentage,
  withNormas,
  withDerogadoText,
  topLaw,
}: ActionKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
          <FileEdit className="h-4 w-4" />
          Artículos modificados
        </p>
        <p className="font-mono text-2xl font-semibold">{modifiedArticles}</p>
        <p className="text-sm text-muted-foreground">{modifiedPercentage}% del ET</p>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
          <Scale className="h-4 w-4" />
          Con normas asociadas
        </p>
        <p className="font-mono text-2xl font-semibold">{withNormas}</p>
        <p className="text-sm text-muted-foreground">Doctrina, decretos o jurisprudencia</p>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
          <FileX className="h-4 w-4" />
          Con texto derogado
        </p>
        <p className="font-mono text-2xl font-semibold">{withDerogadoText}</p>
        <p className="text-sm text-muted-foreground">Con versiones históricas visibles</p>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
          <Landmark className="h-4 w-4" />
          Ley más incidente
        </p>
        {topLaw ? (
          <>
            <p className="line-clamp-2 text-sm font-semibold">{topLaw.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {topLaw.count} impactos registrados
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sin datos para el rango seleccionado.
          </p>
        )}
      </div>
    </div>
  );
}
