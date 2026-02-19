"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, History, Info, AlertTriangle, Scale } from "lucide-react";
import Link from "next/link";
import { ArticleVersionSelector } from "@/components/comparison/article-version-selector";
import { ArticleDiffViewer } from "@/components/comparison/article-diff-viewer";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { clsx } from "clsx";

interface Modification {
  tipo: string;
  norma_tipo: string;
  norma_numero: string;
  norma_year: number;
  norma_articulo: string;
}

interface ArticleData {
  id_articulo: string;
  titulo: string;
  slug: string;
  contenido_texto: string;
  modificaciones_parsed: Modification[];
  texto_derogado: string[];
}

export default function CompararPage() {
  const [slug, setSlug] = useState<string>("");
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [versionA, setVersionA] = useState<number>(-1); // -1 is current, 0+ are historical
  const [versionB, setVersionB] = useState<number>(-1);

  const { contentRef, handlePrint } = usePrintExport({
    title: article ? `Comparación ${article.id_articulo}` : "Comparación de Artículo"
  });

  useEffect(() => {
    if (!slug) return;
    async function fetchArticle() {
      setLoading(true);
      try {
        const res = await fetch(`/data/articles/${slug}.json`);
        const data = await res.json();
        setArticle(data);
        // Default to comparing last modification (if exists) with current
        setVersionA(data.texto_derogado?.length > 0 ? 0 : -1);
        setVersionB(-1);
      } catch (err) {
        console.error("Error loading article:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  const versions = useMemo(() => {
    if (!article) return [];
    const list = article.texto_derogado.map((text, idx) => {
      // Find matching modification metadata if possible
      const mod = article.modificaciones_parsed[idx];
      return {
        id: idx,
        label: mod ? `${mod.norma_tipo} ${mod.norma_numero} (${mod.norma_year})` : `Versión Histórica ${idx + 1}`,
        text: text,
        year: mod?.norma_year
      };
    });

    list.push({
      id: -1,
      label: "Versión Vigente (Actual)",
      text: article.contenido_texto,
      year: new Date().getFullYear()
    });

    return list;
  }, [article]);

  const textA = versions.find(v => v.id === versionA)?.text || "";
  const textB = versions.find(v => v.id === versionB)?.text || "";
  const labelA = versions.find(v => v.id === versionA)?.label || "";
  const labelB = versions.find(v => v.id === versionB)?.label || "";

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-foreground/70" />
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">
              Comparador Multi-año
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Analice la evolución de los artículos tras las reformas tributarias.</p>
        </div>

        {article && (
          <PdfExportButton onClick={handlePrint} />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
            <ArticleVersionSelector onSelect={setSlug} selectedSlug={slug} />

            {article && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Versión A (Base)</label>
                  <div className="flex flex-col gap-2">
                    {versions.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVersionA(v.id)}
                        className={clsx(
                          "w-full rounded-lg px-3 py-2 text-left text-xs transition-all",
                          versionA === v.id
                            ? "border border-foreground bg-foreground text-background font-bold"
                            : "border border-border/60 bg-card text-muted-foreground hover:border-foreground/30"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Versión B (Comparar)</label>
                  <div className="flex flex-col gap-2">
                    {versions.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVersionB(v.id)}
                        className={clsx(
                          "w-full rounded-lg px-3 py-2 text-left text-xs transition-all",
                          versionB === v.id
                            ? "border border-foreground bg-foreground text-background font-bold"
                            : "border border-border/60 bg-card text-muted-foreground hover:border-foreground/30"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-foreground/70 shrink-0" />
              <div className="text-[11px] leading-relaxed text-muted-foreground">
                <p className="font-bold mb-1 uppercase tracking-tight text-foreground/80">Sobre la base de datos</p>
                <p>Las versiones anteriores provienen de los parágrafos derogados y registros históricos integrados en el sistema RAG de esta plataforma.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content / Diff Viewer */}
        <div className="lg:col-span-3">
          {!slug ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/10 p-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Scale className="h-10 w-10 text-foreground/70" />
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold">Inicie una comparación</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Seleccione un artículo modificado del panel lateral para visualizar los cambios palabra por palabra.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-1/3 rounded bg-muted" />
              <div className="h-12 w-full rounded bg-muted" />
              <div className="h-[300px] w-full rounded bg-muted" />
            </div>
          ) : article ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-foreground">{article.id_articulo}</h2>
                <p className="text-sm font-medium text-muted-foreground">{article.titulo}</p>
              </div>

              {versionA === versionB ? (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-foreground/70" />
                  <p className="text-sm font-medium">Está comparando la misma versión. Por favor seleccione una versión diferente en el panel lateral.</p>
                </div>
              ) : (
                <ArticleDiffViewer
                  oldText={textA}
                  newText={textB}
                  oldLabel={labelA}
                  newLabel={labelB}
                />
              )}

              {/* Print Only Content */}
              <div className="hidden">
                <div ref={contentRef}>
                  <PrintWrapper title={`Comparación: ${article.id_articulo}`} subtitle={article.titulo}>
                    <div className="mb-6 flex items-center justify-between border-b pb-4 text-sm font-bold">
                      <span className="text-muted-foreground">A: {labelA}</span>
                      <span className="text-muted-foreground">VS</span>
                      <span className="text-foreground">B: {labelB}</span>
                    </div>
                    <ArticleDiffViewer
                      oldText={textA}
                      newText={textB}
                      oldLabel={labelA}
                      newLabel={labelB}
                    />
                  </PrintWrapper>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
