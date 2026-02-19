"use client";

import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { UVT_VALUES } from "@/config/tax-data";

export function UvtHistoryChart() {
  const data = useMemo(() => {
    return Object.entries(UVT_VALUES)
      .map(([year, value]) => ({
        year: parseInt(year),
        value: value,
      }))
      .sort((a, b) => a.year - b.year)
      .filter(d => d.year >= 2016); // Last 10 years for better visibility
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold tracking-tight text-foreground">Evolución UVT (Últimos 10 años)</h3>
        <p className="text-sm text-muted-foreground">Incremento histórico del valor de la Unidad de Valor Tributario</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUvt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 12, fill: "var(--foreground)" }} 
              dy={10}
            />
            <YAxis 
              tickFormatter={(value) => `$${value/1000}k`} 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--foreground)" }}
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--background)", 
                borderColor: "var(--border)",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              formatter={(value: string | number | undefined) => [formatCurrency(Number(value ?? 0)), "Valor UVT"]}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--foreground)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorUvt)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
