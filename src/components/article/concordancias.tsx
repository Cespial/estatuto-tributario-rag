interface ConcordanciasProps {
  concordancias: string;
  doctrinaDian: string;
  notasEditoriales: string;
}

export function Concordancias({ concordancias, doctrinaDian, notasEditoriales }: ConcordanciasProps) {
  const hasContent = concordancias || doctrinaDian || notasEditoriales;
  if (!hasContent) return null;

  return (
    <section id="concordancias" className="mb-6">
      {concordancias && (
        <div className="mb-4">
          <h2 className="heading-serif mb-2 text-lg">Concordancias</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {concordancias}
          </div>
        </div>
      )}

      {doctrinaDian && (
        <div className="mb-4">
          <h2 className="heading-serif mb-2 text-lg">Doctrina DIAN</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {doctrinaDian}
          </div>
        </div>
      )}

      {notasEditoriales && (
        <div className="mb-4">
          <h2 className="heading-serif mb-2 text-lg">Notas editoriales</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {notasEditoriales}
          </div>
        </div>
      )}
    </section>
  );
}
