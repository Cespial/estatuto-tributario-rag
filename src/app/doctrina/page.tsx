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
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  },
  oficio: {
    label: "Oficio",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  },
  "doctrina-general": {
    label: "Doctrina General",
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  },
  circular: {
    label: "Circular",
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
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
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Scale className="h-8 w-8" />
          </div>
          Doctrina DIAN
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Conceptos y oficios de la Direccion de Impuestos y Aduanas Nacionales
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar en doctrina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="todos">Vigencia: Todos</option>
          <option value="vigente">Vigente</option>
          <option value="no-vigente">No vigente</option>
        </select>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
            Art.
          </span>
          <input
            type="text"
            placeholder="Ej: 240, 383..."
            value={articuloFiltro}
            onChange={(e) => setArticuloFiltro(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-12 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
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
                className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
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
                        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ml-auto",
                        tipoConf.color
                      )}
                    >
                      {tipoConf.label}
                    </span>
                    {doc.vigente ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        No vigente
                      </span>
                    )}
                  </div>

                  {/* Tema */}
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {doc.tema}
                  </h3>

                  {/* Pregunta */}
                  <p className="text-sm italic text-muted-foreground mb-4">
                    &ldquo;{doc.pregunta}&rdquo;
                  </p>

                  {/* Conclusion clave - always visible */}
                  <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-md mb-4">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {doc.conclusionClave}
                    </p>
                  </div>

                  {/* Expand/collapse button */}
                  <button
                    onClick={() => toggleExpand(doc.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
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
                <div className="px-6 py-4 bg-muted/20 border-t border-border/50">
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
                              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5 bg-primary/5 px-1.5 py-0.5 rounded"
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
                          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
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
          <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">
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
              className="mt-4 text-sm text-primary hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Legal note */}
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          <strong>Nota legal:</strong> Los conceptos y oficios presentados son de caracter
          informativo. La doctrina DIAN puede ser revocada o modificada. Consulte siempre la base
          de datos oficial de la DIAN y un profesional habilitado para asesoria tributaria.
        </p>
      </div>
    </div>
  );
}
