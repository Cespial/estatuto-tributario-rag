"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

interface LibroEntry {
  name: string;
  value: number;
}

interface LibroTreemapChartProps {
  data: LibroEntry[];
}

const COLORS = [
  "hsl(0,0%,10%)",
  "hsl(0,0%,18%)",
  "hsl(0,0%,28%)",
  "hsl(0,0%,36%)",
  "hsl(0,0%,46%)",
  "hsl(0,0%,56%)",
  "hsl(0,0%,66%)",
];

export function LibroTreemapChart({ data }: LibroTreemapChartProps) {
  const payload = data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif mb-4 text-lg">Distribución por libro (Treemap)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={payload}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="var(--border)"
            fill="hsl(0,0%,15%)"
          >
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
              formatter={(value) => [String(value ?? 0), "Artículos"]}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span>
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
