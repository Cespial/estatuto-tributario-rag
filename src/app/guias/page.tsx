"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Filter,
  Building2,
  ReceiptText,
  Landmark,
  Briefcase,
  Scale,
  Clock3,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { clsx } from "clsx";
import {
  ENRICHED_GUIAS,
  getGuideQuestionCount,
} from "@/lib/knowledge/knowledge-index";
import type { GuiaProgressSnapshot } from "@/types/knowledge";

const CATEGORIAS = [
  { value: "todas", label: "Todas" },
  { value: "renta", label: "Renta" },
  { value: "iva", label: "IVA" },
  { value: "retencion", label: "Retención" },
  { value: "laboral", label: "Laboral" },
  { value: "general", label: "General" },
] as const;

const CATEGORY_CONFIG = {
  renta: {
    icon: Landmark,
    chip: "bg-amber-100/70 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800/60",
  },
  iva: {
    icon: ReceiptText,
    chip: "bg-sky-100/70 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800/60",
  },
  retencion: {
    icon: Scale,
    chip: "bg-rose-100/70 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800/60",
  },
  laboral: {
    icon: Briefcase,
    chip: "bg-teal-100/70 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-800/60",
  },
  general: {
    icon: Building2,
    chip: "bg-muted text-foreground border-border",
  },
} as const;

const COMPLEJIDAD_COLORS = {
  basica: "bg-emerald-100/70 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/60",
  intermedia: "bg-amber-100/70 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800/60",
  avanzada: "bg-foreground text-background border-foreground",
} as const;

const COMPLEJIDAD_LABELS = {
  basica: "Básica",
  intermedia: "Intermedia",
  avanzada: "Avanzada",
} as const;

function getStoredProgressByGuide(): Record<string, GuiaProgressSnapshot> {
  if (typeof window === "undefined") return {};

  return ENRICHED_GUIAS.reduce<Record<string, GuiaProgressSnapshot>>((acc, guide) => {
    const raw = localStorage.getItem(`tc_guia_progress_${guide.id}`);
    if (!raw) return acc;

    try {
      const parsed = JSON.parse(raw) as GuiaProgressSnapshot;
      acc[guide.id] = parsed;
    } catch {
      // Ignore malformed snapshots.
    }

    return acc;
  }, {});
}

export default function GuiasPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
  const [progressByGuide] = useState<Record<string, GuiaProgressSnapshot>>(getStoredProgressByGuide);

  const guiasFiltradas = useMemo(
    () =>
      categoriaActiva === "todas"
        ? ENRICHED_GUIAS
        : ENRICHED_GUIAS.filter((guide) => guide.categoria === categoriaActiva),
    [categoriaActiva]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ReferencePageLayout
          title="Guías Interactivas"
          description="Wizards tributarios con decisiones paso a paso, progreso guardado y resultado compartible."
          icon={GraduationCap}
        >
          <section className="mb-8 rounded-lg border border-border/60 bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaActiva(cat.value)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    categoriaActiva === cat.value
                      ? "border border-foreground bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Consejo: puedes retomar cualquier guía automáticamente desde el último paso guardado en este dispositivo.
            </p>
          </section>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {guiasFiltradas.map((guide) => {
              const progress = progressByGuide[guide.id];
              const hasProgress = Boolean(progress && !progress.completed && progress.history.length > 0);
              const Icon = CATEGORY_CONFIG[guide.categoria].icon;
              const totalQuestions = getGuideQuestionCount(guide);

              return (
                <Link
                  key={guide.id}
                  href={`/guias/${guide.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={clsx(
                        "rounded-lg border p-2.5",
                        CATEGORY_CONFIG[guide.categoria].chip
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <span
                        className={clsx(
                          "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          CATEGORY_CONFIG[guide.categoria].chip
                        )}
                      >
                        {guide.categoria}
                      </span>
                      <span
                        className={clsx(
                          "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          COMPLEJIDAD_COLORS[guide.complejidad]
                        )}
                      >
                        {COMPLEJIDAD_LABELS[guide.complejidad]}
                      </span>
                    </div>
                  </div>

                  <h3 className="heading-serif mb-2 text-xl text-foreground">{guide.titulo}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {guide.descripcion}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      ~{guide.tiempoEstimadoMin} min
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {totalQuestions} pasos
                    </span>
                    {hasProgress && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tienes avance
                      </span>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-3">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 group-hover:text-foreground">
                      {hasProgress ? "Continuar donde ibas" : "Iniciar guía"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {guiasFiltradas.length === 0 && (
            <div className="rounded-lg border border-border/60 border-dashed bg-muted/30 py-20 text-center text-muted-foreground">
              <GraduationCap className="mx-auto mb-4 h-10 w-10 opacity-20" />
              <p className="text-lg font-medium text-foreground">No hay guías en esta categoría</p>
              <p className="text-sm">Seleccione otra categoría para ver guías disponibles.</p>
              <button
                onClick={() => setCategoriaActiva("todas")}
                className="mt-4 text-sm font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
              >
                Ver todas las guías
              </button>
            </div>
          )}
        </ReferencePageLayout>
      </main>
    </div>
  );
}
