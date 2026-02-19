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
  basica: "bg-muted text-foreground border border-border",
  intermedia: "bg-muted text-foreground border border-border",
  avanzada: "bg-foreground text-background border border-foreground",
};

const COMPLEJIDAD_LABELS: Record<GuiaEducativa["complejidad"], string> = {
  basica: "Básica",
  intermedia: "Intermedia",
  avanzada: "Avanzada",
};

const CATEGORIA_COLORS: Record<GuiaEducativa["categoria"], string> = {
  renta: "bg-muted text-foreground border border-border",
  iva: "bg-muted text-foreground border border-border",
  retencion: "bg-muted text-foreground border border-border",
  laboral: "bg-muted text-foreground border border-border",
  general: "bg-muted text-foreground border border-border",
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
          <div className="flex flex-wrap items-center gap-2 mb-10">
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

          {/* Guide cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guiasFiltradas.map((guia) => (
              <Link
                key={guia.id}
                href={`/guias/${guia.id}`}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-border hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-muted p-2.5 text-foreground/70 group-hover:bg-foreground group-hover:text-background transition-colors">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                        CATEGORIA_COLORS[guia.categoria]
                      )}
                    >
                      {guia.categoria}
                    </span>
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                        COMPLEJIDAD_COLORS[guia.complejidad]
                      )}
                    >
                      {COMPLEJIDAD_LABELS[guia.complejidad]}
                    </span>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground transition-colors">
                  {guia.titulo}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                  {guia.descripcion}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    {guia.nodos.length} pasos
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    Iniciar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {guiasFiltradas.length === 0 && (
            <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-lg border border-border/60 border-dashed">
              <GraduationCap className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No hay guías en esta categoría</p>
              <p className="text-sm">Seleccione otra categoría para ver guías disponibles.</p>
              <button
                onClick={() => setCategoriaActiva("todas")}
                className="mt-4 text-sm text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground font-medium"
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
