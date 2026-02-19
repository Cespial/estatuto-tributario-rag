import Link from "next/link";
import { clsx } from "clsx";

interface TopArticle {
  id: string;
  slug: string;
  titulo: string;
  total_mods: number;
  estado: string;
}

interface TopModifiedTableProps {
  articles: TopArticle[];
}

const ESTADO_DOT: Record<string, string> = {
  vigente: "bg-foreground",
  modificado: "bg-foreground/60",
  derogado: "bg-foreground/30",
};

export function TopModifiedTable({ articles }: TopModifiedTableProps) {
  if (articles.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif mb-3 text-lg">Top 10 mas modificados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border/60 text-left">
              <th className="pb-2 pt-2 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">#</th>
              <th className="pb-2 pt-2 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Articulo</th>
              <th className="pb-2 pt-2 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Titulo</th>
              <th className="pb-2 pt-2 text-right text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Mods</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((art, i) => (
              <tr key={art.id} className="border-b border-border/50 last:border-0">
                <td className="py-2 text-muted-foreground">{i + 1}</td>
                <td className="py-2">
                  <Link
                    href={`/articulo/${art.slug}`}
                    className="flex items-center gap-1.5 font-medium text-foreground hover:underline"
                  >
                    <span
                      className={clsx(
                        "h-2 w-2 rounded-full",
                        ESTADO_DOT[art.estado] || "bg-foreground/40"
                      )}
                    />
                    {art.id}
                  </Link>
                </td>
                <td className="max-w-[200px] truncate py-2 text-muted-foreground">
                  {art.titulo}
                </td>
                <td className="py-2 text-right font-medium">{art.total_mods}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
