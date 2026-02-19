"use client";

import Link from "next/link";
import type { NovedadEnriquecida } from "@/config/novedades-data";
import { clsx } from "clsx";

interface NovedadTimelineProps {
  items: NovedadEnriquecida[];
  activeId?: string | null;
}

function colorByImpact(impacto: NovedadEnriquecida["impactoVisual"]): string {
  if (impacto === "alto") return "bg-red-500";
  if (impacto === "medio") return "bg-amber-500";
  return "bg-sky-500";
}

function formatShortDate(fechaIso: string): string {
  const [year, month, day] = fechaIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

export function NovedadTimeline({ items, activeId }: NovedadTimelineProps) {
  return (
    <aside className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Timeline normativo
      </h3>
      <div className="relative ml-2 border-l border-border pl-4">
        {items.slice(0, 12).map((item) => (
          <div key={item.id} className="relative mb-4 last:mb-0">
            <span
              className={clsx(
                "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-background",
                colorByImpact(item.impactoVisual)
              )}
            />
            <Link
              href={`#${item.id}`}
              className={clsx(
                "block rounded px-2 py-1.5 transition-colors hover:bg-muted/40",
                activeId === item.id && "bg-muted"
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">{formatShortDate(item.fecha)}</p>
              <p className="line-clamp-2 text-xs text-foreground">{item.titulo}</p>
            </Link>
          </div>
        ))}
      </div>
    </aside>
  );
}

