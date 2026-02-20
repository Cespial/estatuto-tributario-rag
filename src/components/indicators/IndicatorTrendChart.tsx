"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IndicatorItem } from "@/config/indicadores-data";

interface IndicatorTrendChartProps {
  indicator: IndicatorItem;
}

function formatCompact(value: number, unit: IndicatorItem["unidad"]): string {
  if (unit === "porcentaje") return `${value}%`;
  if (unit === "indice") return value.toFixed(1);
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
}

function formatFull(value: number, unit: IndicatorItem["unidad"]): string {
  if (unit === "porcentaje") return `${value.toFixed(2)}%`;
  if (unit === "indice") return value.toFixed(2);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function IndicatorTrendChart({ indicator }: IndicatorTrendChartProps) {
  return (
    <div 
      id={`trend-${indicator.id}`}
      className="rounded-lg border border-border/60 bg-card p-4 shadow-sm scroll-mt-24"
    >
      <h4 className="mb-1 text-sm font-semibold text-foreground">{indicator.nombre}</h4>
      <p className="mb-3 text-xs text-muted-foreground">Evolución histórica</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={indicator.history} margin={{ top: 16, right: 20, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              width={72}
              tickFormatter={(value) => formatCompact(Number(value ?? 0), indicator.unidad)}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [formatFull(Number(value ?? 0), indicator.unidad), indicator.nombre]}
              labelFormatter={(label) => `Corte ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--foreground)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2, fill: "var(--foreground)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
