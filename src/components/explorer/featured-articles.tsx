"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Star, TrendingUp, Sparkles } from "lucide-react";
import { useArticlePanel } from "@/contexts/article-panel-context";

interface FeaturedArticle {
  id: string;
  slug: string;
  titulo: string;
  reason: string;
  badges: string[];
  total_mods: number;
  total_referenced_by: number;
}

interface FeaturedArticlesPayload {
  mas_consultados: FeaturedArticle[];
  mas_modificados: FeaturedArticle[];
  esenciales_estudiantes: FeaturedArticle[];
}

interface FeaturedArticlesProps {
  data: FeaturedArticlesPayload | null;
}

type FeaturedTab = "mas_consultados" | "mas_modificados" | "esenciales_estudiantes";

const TAB_META = {
  mas_consultados: { label: "Más consultados", icon: Star },
  mas_modificados: { label: "Más modificados", icon: TrendingUp },
  esenciales_estudiantes: { label: "Esenciales para estudio", icon: Sparkles },
} as const;

export function FeaturedArticles({ data }: FeaturedArticlesProps) {
  const [tab, setTab] = useState<FeaturedTab>("mas_consultados");
  const { openPanel } = useArticlePanel();

  const items = useMemo(() => {
    if (!data) return [];
    return data[tab] || [];
  }, [data, tab]);

  if (!data) return null;

  return (
    <section className="rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(TAB_META) as FeaturedTab[]).map((key) => {
          const Icon = TAB_META[key].icon;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                tab === key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {TAB_META[key].label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        {items.slice(0, 8).map((item) => (
          <div
            key={`${tab}-${item.slug}`}
            className="rounded-md border border-border/50 bg-muted/20 p-3"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <button
                onClick={() => openPanel(item.slug)}
                className="text-left text-sm font-semibold hover:underline"
              >
                {item.id}
              </button>
              <Link
                href={`/articulo/${item.slug}`}
                className="text-xs font-medium text-foreground hover:underline"
              >
                Abrir ficha
              </Link>
            </div>

            <p className="line-clamp-2 text-xs text-muted-foreground">{item.titulo}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{item.reason}</p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              {item.total_mods > 0 && <span>{item.total_mods} mods</span>}
              {item.total_referenced_by > 0 && (
                <span>{item.total_referenced_by} citado por</span>
              )}
              {item.badges?.slice(0, 2).map((badge) => (
                <span key={badge} className="rounded-full border border-border px-1.5 py-0.5">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
