"use client";

import Link from "next/link";
import { Clock3, ExternalLink } from "lucide-react";
import type { CalendarDeadlineItem } from "@/types/calendar";
import { formatCountdownText } from "@/lib/calendar/status";
import { DeadlineStatusBadge } from "@/components/calendar/DeadlineStatusBadge";

interface UpcomingDeadlinesPanelProps {
  items: CalendarDeadlineItem[];
}

function formatFecha(fechaIso: string): string {
  const [year, month, day] = fechaIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UpcomingDeadlinesPanel({ items }: UpcomingDeadlinesPanelProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Próximos vencimientos</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No hay vencimientos próximos con los filtros activos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Tus próximos vencimientos críticos</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-md border border-border/60 bg-muted/20 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                {formatFecha(item.fecha)}
              </span>
              <DeadlineStatusBadge status={item.status} />
            </div>
            <p className="line-clamp-2 text-sm font-medium text-foreground">{item.obligacion}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatCountdownText(item.fecha)}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">NIT {item.ultimoDigito}</span>
              <Link
                href={item.calculadoraHref}
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
              >
                Calculadora
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

