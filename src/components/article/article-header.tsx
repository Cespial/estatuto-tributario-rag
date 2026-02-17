import { clsx } from "clsx";
import Link from "next/link";

interface ArticleHeaderProps {
  idArticulo: string;
  titulo: string;
  tituloCort: string;
  libro: string;
  libroFull: string;
  estado: string;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  vigente: { label: "Vigente", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  modificado: { label: "Modificado", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  derogado: { label: "Derogado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export function ArticleHeader({ idArticulo, titulo, libro, libroFull, estado }: ArticleHeaderProps) {
  const estadoConfig = ESTADO_CONFIG[estado] || ESTADO_CONFIG.vigente;

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/explorador" className="hover:text-foreground">
          Explorador
        </Link>
        <span>/</span>
        <span>{libro}</span>
        <span>/</span>
        <span className="text-foreground">{idArticulo}</span>
      </nav>
      {/* Title + badge */}
      <div className="flex flex-wrap items-start gap-3">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <span
          className={clsx(
            "mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            estadoConfig.color
          )}
        >
          {estadoConfig.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{libroFull}</p>
    </div>
  );
}
