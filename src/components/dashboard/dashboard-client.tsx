"use client";

import { useMemo, useState } from "react";
import { TimeRangeFilter } from "@/components/dashboard/time-range-filter";
import { ActionKpiCards } from "@/components/dashboard/action-kpi-cards";
import { ReformDrilldownChart } from "@/components/dashboard/reform-drilldown-chart";
import { LibroTreemapChart } from "@/components/dashboard/libro-treemap-chart";
import { TopModifiedTable } from "@/components/dashboard/top-modified-table";
import { TopReferencedTrendTable } from "@/components/dashboard/top-referenced-trend-table";
import { DashboardExportActions } from "@/components/dashboard/dashboard-export-actions";

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

interface DashboardRange {
  key: "historico" | "ultima_reforma" | "ultimos_12_meses";
  label: string;
  modified_articles: number;
  modified_percentage: number;
  with_normas: number;
  with_derogado_text: number;
  granularity: "year";
  note?: string;
}

interface DashboardTimeSeries {
  latest_year: number;
  granularity_notice: string;
  ranges: DashboardRange[];
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

interface DashboardClientProps {
  stats: DashboardStats;
  timeseries: DashboardTimeSeries;
}

export function DashboardClient({ stats, timeseries }: DashboardClientProps) {
  const [rangeKey, setRangeKey] = useState<DashboardRange["key"]>("historico");
  const [selectedYear, setSelectedYear] = useState<number>(timeseries.latest_year);

  const currentRange =
    timeseries.ranges.find((range) => range.key === rangeKey) || timeseries.ranges[0];

  const filteredTimeline = useMemo(() => {
    if (rangeKey === "historico") return timeseries.reform_timeline;
    return timeseries.reform_timeline.filter(
      (entry) => entry.year === timeseries.latest_year
    );
  }, [rangeKey, timeseries.latest_year, timeseries.reform_timeline]);

  const effectiveSelectedYear = useMemo(() => {
    if (filteredTimeline.length === 0) return timeseries.latest_year;
    if (filteredTimeline.some((entry) => entry.year === selectedYear)) {
      return selectedYear;
    }
    return filteredTimeline[filteredTimeline.length - 1].year;
  }, [filteredTimeline, selectedYear, timeseries.latest_year]);

  const topLaw = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of filteredTimeline) {
      for (const law of entry.laws) {
        map.set(law.name, (map.get(law.name) || 0) + law.count);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)[0];
  }, [filteredTimeline]);

  const exportRows = filteredTimeline.map((entry) => ({
    year: entry.year,
    total_reformas: entry.total,
    leyes_distintas: entry.laws.length,
    ley_principal: entry.laws[0]?.name || "",
  }));

  const exportPayload = {
    range: rangeKey,
    generatedAt: new Date().toISOString(),
    kpis: currentRange,
    reform_timeline: filteredTimeline,
    top_modified: stats.top_modified,
    top_referenced: stats.top_referenced,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <TimeRangeFilter
          value={rangeKey}
          onChange={(next) => {
            setRangeKey(next as DashboardRange["key"]);
            setSelectedYear(timeseries.latest_year);
          }}
          options={timeseries.ranges.map((range) => ({
            key: range.key,
            label: range.label,
            description: range.note,
          }))}
        />
        <DashboardExportActions
          filenamePrefix={`dashboard-et-${rangeKey}`}
          payload={exportPayload}
          rowsForCsv={exportRows}
        />
      </div>

      <ActionKpiCards
        modifiedArticles={currentRange.modified_articles}
        modifiedPercentage={currentRange.modified_percentage}
        withNormas={currentRange.with_normas}
        withDerogadoText={currentRange.with_derogado_text}
        topLaw={topLaw || null}
      />

      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        {currentRange.note || timeseries.granularity_notice}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReformDrilldownChart
          data={filteredTimeline}
          selectedYear={effectiveSelectedYear}
          onYearSelect={setSelectedYear}
        />
        <LibroTreemapChart data={stats.libro_distribution} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopModifiedTable articles={stats.top_modified} />
        <TopReferencedTrendTable
          articles={stats.top_referenced}
          trends={timeseries.article_modification_trends}
        />
      </div>
    </div>
  );
}
