"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, History, Info, AlertTriangle, Scale } from "lucide-react";
import Link from "next/link";
import { ArticleVersionSelector } from "@/components/comparison/article-version-selector";
import { ArticleDiffViewer } from "@/components/comparison/article-diff-viewer";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
import { PrintWrapper } from "@/components/pdf/print-wrapper";
import { clsx } from "clsx";
import { ComparisonMode, ComparisonModeToggle } from "@/components/comparison/comparison-mode-toggle";
import { DiffViewMode, DiffViewToggle } from "@/components/comparison/diff-view-toggle";
import { ChangeSummaryCard } from "@/components/comparison/change-summary-card";
import { computeWordDiff, summarizeDiff } from "@/components/comparison/diff-utils";
import { DiffMinimap } from "@/components/comparison/diff-minimap";
import { trackEvent } from "@/lib/telemetry/events";
import { UI_COPY } from "@/config/ui-copy";

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

interface ArticleVersion {
  id: number;
  label: string;
  text: string;
  year?: number;
}

function buildVersions(article: ArticleData | null): ArticleVersion[] {
  if (!article) return [];
  const historical = article.texto_derogado.map((text, idx) => {
    const mod = article.modificaciones_parsed[idx];
    return {
      id: idx,
      label: mod
        ? `${mod.norma_tipo} ${mod.norma_numero} (${mod.norma_year})`
        : `Versión Histórica ${idx + 1}`,
      text,
      year: mod?.norma_year,
    };
  });
  return [
    ...historical,
    {
      id: -1,
      label: "Versión Vigente (Actual)",
      text: article.contenido_texto,
      year: new Date().getFullYear(),
    },
  ];
}

