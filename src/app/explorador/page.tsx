"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { Grid3X3, GitBranch, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/explorer/search-bar";
import { FilterPanel } from "@/components/explorer/filter-panel";
import { ArticleGrid } from "@/components/explorer/article-grid";
import { RelationshipGraph } from "@/components/explorer/relationship-graph";

interface ArticleIndex {
  id: string;
  slug: string;
  titulo: string;
  libro: string;
  estado: string;
  total_mods: number;
  total_refs: number;
  total_referenced_by: number;
  complexity: number;
  has_normas: boolean;
}

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

interface Filters {
  libro: string;
  estado: string;
  hasMods: boolean | null;
  hasNormas: boolean | null;
}

const PAGE_SIZE = 60;

export default function ExploradorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </main>
      </div>
    }>
      <ExploradorContent />
    </Suspense>
  );
}

function ExploradorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<ArticleIndex[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [graphError, setGraphError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize from URL params
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<Filters>({
    libro: searchParams.get("libro") || "",
    estado: searchParams.get("estado") || "",
    hasMods: searchParams.get("hasMods") === "true" ? true : null,
    hasNormas: searchParams.get("hasNormas") === "true" ? true : null,
  });
  const [view, setView] = useState<"grid" | "graph">(
    (searchParams.get("view") as "grid" | "graph") || "grid"
  );
  const [page, setPage] = useState(0);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filters.libro) params.set("libro", filters.libro);
    if (filters.estado) params.set("estado", filters.estado);
    if (filters.hasMods === true) params.set("hasMods", "true");
    if (filters.hasNormas === true) params.set("hasNormas", "true");
    if (view !== "grid") params.set("view", view);

    const paramString = params.toString();
    router.replace(`/explorador${paramString ? `?${paramString}` : ""}`, { scroll: false });
  }, [search, filters, view, router]);

  // Load data with individual error handling
  useEffect(() => {
    const loadArticles = fetch("/data/articles-index.json")
      .then((r) => r.json())
      .catch(() => [] as ArticleIndex[]);

    const loadGraph = fetch("/data/graph-data.json")
      .then((r) => r.json())
      .catch(() => {
        setGraphError(true);
        return null;
      });

    Promise.all([loadArticles, loadGraph]).then(([idx, graph]) => {
      setArticles(idx);
      setGraphData(graph);
      setLoading(false);
    });
  }, []);

  // Reset page on filter/search change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPage(0), [search, filters]);

  // Filter articles
  const filtered = useMemo(() => {
    let result = articles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.titulo.toLowerCase().includes(q) ||
          a.slug.includes(q)
      );
    }
    if (filters.libro) {
      result = result.filter((a) => a.libro === filters.libro);
    }
    if (filters.estado) {
      result = result.filter((a) => a.estado === filters.estado);
    }
    if (filters.hasMods === true) {
      result = result.filter((a) => a.total_mods > 0);
    }
    if (filters.hasNormas === true) {
      result = result.filter((a) => a.has_normas);
    }
    return result;
  }, [articles, search, filters]);

  const paginated = useMemo(
    () => filtered.slice(0, (page + 1) * PAGE_SIZE),
    [filtered, page]
  );

  const handleSearch = useCallback((val: string) => setSearch(val), []);
  const handleFilters = useCallback((f: Filters) => setFilters(f), []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Explorador</h1>
            <p className="mt-1 text-sm text-muted-foreground">Navegue y filtre los articulos del Estatuto Tributario.</p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setView("grid")}
              className={clsx(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => setView("graph")}
              className={clsx(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                view === "graph" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GitBranch className="h-4 w-4" />
              Grafo
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <SearchBar value={search} onChange={handleSearch} />
          <FilterPanel filters={filters} onChange={handleFilters} />
        </div>

        {/* Content */}
        {view === "grid" ? (
          <>
            <ArticleGrid articles={paginated} total={filtered.length} />
            {paginated.length < filtered.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cargar más ({filtered.length - paginated.length} restantes)
                </button>
              </div>
            )}
          </>
        ) : graphError || !graphData ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/50 py-16">
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              El grafo de relaciones no está disponible en este momento.
            </p>
          </div>
        ) : (
          <RelationshipGraph data={graphData} maxNodes={200} />
        )}
      </main>
    </div>
  );
}
