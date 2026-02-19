import { readFile } from "fs/promises";
import { join } from "path";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ReformTimelineChart } from "@/components/dashboard/reform-timeline-chart";
import { LibroDistributionChart } from "@/components/dashboard/libro-distribution-chart";
import { TopModifiedTable } from "@/components/dashboard/top-modified-table";
import { TopReferencedTable } from "@/components/dashboard/top-referenced-table";

interface DashboardStats {
  total_articles: number;
  stats_cards: {
    total: number;
    modificados: number;
    modificados_pct: number;
    con_derogado: number;
    con_derogado_pct: number;
    con_normas: number;
    con_normas_pct: number;
  };
  libro_distribution: Array<{ name: string; value: number }>;
  reform_timeline: Array<{
    year: number;
    total: number;
    laws: Array<{ name: string; count: number }>;
  }>;
  top_modified: Array<{
    id: string;
    slug: string;
    titulo: string;
    total_mods: number;
    estado: string;
  }>;
  top_referenced: Array<{
    id: string;
    slug: string;
    titulo: string;
    total_refs: number;
    estado: string;
  }>;
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const filePath = join(process.cwd(), "public", "data", "dashboard-stats.json");
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const metadata = {
  title: "Dashboard Analítico | SuperApp Tributaria Colombia",
  description: "Analítica del Estatuto Tributario de Colombia",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10">
          <p className="text-muted-foreground">No se pudieron cargar las estadísticas del dashboard.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">
        <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Dashboard Analitico</h1>
        <p className="mb-10 text-sm text-muted-foreground">Estadisticas y metricas del Estatuto Tributario de Colombia.</p>

        <div className="space-y-8">
          {/* Stats cards */}
          <StatsCards
            total={stats.stats_cards.total}
            modificados={stats.stats_cards.modificados}
            modificadosPct={stats.stats_cards.modificados_pct}
            conDerogado={stats.stats_cards.con_derogado}
            conDerogadoPct={stats.stats_cards.con_derogado_pct}
            conNormas={stats.stats_cards.con_normas}
            conNormasPct={stats.stats_cards.con_normas_pct}
          />

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ReformTimelineChart data={stats.reform_timeline} />
            <LibroDistributionChart data={stats.libro_distribution} />
          </div>

          {/* Tables row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopModifiedTable articles={stats.top_modified} />
            <TopReferencedTable articles={stats.top_referenced} />
          </div>
        </div>
      </main>
    </div>
  );
}
