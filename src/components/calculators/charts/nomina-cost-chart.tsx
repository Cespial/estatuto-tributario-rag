"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCOP } from "@/lib/calculators/format";

interface NominaCostChartProps {
  salario: number;
  auxilio: number;
  ssParafiscales: number;
  prestaciones: number;
  netoTrabajador: number;
  descuentosTrabajador: number;
}

const PIE_COLORS = ["#1f1d1a", "#d8d6d1"];

export function NominaCostChart({
  salario,
  auxilio,
  ssParafiscales,
  prestaciones,
  netoTrabajador,
  descuentosTrabajador,
}: NominaCostChartProps) {
  const employerData = [
    {
      name: "Costo mensual",
      salario: Math.max(0, salario),
      auxilio: Math.max(0, auxilio),
      ss: Math.max(0, ssParafiscales),
      prestaciones: Math.max(0, prestaciones),
    },
  ];

  const workerData = [
    { name: "Neto trabajador", value: Math.max(0, netoTrabajador) },
    { name: "Deducciones", value: Math.max(0, descuentosTrabajador) },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Desglose del costo empresa</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employerData} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
                <Bar stackId="a" dataKey="salario" fill="#1f1d1a" name="Salario" />
                <Bar stackId="a" dataKey="auxilio" fill="#706d66" name="Auxilio transporte" />
                <Bar stackId="a" dataKey="ss" fill="#b4b1aa" name="SS y parafiscales" />
              <Bar stackId="a" dataKey="prestaciones" fill="#d8d6d1" name="Prestaciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Distribucion neto vs deducciones trabajador</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={workerData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={88}>
                {workerData.map((_, index) => (
                  <Cell key={`nom-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
