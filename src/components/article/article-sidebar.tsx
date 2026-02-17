import { ExternalLink, Activity, Calendar, Hash, BarChart2 } from "lucide-react";
import { clsx } from "clsx";

interface ArticleSidebarProps {
  totalMods: number;
  ultimaMod: number | null;
  complexity: number;
  totalNormas: number;
  totalCrossRefs: number;
  totalReferencedBy: number;
  estado: string;
  urlOrigen: string;
}

const ESTADO_DOT: Record<string, string> = {
  vigente: "bg-green-500",
  modificado: "bg-yellow-500",
  derogado: "bg-red-500",
};

export function ArticleSidebar({
  totalMods,
  ultimaMod,
  complexity,
  totalNormas,
  totalCrossRefs,
  totalReferencedBy,
  estado,
  urlOrigen,
}: ArticleSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Estado */}
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className={clsx("h-3 w-3 rounded-full", ESTADO_DOT[estado] || "bg-gray-500")} />
          <span className="text-sm font-semibold capitalize">{estado}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="h-3.5 w-3.5" /> Modificaciones
            </span>
            <span className="font-medium">{totalMods}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Ultima mod.
            </span>
            <span className="font-medium">{ultimaMod || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Complejidad
            </span>
            <span className="font-medium">{complexity}/10</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart2 className="h-3.5 w-3.5" /> Normas
            </span>
            <span className="font-medium">{totalNormas}</span>
          </div>
        </div>
        {/* Complexity bar */}
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${complexity * 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* References count */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold">Referencias</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Referencia a</span>
            <span className="font-medium">{totalCrossRefs} arts.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Referenciado por</span>
            <span className="font-medium">{totalReferencedBy} arts.</span>
          </div>
        </div>
      </div>

      {/* External link */}
      <a
        href={urlOrigen}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        <ExternalLink className="h-4 w-4" />
        Ver en estatuto.co
      </a>
    </div>
  );
}
