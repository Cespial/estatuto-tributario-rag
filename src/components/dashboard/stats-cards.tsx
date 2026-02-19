import { BookOpen, FileEdit, FileX, Scale } from "lucide-react";

interface StatsCardsProps {
  total: number;
  modificados: number;
  modificadosPct: number;
  conDerogado: number;
  conDerogadoPct: number;
  conNormas: number;
  conNormasPct: number;
}

const CARDS = [
  { key: "total", label: "Total articulos", icon: BookOpen, color: "text-foreground/70" },
  { key: "modificados", label: "Modificados", icon: FileEdit, color: "text-foreground/70" },
  { key: "conDerogado", label: "Con texto derogado", icon: FileX, color: "text-foreground/70" },
  { key: "conNormas", label: "Con normas", icon: Scale, color: "text-foreground/70" },
] as const;

export function StatsCards({ total, modificados, modificadosPct, conDerogado, conDerogadoPct, conNormas, conNormasPct }: StatsCardsProps) {
  const values: Record<string, { count: number; pct?: number }> = {
    total: { count: total },
    modificados: { count: modificados, pct: modificadosPct },
    conDerogado: { count: conDerogado, pct: conDerogadoPct },
    conNormas: { count: conNormas, pct: conNormasPct },
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, color }) => {
        const v = values[key];
        return (
          <div key={key} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{v.count.toLocaleString()}</div>
            {v.pct !== undefined && (
              <div className="text-sm text-muted-foreground">{v.pct}%</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
