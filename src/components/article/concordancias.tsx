interface ConcordanciasProps {
  concordancias: string;
  doctrinaDian: string;
  notasEditoriales: string;
}

export function Concordancias({ concordancias, doctrinaDian, notasEditoriales }: ConcordanciasProps) {
  const hasContent = concordancias || doctrinaDian || notasEditoriales;
  if (!hasContent) return null;

  return (
    <section className="mb-6">
      {concordancias && (
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Concordancias</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {concordancias}
          </div>
        </div>
      )}

      {doctrinaDian && (
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Doctrina DIAN</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {doctrinaDian}
          </div>
        </div>
      )}

      {notasEditoriales && (
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Notas editoriales</h2>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {notasEditoriales}
          </div>
        </div>
      )}
    </section>
  );
}
