import DOMPurify from "isomorphic-dompurify";

interface ArticleContentProps {
  contenidoTexto: string;
  contenidoHtml: string;
}

export function ArticleContent({ contenidoTexto, contenidoHtml }: ArticleContentProps) {
  if (!contenidoTexto && !contenidoHtml) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        Este artículo no tiene contenido vigente disponible.
      </div>
    );
  }

  return (
    <section className="mb-6">
      <h2 className="font-[family-name:var(--font-playfair)] mb-3 text-lg font-semibold tracking-tight">Contenido vigente</h2>
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
