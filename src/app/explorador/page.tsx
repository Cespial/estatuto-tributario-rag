"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, GitBranch, Grid3X3, List } from "lucide-react";
import { clsx } from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/explorer/search-bar";
import {
  FilterPanel,
  type ExplorerFilters,
} from "@/components/explorer/filter-panel";
import { ArticleGrid } from "@/components/explorer/article-grid";
import { ArticleList } from "@/components/explorer/article-list";
import { RelationshipGraph } from "@/components/explorer/relationship-graph";
import { FeaturedArticles } from "@/components/explorer/featured-articles";
import { SkeletonGrid, SkeletonList } from "@/components/explorer/explorer-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeForSearch } from "@/lib/utils/text-normalize";
import { matchesLawFilter } from "@/lib/utils/law-normalize";
import type { ArticleIndexEnrichedItem } from "@/lib/types/articles";

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    titulo: string;
    libro: string;
    estado: string;
    complexity: number;
    refs_out: number;
    refs_in: number;
  }>;
  edges: Array<{ source: string; target: string }>;
}

interface ExplorerFacets {
  libros: Array<{ key: string; label: string; count: number }>;
  estados: Array<{ key: string; label: string; count: number }>;
  mod_years: Array<{ year: number; count: number }>;
  laws: Array<{ key: string; label: string; count: number }>;
}

interface FeaturedArticlesPayload {
  mas_consultados: Array<{
    id: string;
    slug: string;
    titulo: string;
    reason: string;
    badges: string[];
    total_mods: number;
    total_referenced_by: number;
  }>;
  mas_modificados: Array<{
    id: string;
    slug: string;
    titulo: string;
    reason: string;
    badges: string[];
    total_mods: number;
    total_referenced_by: number;
  }>;
  esenciales_estudiantes: Array<{
    id: string;
    slug: string;
    titulo: string;
    reason: string;
    badges: string[];
    total_mods: number;
    total_referenced_by: number;
  }>;
}

const PAGE_SIZE = 60;

function getInitialFilters(searchParams: { get: (key: string) => string | null }): ExplorerFilters {
  return {
    libro: searchParams.get("libro") || "",
    estado: searchParams.get("estado") || "",
    hasMods: searchParams.get("hasMods") === "true" ? true : null,
    hasNormas: searchParams.get("hasNormas") === "true" ? true : null,
    law: searchParams.get("law") || "",
    modYear: searchParams.get("modYear")
      ? Number(searchParams.get("modYear"))
      : null,
  };
}

function ExploradorPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </main>
        </div>
      }
    >
      <ExploradorContent />
    </Suspense>
  );
}

export default function ExploradorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando explorador...</div>}>
      <ExploradorPageContent />
    </Suspense>
  );
}

function ExploradorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<ArticleIndexEnrichedItem[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [facets, setFacets] = useState<ExplorerFacets | null>(null);
  const [featured, setFeatured] = useState<FeaturedArticlesPayload | null>(null);
  const [graphError, setGraphError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<ExplorerFilters>(
    getInitialFilters(searchParams)
  );
  const [view, setView] = useState<"grid" | "list" | "graph">(
    (searchParams.get("view") as "grid" | "list" | "graph") || "grid"
  );
  const [page, setPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filters.libro) params.set("libro", filters.libro);
    if (filters.estado) params.set("estado", filters.estado);
    if (filters.hasMods === true) params.set("hasMods", "true");
    if (filters.hasNormas === true) params.set("hasNormas", "true");
    if (filters.law) params.set("law", filters.law);
    if (filters.modYear) params.set("modYear", String(filters.modYear));
    if (view !== "grid") params.set("view", view);

    const paramString = params.toString();
    router.replace(`/explorador${paramString ? `?${paramString}` : ""}`, {
      scroll: false,
    });
  }, [filters, router, search, view]);

  useEffect(() => {
    const loadEnriched = fetch("/data/articles-index.enriched.json")
      .then((response) => response.json())
      .catch(() =>
        fetch("/data/articles-index.json").then((response) => response.json())
      );

    const loadFacets = fetch("/data/explorer-facets.json")
      .then((response) => response.json())
      .catch(() => null);

    const loadFeatured = fetch("/data/featured-articles.json")
      .then((response) => response.json())
      .catch(() => null);

    const loadGraph = fetch("/data/graph-data.json")
      .then((response) => response.json())
      .catch(() => {
        setGraphError(true);
        return null;
      });

    Promise.all([loadEnriched, loadFacets, loadFeatured, loadGraph]).then(
      ([indexData, facetData, featuredData, graph]) => {
        setArticles(indexData);
        setFacets(facetData);
        setFeatured(featuredData);
        setGraphData(graph);
        setLoading(false);
      }
    );
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPage(0), [filters, search, view]);

  const filtered = useMemo(() => {
    let result = articles;

    if (search) {
      const query = normalizeForSearch(search);
      result = result.filter((article) => {
        const textBlob = normalizeForSearch(
          `${article.id} ${article.titulo} ${article.slug} ${
            article.preview_snippet || ""
          } ${(article.leyes_modificatorias_normalized || []).join(" ")}`
        );
        return textBlob.includes(query);
      });
    }

    if (filters.libro) {
      result = result.filter((article) => article.libro === filters.libro);
    }

    if (filters.estado) {
      result = result.filter((article) => article.estado === filters.estado);
    }

    if (filters.hasMods === true) {
      result = result.filter((article) => article.total_mods > 0);
    }

    if (filters.hasNormas === true) {
      result = result.filter((article) => article.has_normas);
    }

    if (filters.modYear) {
      result = result.filter(
        (article) => article.ultima_modificacion_year === filters.modYear
      );
    }

    if (filters.law) {
      result = result.filter((article) =>
        matchesLawFilter(
          article.leyes_modificatorias_normalized || article.leyes_modificatorias || [],
          filters.law
        )
      );
    }

    return result;
  }, [articles, filters, search]);

  const visibleItems = useMemo(
    () => filtered.slice(0, (page + 1) * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    if (view === "graph") return;
    if (!sentinelRef.current) return;
    if (visibleItems.length >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filtered.length, view, visibleItems.length]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);
  const handleFilters = useCallback(
    (nextFilters: ExplorerFilters) => setFilters(nextFilters),
    []
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-serif text-3xl">Explorador del Estatuto</h1>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Busque, filtre y navegue los 1,294 artículos del ET con vista rápida
              y relaciones entre normas.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              disabled={loading}
              onClick={() => setView("grid")}
              className={clsx(
                "flex items-center gap-1.5 rounded px-3 py-2 text-sm transition-colors",
                view === "grid"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </button>
            <button
              disabled={loading}
              onClick={() => setView("list")}
              className={clsx(
                "flex items-center gap-1.5 rounded px-3 py-2 text-sm transition-colors",
                view === "list"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
            <button
              disabled={loading}
              onClick={() => setView("graph")}
              className={clsx(
                "flex items-center gap-1.5 rounded px-3 py-2 text-sm transition-colors",
                view === "graph"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <GitBranch className="h-4 w-4" />
              Grafo
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <SearchBar value={search} onChange={handleSearch} articles={articles} />
          <FilterPanel filters={filters} facets={facets} onChange={handleFilters} />
        </div>

        <div className="mb-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl border border-border/40 bg-card p-4">
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FeaturedArticles data={featured} />
          )}
        </div>

        {loading ? (
          view === "grid" ? <SkeletonGrid /> : <SkeletonList />
        ) : view === "graph" ? (
          graphError || !graphData ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/50 py-16">
              <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                El grafo de relaciones no está disponible en este momento.
              </p>
            </div>
          ) : (
            <RelationshipGraph data={graphData} maxNodes={260} />
          )
        ) : (
          <>
            {view === "grid" ? (
              <ArticleGrid articles={visibleItems} total={filtered.length} />
            ) : (
              <ArticleList articles={visibleItems} total={filtered.length} />
            )}

            {visibleItems.length < filtered.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cargar más ({filtered.length - visibleItems.length} restantes)
                </button>
              </div>
            )}
            <div ref={sentinelRef} className="h-8" />
          </>
        )}
      </main>
    </div>
  );
}
