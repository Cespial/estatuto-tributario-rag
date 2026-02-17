import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { Header } from "@/components/layout/header";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleContent } from "@/components/article/article-content";
import { ModificationTimeline } from "@/components/article/modification-timeline";
import { TextoDerogado } from "@/components/article/texto-derogado";
import { NormasSection } from "@/components/article/normas-section";
import { CrossReferences } from "@/components/article/cross-references";
import { Concordancias } from "@/components/article/concordancias";
import { ArticleSidebar } from "@/components/article/article-sidebar";

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

async function getArticle(slug: string): Promise<ArticleData | null> {
  try {
    const filePath = join(process.cwd(), "public", "data", "articles", `${slug}.json`);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Articulo no encontrado" };
  return {
    title: `${article.id_articulo} - ${article.titulo_corto} | Estatuto Tributario`,
    description: article.contenido_texto?.slice(0, 160),
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <ArticleHeader
              idArticulo={article.id_articulo}
              titulo={article.titulo}
              tituloCort={article.titulo_corto}
              libro={article.libro}
              libroFull={article.libro_full}
              estado={article.estado}
            />
            <ArticleContent
              contenidoTexto={article.contenido_texto}
              contenidoHtml={article.contenido_html}
            />
            <ModificationTimeline
              modifications={article.modificaciones_parsed}
              leyesModificatorias={article.leyes_modificatorias}
            />
            <TextoDerogado
              items={article.texto_derogado_parsed}
              textoDerogadoRaw={article.texto_derogado}
            />
            <NormasSection normasParsed={article.normas_parsed} />
            <CrossReferences
              crossReferences={article.cross_references}
              referencedBy={article.referenced_by}
            />
            <Concordancias
              concordancias={article.concordancias}
              doctrinaDian={article.doctrina_dian_scrape}
              notasEditoriales={article.notas_editoriales}
            />
          </div>
          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20">
              <ArticleSidebar
                totalMods={article.total_modificaciones}
                ultimaMod={article.ultima_modificacion_year}
                complexity={article.complexity_score}
                totalNormas={article.total_normas}
                totalCrossRefs={article.total_cross_references}
                totalReferencedBy={article.referenced_by.length}
                estado={article.estado}
                urlOrigen={article.url_origen}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
