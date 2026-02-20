"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

interface TopReferencedArticle {
  id: string;
  slug: string;
  titulo: string;
  total_refs: number;
  estado: string;
}

interface TrendSeries {
  slug: string;
  series: Array<{ year: number; count: number }>;
}

interface TopReferencedTrendTableProps {
  articles: TopReferencedArticle[];
  trends: TrendSeries[];
  title?: string;
}

const ESTADO_DOT: Record<string, string> = {
  vigente: "bg-foreground",
  modificado: "bg-foreground/60",
  derogado: "bg-foreground/30",
};

export function TopReferencedTrendTable({
  articles,
  trends,
  title,
}: TopReferencedTrendTableProps) {
  if (articles.length === 0) return null;

  const trendMap = new Map(trends.map((trend) => [trend.slug, trend.series]));

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif mb-3 text-lg">
        {title || "Top referenciados + tendencia de reformas"}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Artículo</th>
              <th className="px-2 py-2">Título</th>
              <th className="px-2 py-2 text-right">Refs</th>
              <th className="px-2 py-2 text-right">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => {
              const series = trendMap.get(article.slug) || [];
              return (
                <tr
                  key={article.slug}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-2 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-2 py-2">
                    <Link
                      href={`/articulo/${article.slug}`}
                      className="inline-flex items-center gap-1.5 font-medium hover:underline"
                    >
                      <span
                        className={clsx(
                          "h-2 w-2 rounded-full",
                          ESTADO_DOT[article.estado] || "bg-foreground/40"
                        )}
                      />
                      {article.id}
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">
                    <p className="line-clamp-1">{article.titulo}</p>
                  </td>
                  <td className="px-2 py-2 text-right font-medium">
                    {article.total_refs}
                  </td>
                  <td className="px-2 py-2">
                    <div className="ml-auto h-12 w-40 min-w-[120px]">
                      {series.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={series}>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--background)",
                                border: "1px solid var(--border)",
                                borderRadius: "0.5rem",
                                fontSize: "0.75rem",
                              }}
                              formatter={(value) => [String(value ?? 0), "Eventos"]}
                              labelFormatter={(label) => `Año ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-right text-[10px] text-muted-foreground/60">Sin datos de tendencia</p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
