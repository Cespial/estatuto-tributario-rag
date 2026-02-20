import { readFile } from "fs/promises";
import { join } from "path";
import { AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

interface DashboardStats {
  total_articles: number;
  libro_distribution: Array<{ name: string; value: number }>;
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

interface DashboardTimeSeries {
  generated_at?: string;
  latest_year: number;
  granularity_notice: string;
  ranges: Array<{
    key: "historico" | "ultima_reforma" | "ultimos_12_meses";
    label: string;
    modified_articles: number;
    modified_percentage: number;
    with_normas: number;
    with_derogado_text: number;
    granularity: "year";
    note?: string;
  }>;
  reform_timeline: Array<{
    year: number;
    total: number;
    laws: Array<{ name: string; count: number }>;
  }>;
  article_modification_trends: Array<{
    slug: string;
    series: Array<{ year: number; count: number }>;
  }>;
}

async function readJsonFile<T>(pathName: string): Promise<T | null> {
  try {
    const filePath = join(process.cwd(), "public", "data", pathName);
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
  const [stats, timeseries, articleIndex] = await Promise.all([
    readJsonFile<DashboardStats>("dashboard-stats.json"),
    readJsonFile<DashboardTimeSeries>("dashboard-timeseries.json"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readJsonFile<any[]>("articles-index.json"),
  ]);

  if (!stats || !timeseries) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="heading-serif text-xl text-foreground">
              Error al cargar datos
            </h3>
            <p className="mt-2 max-w-sm text-base leading-relaxed text-muted-foreground">
              No se pudieron cargar las estadísticas del dashboard. Intente
              recargar la página.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">
        <h1 className="heading-serif mb-2 text-3xl">Dashboard analítico</h1>
        <p className="mb-8 text-base leading-relaxed text-muted-foreground">
          Indicadores accionables, tendencias de reforma y distribución del ET.
        </p>

        <DashboardClient
          stats={stats}
          timeseries={timeseries}
          articleIndex={articleIndex || []}
          lastUpdate={timeseries.generated_at}
        />
      </main>
    </div>
  );
}
