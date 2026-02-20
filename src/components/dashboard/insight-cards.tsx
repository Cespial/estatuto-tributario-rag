import { Lightbulb, Info, ArrowUpRight, ShieldCheck, LucideIcon } from "lucide-react";

interface Insight {
  title: string;
  description: string;
  icon: LucideIcon;
  value?: string | number;
  trend?: string;
}

interface InsightCardsProps {
  stats: {
    total_articles: number;
    libro_distribution: Array<{ name: string; value: number }>;
    top_modified: Array<{ total_mods: number }>;
    complexity_distribution?: Array<{ score: number; count: number }>;
  };
  timeseries: {
    ranges: Array<{ key: string; modified_articles: number }>;
    reform_timeline: Array<{ total: number; laws: Array<{ name: string; count: number }> }>;
  };
}

export function InsightCards({ stats, timeseries }: InsightCardsProps) {
  const insights: Insight[] = [];

  // Insight 1: Proporción de modificaciones históricas
  const totalMods = stats.top_modified.reduce((acc, curr) => acc + curr.total_mods, 0);
  const avgMods = (totalMods / stats.total_articles).toFixed(1);
  insights.push({
    title: "Densidad normativa",
    description: `El ET promedia ${avgMods} modificaciones por artículo desde su creación.`,
    icon: Lightbulb,
    value: avgMods,
  });

  // Insight 2: Complejidad técnica
  if (stats.complexity_distribution) {
    const complexCount = stats.complexity_distribution
      .filter(c => c.score >= 7)
      .reduce((acc, curr) => acc + curr.count, 0);
    insights.push({
      title: "Complejidad Alta",
      description: `${complexCount} artículos presentan un nivel de complejidad técnica superior (7+/10).`,
      icon: Info,
      value: complexCount,
    });
  }

  // Insight 3: Estabilidad reciente
  const recentMods = timeseries.ranges.find(r => r.key === "ultimos_12_meses")?.modified_articles || 0;
  const percentageRecent = ((recentMods / stats.total_articles) * 100).toFixed(1);
  insights.push({
    title: "Estabilidad 12m",
    description: `Solo el ${percentageRecent}% de los artículos variaron en el último año.`,
    icon: ShieldCheck,
    value: `${percentageRecent}%`,
  });

  // Insight 4: Libro más activo
  const maxLibro = [...stats.libro_distribution].sort((a, b) => b.value - a.value)[0];
  insights.push({
    title: "Foco Regulatorio",
    description: `El ${maxLibro.name} concentra el mayor volumen de artículos (${maxLibro.value}).`,
    icon: ArrowUpRight,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {insights.map((insight, i) => (
        <div key={i} className="flex flex-col rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-full bg-muted p-1.5 text-muted-foreground">
              <insight.icon className="h-4 w-4" />
            </div>
            {insight.value && (
              <span className="text-sm font-semibold text-foreground">{insight.value}</span>
            )}
          </div>
          <h4 className="mb-1 text-sm font-medium">{insight.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
        </div>
      ))}
    </div>
  );
}
