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
  vigente: "bg-green-500",
  modificado: "bg-yellow-500",
  derogado: "bg-red-500",
};

export function TopModifiedTable({ articles }: TopModifiedTableProps) {
  if (articles.length === 0) return null;

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-lg font-semibold">Top 10 mas modificados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">#</th>
              <th className="pb-2 font-medium text-muted-foreground">Articulo</th>
              <th className="pb-2 font-medium text-muted-foreground">Titulo</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Mods</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((art, i) => (
              <tr key={art.id} className="border-b border-border/50 last:border-0">
                <td className="py-2 text-muted-foreground">{i + 1}</td>
                <td className="py-2">
                  <Link
                    href={`/articulo/${art.slug}`}
                    className="flex items-center gap-1.5 font-medium text-primary hover:underline"
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
                <td className="py-2 text-right font-medium">{art.total_mods}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
