import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { Header } from "@/components/layout/header";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleAnnotator } from "@/components/article/article-annotator";
import { ModificationTimeline } from "@/components/article/modification-timeline";
import { TextoDerogado } from "@/components/article/texto-derogado";
import { NormasSection } from "@/components/article/normas-section";
import { CrossReferences } from "@/components/article/cross-references";
import { Concordancias } from "@/components/article/concordancias";
import { ArticleSidebar } from "@/components/article/article-sidebar";
import { ArticleToc } from "@/components/article/article-toc";
import { RelatedArticles } from "@/components/article/related-articles";
import { ArticleInlineDiff } from "@/components/article/article-inline-diff";
import { ArticleAssistantButton } from "@/components/article/article-assistant-button";
import { ArticleShareActions } from "@/components/article/article-share-actions";
import { RecentVisitTracker } from "@/components/workspace/recent-visit-tracker";
import type { ArticleIndexEnrichedItem } from "@/lib/types/articles";
import { getDoctrineByArticle } from "@/lib/knowledge/knowledge-index";

interface ArticleData {
  id_articulo: string;
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;
  libro_full: string;
  estado: string;
  complexity_score: number;
  contenido_texto: string;
  contenido_html: string;
  modificaciones_parsed: Array<{
    tipo: string;
    norma_tipo: string;
    norma_numero: string;
    norma_year: number;
    norma_articulo?: string;
  }>;
  total_modificaciones: number;
  ultima_modificacion_year: number | null;
  leyes_modificatorias: string[];
  texto_derogado: (string | unknown)[];
  texto_derogado_parsed: Array<{
    index: number;
    snippet: string;
    full_length: number;
    norma_ref?: string;
  }>;
  normas_parsed: Record<string, string[]>;
  total_normas: number;
  cross_references: string[];
  referenced_by: string[];
  total_cross_references: number;
  concordancias: string;
  doctrina_dian_scrape: string;
  notas_editoriales: string;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getArticle(slug: string): Promise<ArticleData | null> {
  return readJsonFile<ArticleData>(
    join(process.cwd(), "public", "data", "articles", `${slug}.json`)
  );
}

async function getArticleIndex(): Promise<ArticleIndexEnrichedItem[]> {
  const enriched = await readJsonFile<ArticleIndexEnrichedItem[]>(
    join(process.cwd(), "public", "data", "articles-index.enriched.json")
  );
  if (enriched?.length) return enriched;

  const fallback = await readJsonFile<ArticleIndexEnrichedItem[]>(
    join(process.cwd(), "public", "data", "articles-index.json")
  );
  return fallback || [];
}

export async function generateStaticParams() {
  const articles = await getArticleIndex();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artículo no encontrado" };
  return {
    title: `${article.id_articulo} - ${article.titulo_corto} | SuperApp Tributaria Colombia`,
    description: article.contenido_texto?.slice(0, 160),
  };
}

function normalizeLawKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9-]+$/i.test(value);
}

function buildRelatedArticles(
  article: ArticleData,
  index: ArticleIndexEnrichedItem[]
) {
  const bySlug = new Map(index.map((item) => [item.slug, item]));
  const currentLaws = new Set(
    (article.leyes_modificatorias || []).map((law) => normalizeLawKey(law))
  );
  const scoreMap = new Map<string, { score: number; reasons: Set<string> }>();

  const addScore = (slug: string, amount: number, reason: string) => {
    if (!isValidSlug(slug)) return;
    if (!bySlug.has(slug)) return;
    if (slug === article.slug) return;
    const current = scoreMap.get(slug) || { score: 0, reasons: new Set<string>() };
    current.score += amount;
    current.reasons.add(reason);
    scoreMap.set(slug, current);
  };

  for (const slug of article.cross_references || []) {
    addScore(slug, 4, "Referenciado directamente por este artículo");
  }

  for (const slug of article.referenced_by || []) {
    addScore(slug, 3, "Menciona este artículo en su texto");
  }

  for (const [slug, score] of scoreMap.entries()) {
    const candidate = bySlug.get(slug);
    if (!candidate) continue;
    if (candidate.libro === article.libro) {
      score.score += 2;
      score.reasons.add("Mismo libro del ET");
    }

    const candidateLaws = new Set(
      (candidate.leyes_modificatorias_normalized || []).map((law) =>
        normalizeLawKey(law)
      )
    );
    for (const law of currentLaws) {
      if (candidateLaws.has(law)) {
        score.score += 2;
        score.reasons.add("Comparte ley modificatoria");
        break;
      }
    }

    score.score += Math.min(candidate.total_refs || 0, 8) * 0.1;
    score.score += Math.min(candidate.total_referenced_by || 0, 8) * 0.12;
  }

  const scored = Array.from(scoreMap.entries())
    .map(([slug, data]) => {
      const candidate = bySlug.get(slug)!;
      return {
        id: candidate.id,
        slug: candidate.slug,
        titulo: candidate.titulo,
        libro: candidate.libro,
        score: data.score,
        reason:
          Array.from(data.reasons).sort((a, b) => b.length - a.length)[0] ||
          "Artículo relacionado por contexto normativo",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (scored.length >= 6) return scored;

  const selectedSlugs = new Set(scored.map((item) => item.slug));
  const filler = index
    .filter((item) => item.slug !== article.slug && !selectedSlugs.has(item.slug))
    .filter((item) => item.libro === article.libro)
    .sort(
      (a, b) =>
        b.total_referenced_by - a.total_referenced_by || b.total_refs - a.total_refs
    )
    .slice(0, 8 - scored.length)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      titulo: item.titulo,
      libro: item.libro,
      reason: "Relevante dentro del mismo libro del ET",
    }));

  return [...scored, ...filler];
}

