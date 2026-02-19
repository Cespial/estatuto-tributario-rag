"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Newspaper, Filter, ExternalLink, Tag } from "lucide-react";
import { NOVEDADES, type NovedadNormativa } from "@/config/novedades-data";
import { clsx } from "clsx";

const TIPO_CONFIG: Record<NovedadNormativa["tipo"], { label: string; color: string }> = {
  ley: { label: "Ley", color: "bg-muted text-foreground border-border" },
  decreto: { label: "Decreto", color: "bg-muted text-foreground border-border" },
  resolucion: { label: "Resolucion", color: "bg-muted text-foreground border-border" },
  circular: { label: "Circular", color: "bg-muted text-foreground border-border" },
  sentencia: { label: "Sentencia", color: "bg-muted text-foreground border-border" },
  concepto: { label: "Concepto", color: "bg-muted text-foreground border-border" },
};

const IMPACTO_CONFIG: Record<NovedadNormativa["impacto"], { label: string; color: string }> = {
  alto: { label: "Alto", color: "bg-foreground text-background border-foreground" },
  medio: { label: "Medio", color: "bg-muted text-foreground border-border" },
  bajo: { label: "Bajo", color: "border border-border text-muted-foreground bg-transparent" },
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
      <div className="mb-12 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-muted p-2 text-foreground/70">
            <Newspaper className="h-8 w-8" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight text-foreground">
            Novedades Normativas
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Cambios recientes en legislacion tributaria colombiana
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por titulo, contenido, numero o tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 pl-10 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
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
          className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todos">Todos los impactos</option>
          <option value="alto">Impacto Alto</option>
          <option value="medio">Impacto Medio</option>
          <option value="bajo">Impacto Bajo</option>
        </select>
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-border hover:shadow-md"
              >
                {/* Top row: date + badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {formatFecha(novedad.fecha)}
                  </span>
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      tipoConf.color
                    )}
                  >
                    {tipoConf.label}
                  </span>
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      impactoConf.color
                    )}
                  >
                    Impacto {impactoConf.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground transition-colors mb-1">
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
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {novedad.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
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
                            className="text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground flex items-center gap-0.5 px-1.5 py-0.5 rounded"
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
          <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border/60 border-dashed">
            <Filter className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No se encontraron novedades</p>
            <p className="text-sm">Intente con otra busqueda o modifique los filtros.</p>
            <button
              onClick={() => {
                setSearch("");
                setTipoFiltro("todos");
                setImpactoFiltro("todos");
              }}
              className="mt-4 text-sm text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Legal note */}
      <div className="mt-8 rounded-xl border border-border/60 bg-card p-4 text-xs text-muted-foreground shadow-sm">
        <p>
          <strong>Nota legal:</strong> La informacion presentada es de caracter informativo y no
          constituye asesoria legal o tributaria. Consulte siempre las fuentes oficiales (Diario
          Oficial, pagina web de la DIAN) y un profesional habilitado.
        </p>
      </div>
    </div>
  );
}
