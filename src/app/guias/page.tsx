"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Filter } from "lucide-react";
import { GUIAS_EDUCATIVAS, type GuiaEducativa } from "@/config/guias-data";
import { Header } from "@/components/layout/header";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { clsx } from "clsx";

const CATEGORIAS = [
  { value: "todas", label: "Todas" },
  { value: "renta", label: "Renta" },
  { value: "iva", label: "IVA" },
  { value: "retencion", label: "Retención" },
  { value: "laboral", label: "Laboral" },
  { value: "general", label: "General" },
] as const;

const COMPLEJIDAD_COLORS: Record<GuiaEducativa["complejidad"], string> = {
  basica: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermedia: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  avanzada: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const COMPLEJIDAD_LABELS: Record<GuiaEducativa["complejidad"], string> = {
  basica: "Básica",
  intermedia: "Intermedia",
  avanzada: "Avanzada",
};

const CATEGORIA_COLORS: Record<GuiaEducativa["categoria"], string> = {
  renta: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  iva: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  retencion: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  laboral: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  general: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function GuiasPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");

  const guiasFiltradas =
    categoriaActiva === "todas"
      ? GUIAS_EDUCATIVAS
      : GUIAS_EDUCATIVAS.filter((g) => g.categoria === categoriaActiva);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ReferencePageLayout
          title="Guías Educativas"
          description="Árboles de decisión interactivos para resolver tus dudas tributarias paso a paso."
          icon={GraduationCap}
        >
          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoriaActiva(cat.value)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  categoriaActiva === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Guide cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guiasFiltradas.map((guia) => (
              <Link
                key={guia.id}
                href={`/guias/${guia.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        CATEGORIA_COLORS[guia.categoria]
                      )}
                    >
                      {guia.categoria}
                    </span>
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        COMPLEJIDAD_COLORS[guia.complejidad]
                      )}
                    >
                      {COMPLEJIDAD_LABELS[guia.complejidad]}
                    </span>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {guia.titulo}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                  {guia.descripcion}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {guia.nodos.length} pasos
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Iniciar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {guiasFiltradas.length === 0 && (
            <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">
              <GraduationCap className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No hay guías en esta categoría</p>
              <p className="text-sm">Seleccione otra categoría para ver guías disponibles.</p>
              <button
                onClick={() => setCategoriaActiva("todas")}
                className="mt-4 text-sm text-primary hover:underline font-medium"
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