function ArticleJsonLd({ article }: { article: ArticleData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: article.titulo,
    legislationIdentifier: article.id_articulo,
    inLanguage: "es",
    isPartOf: {
      "@type": "Legislation",
      name: "Estatuto Tributario de Colombia",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, index] = await Promise.all([getArticle(slug), getArticleIndex()]);

  if (!article) notFound();

  const slugToIdMap = Object.fromEntries(index.map((item) => [item.slug, item.id]));
  const relatedArticles = buildRelatedArticles(article, index);
  const validCrossRefs = (article.cross_references || []).filter(isValidSlug);
  const validReferencedBy = (article.referenced_by || []).filter(isValidSlug);
  const articuloNumero = article.id_articulo.replace(/^Art\\.?\\s*/i, "").trim();
  const doctrinaRelacionada = getDoctrineByArticle(articuloNumero).slice(0, 6);

  const sections = [
    { id: "contenido", label: "Contenido vigente" },
    ...(article.modificaciones_parsed.length
      ? [{ id: "timeline", label: "Timeline de modificaciones" }]
      : []),
    ...(article.texto_derogado_parsed.length
      ? [{ id: "versiones", label: "Versiones anteriores" }]
      : []),
    ...(article.total_normas > 0 ? [{ id: "normas", label: "Normas relacionadas" }] : []),
    ...(validCrossRefs.length > 0 || validReferencedBy.length > 0
      ? [{ id: "referencias", label: "Referencias cruzadas" }]
      : []),
    ...(article.concordancias || article.doctrina_dian_scrape || article.notas_editoriales
      ? [{ id: "concordancias", label: "Concordancias y doctrina" }]
      : []),
    ...(relatedArticles.length ? [{ id: "relacionados", label: "Artículos relacionados" }] : []),
  ];

  const historicalVersions = (article.texto_derogado || [])
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col">
      <ArticleJsonLd article={article} />
      <RecentVisitTracker
        id={article.id_articulo}
        title={article.titulo_corto || article.titulo}
        href={`/articulo/${article.slug}`}
        slug={article.slug}
        type="art"
      />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          <article className="min-w-0 flex-1" id="article-print-root">
            <ArticleHeader
              idArticulo={article.id_articulo}
              titulo={article.titulo}
              tituloCort={article.titulo_corto}
              slug={article.slug}
              libro={article.libro}
              libroFull={article.libro_full}
              estado={article.estado}
            />

            <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
              <ArticleAssistantButton
                idArticulo={article.id_articulo}
                titulo={article.titulo_corto}
                slug={article.slug}
              />
              <ArticleShareActions
                title={`${article.id_articulo} - ${article.titulo_corto}`}
                permalink={`/articulo/${article.slug}`}
              />
            </div>

            <ArticleAnnotator targetId={article.slug}>
              <ArticleContent
                contenidoTexto={article.contenido_texto}
                contenidoHtml={article.contenido_html}
              />
            </ArticleAnnotator>

            <ModificationTimeline
              modifications={article.modificaciones_parsed}
              leyesModificatorias={article.leyes_modificatorias}
            />

            <ArticleInlineDiff
              vigenteTexto={article.contenido_texto}
              versionesAnteriores={historicalVersions}
            />

            <TextoDerogado
              items={article.texto_derogado_parsed}
              textoDerogadoRaw={article.texto_derogado}
            />

            <NormasSection normasParsed={article.normas_parsed} />

            <CrossReferences
              crossReferences={article.cross_references}
              referencedBy={article.referenced_by}
              slugToIdMap={slugToIdMap}
            />

            <Concordancias
              concordancias={article.concordancias}
              doctrinaDian={article.doctrina_dian_scrape}
              notasEditoriales={article.notas_editoriales}
            />

            <RelatedArticles items={relatedArticles} />
          </article>

          <aside className="w-full shrink-0 print:hidden lg:w-72">
            <div className="sticky top-20 space-y-4">
              <ArticleToc sections={sections} />
              <ArticleSidebar
                totalMods={article.total_modificaciones}
                ultimaMod={article.ultima_modificacion_year}
                complexity={article.complexity_score}
                totalNormas={article.total_normas}
                totalCrossRefs={article.total_cross_references}
                totalReferencedBy={article.referenced_by.length}
                estado={article.estado}
                urlOrigen={article.url_origen}
                articuloNumero={articuloNumero}
                doctrinaRelacionada={doctrinaRelacionada}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
