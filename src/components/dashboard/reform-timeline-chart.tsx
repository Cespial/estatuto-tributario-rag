"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TimelineEntry {
  year: number;
  total: number;
  laws: Array<{ name: string; count: number }>;
}

interface ReformTimelineChartProps {
  data: TimelineEntry[];
}

export function ReformTimelineChart({ data }: ReformTimelineChartProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-4 text-lg font-semibold">Reformas por año</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
              formatter={(value) => [String(value), "Artículos afectados"]}
            />
            <Bar
              dataKey="total"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
