"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Newspaper, Filter, ExternalLink, Tag } from "lucide-react";
import { NOVEDADES, type NovedadNormativa } from "@/config/novedades-data";
import { clsx } from "clsx";

const TIPO_CONFIG: Record<NovedadNormativa["tipo"], { label: string; color: string }> = {
  ley: { label: "Ley", color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400" },
  decreto: { label: "Decreto", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400" },
  resolucion: { label: "Resolucion", color: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400" },
  circular: { label: "Circular", color: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400" },
  sentencia: { label: "Sentencia", color: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400" },
  concepto: { label: "Concepto", color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400" },
};

const IMPACTO_CONFIG: Record<NovedadNormativa["impacto"], { label: string; color: string }> = {
  alto: { label: "Alto", color: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400" },
  medio: { label: "Medio", color: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400" },
  bajo: { label: "Bajo", color: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400" },
};

function formatFecha(fecha: string): string {
  const date = new Date(fecha + "T12:00:00");
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NovedadesPage() {
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [impactoFiltro, setImpactoFiltro] = useState<string>("todos");

  const filtered = useMemo(() => {
    return NOVEDADES
      .filter((n) => {
        const lowerSearch = search.toLowerCase();
        const matchesSearch =
          !search ||
          n.titulo.toLowerCase().includes(lowerSearch) ||
          n.resumen.toLowerCase().includes(lowerSearch) ||
          n.numero.toLowerCase().includes(lowerSearch) ||
          n.tags.some((t) => t.toLowerCase().includes(lowerSearch));
        const matchesTipo = tipoFiltro === "todos" || n.tipo === tipoFiltro;
        const matchesImpacto = impactoFiltro === "todos" || n.impacto === impactoFiltro;
        return matchesSearch && matchesTipo && matchesImpacto;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [search, tipoFiltro, impactoFiltro]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Newspaper className="h-8 w-8" />
          </div>
          Novedades Normativas
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Cambios recientes en legislacion tributaria colombiana
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por titulo, contenido, numero o tags..."
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
          <option value="ley">Ley</option>
          <option value="decreto">Decreto</option>
          <option value="resolucion">Resolucion</option>
          <option value="circular">Circular</option>
          <option value="sentencia">Sentencia</option>
          <option value="concepto">Concepto</option>
        </select>

        <select
          value={impactoFiltro}
          onChange={(e) => setImpactoFiltro(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="todos">Todos los impactos</option>
          <option value="alto">Impacto Alto</option>
          <option value="medio">Impacto Medio</option>
          <option value="bajo">Impacto Bajo</option>
        </select>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filtered.length} novedad{filtered.length !== 1 ? "es" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((novedad) => {
            const tipoConf = TIPO_CONFIG[novedad.tipo];
            const impactoConf = IMPACTO_CONFIG[novedad.impacto];

            return (
              <div
                key={novedad.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30"
              >
                {/* Top row: date + badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {formatFecha(novedad.fecha)}
                  </span>
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                      tipoConf.color
                    )}
                  >
                    {tipoConf.label}
                  </span>
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                      impactoConf.color
                    )}
                  >
                    Impacto {impactoConf.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                  {novedad.titulo}
                </h3>

                {/* Number + source */}
                <p className="text-sm text-muted-foreground mb-3">
                  {novedad.fuente} &mdash; {novedad.numero}
                </p>

                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {novedad.resumen}
                </p>

                {/* Footer: tags + ET articles */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {novedad.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* ET Articles */}
                  {novedad.articulosET && novedad.articulosET.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        E.T.:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {novedad.articulosET.map((art) => (
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
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">
            <Filter className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No se encontraron novedades</p>
            <p className="text-sm">Intente con otra busqueda o modifique los filtros.</p>
            <button
              onClick={() => {
                setSearch("");
                setTipoFiltro("todos");
                setImpactoFiltro("todos");
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
          <strong>Nota legal:</strong> La informacion presentada es de caracter informativo y no
          constituye asesoria legal o tributaria. Consulte siempre las fuentes oficiales (Diario
          Oficial, pagina web de la DIAN) y un profesional habilitado.
        </p>
      </div>
    </div>
  );
}
