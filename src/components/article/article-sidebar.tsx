import Link from "next/link";
import { ExternalLink, Activity, Calendar, Hash, BarChart2, Scale } from "lucide-react";
import { clsx } from "clsx";
import type { DoctrinaEnriched } from "@/types/knowledge";
import { VigenciaBadge } from "@/components/knowledge/VigenciaBadge";

interface ArticleSidebarProps {
  totalMods: number;
  ultimaMod: number | null;
  complexity: number;
  totalNormas: number;
  totalCrossRefs: number;
  totalReferencedBy: number;
  estado: string;
  urlOrigen: string;
  articuloNumero: string;
  doctrinaRelacionada: DoctrinaEnriched[];
}

const ESTADO_DOT: Record<string, string> = {
  vigente: "bg-foreground",
  modificado: "bg-foreground/60",
  derogado: "bg-foreground/30",
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
  articuloNumero,
  doctrinaRelacionada,
}: ArticleSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Estado */}
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className={clsx("h-3 w-3 rounded-full", ESTADO_DOT[estado] || "bg-foreground/40")} />
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
              className="h-full rounded-full bg-foreground/40 transition-all"
              style={{ width: `${complexity * 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* References count */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-xs uppercase tracking-[0.05em] font-medium text-muted-foreground">Referencias</h3>
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

      {doctrinaRelacionada.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            <Scale className="h-3.5 w-3.5" />
            Doctrina DIAN
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {doctrinaRelacionada.length} documento{doctrinaRelacionada.length === 1 ? "" : "s"} interpretan el Art.{" "}
            {articuloNumero}
          </p>
          <div className="space-y-2">
            {doctrinaRelacionada.slice(0, 4).map((doc) => (
              <Link
                key={doc.id}
                href={`/doctrina?doc=${doc.id}`}
                className="block rounded-md border border-border/70 p-2.5 hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground line-clamp-2">{doc.numero}</span>
                  <VigenciaBadge status={doc.vigencia} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{doc.tema}</p>
              </Link>
            ))}
          </div>
          <Link
            href={`/doctrina?articulo=${articuloNumero}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
          >
            Ver toda la doctrina de este artículo
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

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
