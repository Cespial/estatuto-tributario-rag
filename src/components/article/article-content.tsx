import DOMPurify from "isomorphic-dompurify";

interface ArticleContentProps {
  contenidoTexto: string;
  contenidoHtml: string;
  sectionId?: string;
}

export function ArticleContent({
  contenidoTexto,
  contenidoHtml,
  sectionId = "contenido",
}: ArticleContentProps) {
  if (!contenidoTexto && !contenidoHtml) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        Este artículo no tiene contenido vigente disponible.
      </div>
    );
  }

  return (
    <section id={sectionId} className="mb-6">
      <h2 className="heading-serif mb-3 text-lg">Contenido vigente</h2>
      <div className="prose-chat rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
        {contenidoHtml ? (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contenidoHtml) }} />
        ) : (
          <p className="whitespace-pre-wrap">{contenidoTexto}</p>
        )}
      </div>
    </section>
  );
}
