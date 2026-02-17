interface ArticleContentProps {
  contenidoTexto: string;
  contenidoHtml: string;
}

export function ArticleContent({ contenidoTexto, contenidoHtml }: ArticleContentProps) {
  if (!contenidoTexto && !contenidoHtml) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        Este articulo no tiene contenido vigente disponible.
      </div>
    );
  }

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold">Contenido vigente</h2>
      <div className="prose-chat rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
        {contenidoHtml ? (
          <div dangerouslySetInnerHTML={{ __html: contenidoHtml }} />
        ) : (
          <p className="whitespace-pre-wrap">{contenidoTexto}</p>
        )}
      </div>
    </section>
  );
}
