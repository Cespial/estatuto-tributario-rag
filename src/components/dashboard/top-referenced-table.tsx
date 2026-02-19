import Link from "next/link";
import { clsx } from "clsx";

interface TopArticle {
  id: string;
  slug: string;
  titulo: string;
  total_refs: number;
  estado: string;
}

interface TopReferencedTableProps {
  articles: TopArticle[];
}

const ESTADO_DOT: Record<string, string> = {
  vigente: "bg-foreground",
  modificado: "bg-foreground/60",
  derogado: "bg-foreground/30",
};

export function TopReferencedTable({ articles }: TopReferencedTableProps) {
  if (articles.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="font-[family-name:var(--font-playfair)] mb-3 text-lg font-semibold tracking-tight">Top 10 mas referenciados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">#</th>
              <th className="pb-2 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Articulo</th>
              <th className="pb-2 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Titulo</th>
              <th className="pb-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Refs</th>
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
                        ESTADO_DOT[art.estado] || "bg-gray-500"
                      )}
                    />
                    {art.id}
                  </Link>
                </td>
                <td className="max-w-[200px] truncate py-2 text-muted-foreground">
                  {art.titulo}
                </td>
                <td className="py-2 text-right font-medium">{art.total_refs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