export default function CompararPage() {
  const [mode, setMode] = useState<ComparisonMode>("historical");
  const [viewMode, setViewMode] = useState<DiffViewMode>("inline");
  const [slugA, setSlugA] = useState<string>("");
  const [slugB, setSlugB] = useState<string>("");
  const [articleA, setArticleA] = useState<ArticleData | null>(null);
  const [articleB, setArticleB] = useState<ArticleData | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [versionA, setVersionA] = useState<number>(-1);
  const [versionB, setVersionB] = useState<number>(-1);
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const cacheRef = useRef<Map<string, ArticleData>>(new Map());
  const trackedComparisonKeyRef = useRef("");

  const { contentRef, handlePrint } = usePrintExport({
    title: articleA ? `Comparación ${articleA.id_articulo}` : "Comparación de Artículo",
  });

  useEffect(() => {
    if (!slugA) {
      setArticleA(null);
      return;
    }
    let active = true;
    const fetchArticle = async () => {
      setLoadingA(true);
      try {
        const cached = cacheRef.current.get(slugA);
        if (cached) {
          if (active) setArticleA(cached);
          return;
        }
        const res = await fetch(`/data/articles/${slugA}.json`);
        const data: ArticleData = await res.json();
        cacheRef.current.set(slugA, data);
        if (active) setArticleA(data);
      } catch (err) {
        console.error("Error loading article A:", err);
      } finally {
        if (active) setLoadingA(false);
      }
    };
    fetchArticle();
    return () => {
      active = false;
    };
  }, [slugA]);

  useEffect(() => {
    if (mode !== "cross-article" || !slugB) {
      setArticleB(null);
      setLoadingB(false);
      return;
    }

    let active = true;
    const fetchArticle = async () => {
      setLoadingB(true);
      try {
        const cached = cacheRef.current.get(slugB);
        if (cached) {
          if (active) setArticleB(cached);
          return;
        }
        const res = await fetch(`/data/articles/${slugB}.json`);
        const data: ArticleData = await res.json();
        cacheRef.current.set(slugB, data);
        if (active) setArticleB(data);
      } catch (err) {
        console.error("Error loading article B:", err);
      } finally {
        if (active) setLoadingB(false);
      }
    };
    fetchArticle();
    return () => {
      active = false;
    };
  }, [slugB, mode]);

  useEffect(() => {
    if (!articleA) return;
    if (mode === "historical") {
      setVersionA(articleA.texto_derogado?.length > 0 ? 0 : -1);
      setVersionB(-1);
    } else {
      setVersionA(-1);
    }
  }, [articleA, mode]);

  useEffect(() => {
    if (!articleB) return;
    setVersionB(-1);
  }, [articleB]);

  useEffect(() => {
    if (mode === "historical") {
      setSlugB("");
      setArticleB(null);
      setVersionB(-1);
      return;
    }
    if (!slugB && slugA) {
      setSlugB(slugA);
    }
  }, [mode, slugA, slugB]);

  const versionsA = useMemo(() => buildVersions(articleA), [articleA]);
  const versionsB = useMemo(
    () => (mode === "historical" ? versionsA : buildVersions(articleB)),
    [mode, versionsA, articleB]
  );

  const selectionA = versionsA.find((item) => item.id === versionA);
  const selectionB = versionsB.find((item) => item.id === versionB);

  const textA = selectionA?.text || "";
  const textB = selectionB?.text || "";
  const labelA = selectionA?.label || "";
  const labelB = selectionB?.label || "";

  const isComparingSame =
    mode === "historical"
      ? versionA === versionB
      : slugA === slugB && versionA === versionB;

  const diffSegments = useMemo(() => {
    if (!textA || !textB || isComparingSame) return [];
    return computeWordDiff(textA, textB);
  }, [textA, textB, isComparingSame]);

  const diffSummary = useMemo(() => summarizeDiff(diffSegments), [diffSegments]);

  useEffect(() => {
    if (diffSegments.length === 0) {
      setAiSummary("");
      return;
    }
    if (diffSummary.totalChanges === 0) {
      setAiSummary("No se detectaron variaciones sustanciales entre las versiones comparadas.");
      return;
    }

    let active = true;
    setSummaryLoading(true);
    setSummaryError(false);
    fetch("/api/comparar/resumen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldText: textA.slice(0, 14000),
        newText: textB.slice(0, 14000),
        oldLabel: labelA,
        newLabel: labelB,
        articleA: articleA?.id_articulo,
        articleB: mode === "historical" ? articleA?.id_articulo : articleB?.id_articulo,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Error API")))
      .then((data) => {
        if (active && data?.summary) setAiSummary(data.summary);
      })
      .catch((err) => {
        console.error("AI Summary Error:", err);
        if (active) {
          setAiSummary("");
          setSummaryError(true);
          setShowErrorToast(true);
          setTimeout(() => setShowErrorToast(false), 4000);
        }
      })
      .finally(() => {
        if (active) setSummaryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [diffSegments, diffSummary.totalChanges, textA, textB, labelA, labelB, articleA, articleB, mode]);

  useEffect(() => {
    if (!slugA || !textA || !textB || isComparingSame) return;
    const key = `${mode}-${slugA}-${slugB}-${versionA}-${versionB}`;
    if (trackedComparisonKeyRef.current === key) return;
    trackedComparisonKeyRef.current = key;
    trackEvent("comparison_created", {
      mode,
      slugA,
      slugB: slugB || null,
      versionA,
      versionB,
      totalChanges: diffSummary.totalChanges,
    });
  }, [mode, slugA, slugB, versionA, versionB, textA, textB, isComparingSame, diffSummary.totalChanges]);

  const loading = loadingA || (mode === "cross-article" && loadingB);
  const hasReadyArticle = Boolean(articleA && (mode === "historical" || articleB));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-foreground/70" />
            <h1 className="heading-serif text-3xl">{UI_COPY.comparar.title}</h1>
          </div>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {UI_COPY.comparar.subtitle}
          </p>
        </div>

        {hasReadyArticle && <PdfExportButton onClick={handlePrint} label="Exportar dictamen PDF" />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_180px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-5 space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                Modo de comparación
              </label>
              <ComparisonModeToggle mode={mode} onChange={setMode} />
            </div>

            <div className="space-y-4">
              <ArticleVersionSelector
                onSelect={setSlugA}
                selectedSlug={slugA}
                label={mode === "historical" ? "Artículo con historia" : "Artículo A"}
                placeholder="Buscar artículo base..."
                includeOnlyModified={mode === "historical"}
              />

              {mode === "cross-article" && (
                <ArticleVersionSelector
                  onSelect={setSlugB}
                  selectedSlug={slugB}
                  label="Artículo B"
                  placeholder="Buscar artículo a comparar..."
                  includeOnlyModified={false}
                  excludeSlug={undefined}
                />
              )}
            </div>

            {articleA && (
              <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                    Versión A
                  </label>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border/50 p-1">
                    {versionsA.map((v) => (
                      <button
                        key={`a-${v.id}`}
                        onClick={() => setVersionA(v.id)}
                        className={clsx(
                          "w-full rounded-md px-3 py-1.5 text-left text-xs transition-all",
                          versionA === v.id
                            ? "border border-foreground bg-foreground text-background font-semibold"
                            : "border border-border/60 bg-card text-muted-foreground hover:border-foreground/30"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                    Versión B
                  </label>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border/50 p-1">
                    {versionsB.map((v) => (
                      <button
                        key={`b-${v.id}`}
                        onClick={() => setVersionB(v.id)}
                        className={clsx(
                          "w-full rounded-md px-3 py-1.5 text-left text-xs transition-all",
                          versionB === v.id
                            ? "border border-foreground bg-foreground text-background font-semibold"
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
              <Info className="h-5 w-5 shrink-0 text-foreground/70" />
              <div className="text-[11px] leading-relaxed text-muted-foreground">
                <p className="mb-1 font-semibold uppercase tracking-tight text-foreground/80">
                  Base documental
                </p>
                <p>
                  El comparador combina versiones vigentes y textos históricos de la base
                  jurídica para facilitar sustentación ante DIAN y comités de auditoría.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          {!slugA ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/10 p-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Scale className="h-10 w-10 text-foreground/70" />
              </div>
              <h3 className="heading-serif text-xl">Inicie una comparación</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Seleccione un artículo en el panel lateral para visualizar cambios
                normativos detallados.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-1/3 rounded bg-muted" />
              <div className="h-12 w-full rounded bg-muted" />
              <div className="h-[300px] w-full rounded bg-muted" />
            </div>
          ) : hasReadyArticle ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="heading-serif text-2xl text-foreground">
                    {mode === "cross-article"
                      ? `${articleA?.id_articulo} vs ${articleB?.id_articulo}`
                      : articleA?.id_articulo}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    {mode === "cross-article"
                      ? `${articleA?.titulo} | ${articleB?.titulo}`
                      : articleA?.titulo}
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                    Vista de lectura
                  </p>
                  <DiffViewToggle mode={viewMode} onChange={setViewMode} />
                </div>
              </div>

              {isComparingSame ? (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-foreground/70" />
                  <p className="text-sm font-medium">
                    Está comparando exactamente la misma versión. Seleccione otra versión o artículo.
                  </p>
                </div>
              ) : (
                <>
                  <ChangeSummaryCard
                    summary={diffSummary}
                    labelA={labelA}
                    labelB={labelB}
                    articleA={articleA?.id_articulo}
                    articleB={mode === "cross-article" ? articleB?.id_articulo : articleA?.id_articulo}
                    aiSummary={summaryLoading ? "Generando resumen automático..." : aiSummary}
                    error={summaryError}
                    onRetry={() => {
                      // We can just toggle a ref or state to force effect to re-run
                      // For simplicity, we'll just set loading which might work if the effect reacts to it
                      setSummaryError(false);
                    }}
                  />
                  <div className="flex justify-end">
                    <Link
                      href={`/asistente?prompt=${encodeURIComponent(
                        `Analiza las implicaciones tributarias de los cambios entre ${labelA} y ${labelB} en ${articleA?.id_articulo || "el artículo seleccionado"}.`
                      )}`}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Enviar al asistente IA
                    </Link>
                  </div>

                  <ArticleDiffViewer
                    oldText={textA}
                    newText={textB}
                    oldLabel={labelA}
                    newLabel={labelB}
                    viewMode={viewMode}
                    segments={diffSegments}
                  />
                </>
              )}

              <div className="hidden">
                <div ref={contentRef}>
                  <PrintWrapper
                    title={`Comparación: ${articleA?.id_articulo}${mode === "cross-article" && articleB ? ` vs ${articleB.id_articulo}` : ""}`}
                    subtitle={mode === "cross-article" ? "Comparación cruzada entre artículos" : articleA?.titulo}
                  >
                    <div className="mb-4 text-sm">
                      <p>
                        <strong>A:</strong> {labelA}
                      </p>
                      <p>
                        <strong>B:</strong> {labelB}
                      </p>
                    </div>
                    {!isComparingSame && (
                      <>
                        <ChangeSummaryCard
                          summary={diffSummary}
                          labelA={labelA}
                          labelB={labelB}
                          articleA={articleA?.id_articulo}
                          articleB={mode === "cross-article" ? articleB?.id_articulo : articleA?.id_articulo}
                          aiSummary={aiSummary}
                        />
                        <div className="mt-4">
                          <ArticleDiffViewer
                            oldText={textA}
                            newText={textB}
                            oldLabel={labelA}
                            newLabel={labelB}
                            viewMode="inline"
                            segments={diffSegments}
                          />
                        </div>
                      </>
                    )}
                  </PrintWrapper>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="sticky top-24">
            <DiffMinimap segments={diffSegments} />
          </div>
        </div>
      </div>

      {showErrorToast && (
        <div className="fixed bottom-5 right-5 z-[100] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            <AlertTriangle className="h-4 w-4" />
            <p className="font-medium">No se pudo generar el resumen automático.</p>
          </div>
        </div>
      )}
    </div>
  );
}
