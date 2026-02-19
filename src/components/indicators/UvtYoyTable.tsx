"use client";

interface UvtComparativeRow {
  year: number;
  value: number;
}

interface UvtYoyTableProps {
  rows: UvtComparativeRow[];
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function UvtYoyTable({ rows }: UvtYoyTableProps) {
  const enriched = rows.map((row, index) => {
    if (index === 0) {
      return {
        ...row,
        delta: null as number | null,
        deltaPct: null as number | null,
      };
    }
    const prev = rows[index - 1].value;
    const delta = row.value - prev;
    const deltaPct = prev === 0 ? 0 : (delta / prev) * 100;
    return { ...row, delta, deltaPct };
  });

  return (
    <section className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
      <h3 className="mb-3 font-semibold text-foreground">Comparativo UVT año a año</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
              <th className="px-3 py-2 text-left">Año</th>
              <th className="px-3 py-2 text-right">Valor UVT</th>
              <th className="px-3 py-2 text-right">Variación $</th>
              <th className="px-3 py-2 text-right">Variación %</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((row) => (
              <tr key={row.year} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium">{row.year}</td>
                <td className="px-3 py-2 text-right">{formatCOP(row.value)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {row.delta === null ? "—" : formatCOP(row.delta)}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {row.deltaPct === null ? "—" : `${row.deltaPct >= 0 ? "+" : ""}${row.deltaPct.toFixed(2)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

