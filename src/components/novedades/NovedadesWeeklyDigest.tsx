"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NovedadEnriquecida } from "@/config/novedades-data";
import { NovedadImpactBadge } from "@/components/novedades/NovedadImpactBadge";

interface NovedadesWeeklyDigestProps {
  items: NovedadEnriquecida[];
  title: string;
  fallbackItems?: NovedadEnriquecida[];
}

export function NovedadesWeeklyDigest({ items, title, fallbackItems = [] }: NovedadesWeeklyDigestProps) {
  const displayItems = items.length > 0 ? items : fallbackItems;
  const isFallback = items.length === 0 && fallbackItems.length > 0;

  return (
    <section className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif text-xl text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length > 0 ? "Lo clave para no incumplir esta semana." : "Mostrando novedades relevantes anteriores."}
      </p>

      <div className="mt-3 space-y-3">
        {isFallback && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b border-border/40 pb-1">
            Últimas relevantes
          </p>
        )}
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <article key={item.id} className="rounded-md border border-border/60 bg-muted/20 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{item.fecha}</p>
                <NovedadImpactBadge impacto={item.impactoVisual} />
              </div>
              <h4 className="text-sm font-medium text-foreground">{item.titulo}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.queSignificaParaTi}</p>
              <Link
                href={`#${item.id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
              >
                Ver detalle
                <ArrowRight className="h-3 w-3" />
              </Link>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Sin novedades destacadas en este periodo.</p>
        )}
      </div>
    </section>
  );
}

