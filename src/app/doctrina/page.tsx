"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Scale,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DOCTRINA, type DoctrinaDIAN } from "@/config/doctrina-data";
import { clsx } from "clsx";

const TIPO_DOC_CONFIG: Record<DoctrinaDIAN["tipoDocumento"], { label: string; color: string }> = {
  concepto: {
    label: "Concepto",
    color: "bg-muted text-foreground border-border",
  },
  oficio: {
    label: "Oficio",
    color: "bg-muted text-foreground border-border",
  },
  "doctrina-general": {
    label: "Doctrina General",
    color: "bg-muted text-foreground border-border",
  },
  circular: {
    label: "Circular",
    color: "bg-muted text-foreground border-border",
  },
};

function formatFecha(fecha: string): string {
  const date = new Date(fecha + "T12:00:00");
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DoctrinaPage() {
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [vigenciaFiltro, setVigenciaFiltro] = useState<string>("todos");
  const [articuloFiltro, setArticuloFiltro] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    return DOCTRINA
      .filter((d) => {
        const lowerSearch = search.toLowerCase();
        const matchesSearch =
          !search ||
          d.tema.toLowerCase().includes(lowerSearch) ||
          d.pregunta.toLowerCase().includes(lowerSearch) ||
          d.sintesis.toLowerCase().includes(lowerSearch) ||
          d.conclusionClave.toLowerCase().includes(lowerSearch) ||
          d.numero.toLowerCase().includes(lowerSearch) ||
          d.descriptores.some((desc) => desc.toLowerCase().includes(lowerSearch));
        const matchesTipo = tipoFiltro === "todos" || d.tipoDocumento === tipoFiltro;
        const matchesVigencia =
          vigenciaFiltro === "todos" ||
          (vigenciaFiltro === "vigente" && d.vigente) ||
          (vigenciaFiltro === "no-vigente" && !d.vigente);
        const matchesArticulo =
          !articuloFiltro ||
          d.articulosET.some((art) =>
            art.toLowerCase().includes(articuloFiltro.toLowerCase())
          );
        return matchesSearch && matchesTipo && matchesVigencia && matchesArticulo;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [search, tipoFiltro, vigenciaFiltro, articuloFiltro]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-12 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-muted p-2 text-foreground/70">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight text-foreground">
            Doctrina DIAN
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Conceptos y oficios de la Direccion de Impuestos y Aduanas Nacionales
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar en doctrina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-border/60 bg-card px-4 py-2.5 pl-10 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="w-full rounded border border-border/60 bg-card px-4 py-2.5 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todos">Todos los tipos</option>
          <option value="concepto">Concepto</option>
          <option value="oficio">Oficio</option>
          <option value="doctrina-general">Doctrina General</option>
          <option value="circular">Circular</option>
        </select>

        <select
          value={vigenciaFiltro}
          onChange={(e) => setVigenciaFiltro(e.target.value)}
          className="w-full rounded border border-border/60 bg-card px-4 py-2.5 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todos">Vigencia: Todos</option>
          <option value="vigente">Vigente</option>
          <option value="no-vigente">No vigente</option>
        </select>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            Art.
          </span>
          <input
            type="text"
            placeholder="Ej: 240, 383..."
            value={articuloFiltro}
            onChange={(e) => setArticuloFiltro(e.target.value)}
            className="w-full rounded border border-border/60 bg-card px-4 py-2.5 pl-12 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {filtered.length} documento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((doc) => {
            const isExpanded = expandedIds.has(doc.id);
            const tipoConf = TIPO_DOC_CONFIG[doc.tipoDocumento];

            return (
              <div
                key={doc.id}
                className="group rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm transition-all hover:border-border hover:shadow-md"
              >
                {/* Card header */}
                <div className="p-6 pb-4">
                  {/* Top row: numero + fecha + badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {doc.numero}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      &mdash; {formatFecha(doc.fecha)}
                    </span>
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ml-auto",
                        tipoConf.color
                      )}
                    >
                      {tipoConf.label}
                    </span>
                    {doc.vigente ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground line-through">
                        <XCircle className="h-3.5 w-3.5" />
                        No vigente
                      </span>
                    )}
                  </div>

                  {/* Tema */}
                  <h3 className="text-lg font-semibold text-foreground transition-colors mb-2">
                    {doc.tema}
                  </h3>

                  {/* Pregunta */}
                  <p className="text-sm italic text-muted-foreground mb-4">
                    &ldquo;{doc.pregunta}&rdquo;
                  </p>

                  {/* Conclusion clave - always visible */}
                  <div className="bg-muted/50 border-l-4 border-foreground/20 p-3 rounded-r-md mb-4">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {doc.conclusionClave}
                    </p>
                  </div>

                  {/* Expand/collapse button */}
                  <button
                    onClick={() => toggleExpand(doc.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Ocultar sintesis completa
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Ver sintesis completa
                      </>
                    )}
                  </button>

                  {/* Collapsible synthesis */}
                  {isExpanded && (
                    <div className="mt-4 rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                      {doc.sintesis}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-6 py-4 bg-muted/20 border-t border-border/40">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* ET Articles */}
                    {doc.articulosET.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          E.T.:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {doc.articulosET.map((art) => (
                            <Link
                              key={art}
                              href={`/articulo/${art}`}
                              className="text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                            >
                              Art. {art}
                              <ExternalLink className="h-2 w-2 opacity-50" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descriptores */}
                    <div className="flex flex-wrap gap-1.5 ml-auto">
                      {doc.descriptores.map((desc) => (
                        <span
                          key={desc}
                          className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {desc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-lg border border-border/60 border-dashed">
            <Filter className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No se encontraron documentos</p>
            <p className="text-sm">Intente con otra busqueda o modifique los filtros.</p>
            <button
              onClick={() => {
                setSearch("");
                setTipoFiltro("todos");
                setVigenciaFiltro("todos");
                setArticuloFiltro("");
              }}
              className="mt-4 text-sm text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Legal note */}
      <div className="mt-8 rounded-lg border border-border/60 bg-card p-4 text-xs text-muted-foreground shadow-sm">
        <p>
          <strong>Nota legal:</strong> Los conceptos y oficios presentados son de caracter
          informativo. La doctrina DIAN puede ser revocada o modificada. Consulte siempre la base
          de datos oficial de la DIAN y un profesional habilitado para asesoria tributaria.
        </p>
      </div>
    </div>
  );
}
