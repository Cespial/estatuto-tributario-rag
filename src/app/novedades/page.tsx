"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Newspaper, Filter } from "lucide-react";
import {
  NOVEDADES_ENRIQUECIDAS,
  NOVEDADES_LAST_UPDATE,
  type NovedadAudiencia,
  type NovedadEnriquecida,
} from "@/config/novedades-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { NovedadAudienceFilter, type AudienceFilterValue } from "@/components/novedades/NovedadAudienceFilter";
import { NovedadExpandableCard } from "@/components/novedades/NovedadExpandableCard";
import { NovedadesWeeklyDigest } from "@/components/novedades/NovedadesWeeklyDigest";
import { NovedadTimeline } from "@/components/novedades/NovedadTimeline";

function toDate(fechaIso: string): Date {
  const [year, month, day] = fechaIso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function withinDays(fechaIso: string, days: number): boolean {
  const now = new Date();
  const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  return toDate(fechaIso) >= threshold;
}

function computeWeeklyItems(items: NovedadEnriquecida[]) {
  const latestWeek = items.filter((item) => withinDays(item.fecha, 7));
  if (latestWeek.length > 0) {
    return {
      title: "Lo más relevante esta semana",
      items: latestWeek.slice(0, 3),
    };
  }

  // Si no hay de la semana, no bajamos a 30 dias automaticamente para no confundir
  // Mostramos el estado vacio para la semana pero quiza las ultimas 3 generales abajo
  return {
    title: "No hay novedades esta semana",
    items: [],
    fallbackItems: items.slice(0, 3),
  };
}

function NovedadesPageContent() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [impactoFiltro, setImpactoFiltro] = useState<string>("todos");
  const [audienciaFiltro, setAudienciaFiltro] = useState<AudienceFilterValue>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>(() => (highlightedId ? [highlightedId] : []));

  const orderedItems = useMemo(() => {
    return [...NOVEDADES_ENRIQUECIDAS].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, []);

  const weeklyDigest = useMemo(() => computeWeeklyItems(orderedItems), [orderedItems]);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return orderedItems.filter((item) => {
      const matchesSearch =
        !lowerSearch ||
        item.titulo.toLowerCase().includes(lowerSearch) ||
        item.resumen.toLowerCase().includes(lowerSearch) ||
        item.numero.toLowerCase().includes(lowerSearch) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerSearch));

      const matchesTipo = tipoFiltro === "todos" || item.tipo === tipoFiltro;
      const matchesImpacto = impactoFiltro === "todos" || item.impactoVisual === impactoFiltro;
      const matchesAudience =
        audienciaFiltro === "todos" || item.afectaA.includes(audienciaFiltro as NovedadAudiencia);
      
      const matchesDesde = !fechaDesde || item.fecha >= fechaDesde;
      const matchesHasta = !fechaHasta || item.fecha <= fechaHasta;

      return matchesSearch && matchesTipo && matchesImpacto && matchesAudience && matchesDesde && matchesHasta;
    });
  }, [orderedItems, search, tipoFiltro, impactoFiltro, audienciaFiltro, fechaDesde, fechaHasta]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  return (
    <ReferencePageLayout
      title="Novedades Normativas"
      description="Timeline actualizado para decidir rápido: qué cambió, a quién impacta y qué acción práctica debes ejecutar hoy."
      icon={Newspaper}
      updatedAt={NOVEDADES_LAST_UPDATE}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <NovedadesWeeklyDigest 
            title={weeklyDigest.title} 
            items={weeklyDigest.items} 
            fallbackItems={weeklyDigest.fallbackItems}
          />
          <NovedadTimeline items={filtered} activeId={highlightedId} />
        </aside>

        <section className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por título, número, tags..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full rounded border border-border/60 bg-background pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
                />
              </div>

              <select
                value={tipoFiltro}
                onChange={(event) => setTipoFiltro(event.target.value)}
                className="h-11 rounded border border-border/60 bg-background px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
              >
                <option value="todos">Todos los tipos</option>
                <option value="ley">Ley</option>
                <option value="decreto">Decreto</option>
                <option value="resolucion">Resolución</option>
                <option value="circular">Circular</option>
                <option value="sentencia">Sentencia</option>
                <option value="concepto">Concepto</option>
              </select>

              <select
                value={impactoFiltro}
                onChange={(event) => setImpactoFiltro(event.target.value)}
                className="h-11 rounded border border-border/60 bg-background px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
              >
                <option value="todos">Todos los impactos</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="informativo">Informativo</option>
              </select>
            </div>

            <div className="mt-3 grid gap-3 border-t border-border/40 pt-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Desde:</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="h-9 w-full rounded border border-border/60 bg-background px-2 text-xs outline-none focus:border-foreground/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="h-9 w-full rounded border border-border/60 bg-background px-2 text-xs outline-none focus:border-foreground/40"
                />
                {(fechaDesde || fechaHasta) && (
                  <button
                    onClick={() => { setFechaDesde(""); setFechaHasta(""); }}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 border-t border-border/40 pt-3">
              <NovedadAudienceFilter value={audienciaFiltro} onChange={setAudienciaFiltro} />
            </div>
          </div>

          <div className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            {filtered.length} novedad{filtered.length !== 1 ? "es" : ""} encontrada
            {filtered.length !== 1 ? "s" : ""}
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((novedad) => (
                <NovedadExpandableCard
                  key={novedad.id}
                  novedad={novedad}
                  expanded={expandedIds.includes(novedad.id)}
                  highlighted={highlightedId === novedad.id}
                  onToggle={() => toggleExpanded(novedad.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 border-dashed bg-muted/20 py-16 text-center text-muted-foreground">
              <Filter className="mx-auto mb-3 h-8 w-8 opacity-30" />
              <p className="text-lg font-medium text-foreground">No se encontraron novedades</p>
              <p className="mt-1 text-sm">Prueba otro perfil afectado o limpia filtros de impacto/tipo.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTipoFiltro("todos");
                  setImpactoFiltro("todos");
                  setAudienciaFiltro("todos");
                  setFechaDesde("");
                  setFechaHasta("");
                }}
                className="mt-3 text-sm font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="rounded-lg border border-border/60 bg-card p-4 text-xs text-muted-foreground shadow-sm">
            <p>
              <strong>Nota legal:</strong> La información es de carácter orientativo y no reemplaza lectura de la
              fuente oficial. Verifica siempre texto vigente en DIAN, Diario Oficial o entidad emisora.
            </p>
          </div>
        </section>
      </div>
    </ReferencePageLayout>
  );
}

export default function NovedadesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando novedades...</div>}>
      <NovedadesPageContent />
    </Suspense>
  );
}
