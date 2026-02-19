"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface ArticleAssistantButtonProps {
  idArticulo: string;
  titulo: string;
  slug: string;
}

export function ArticleAssistantButton({
  idArticulo,
  titulo,
  slug,
}: ArticleAssistantButtonProps) {
  const prompt = encodeURIComponent(
    `Explíqueme ${idArticulo} (${titulo}) en lenguaje claro y enfoque práctico. Incluya puntos críticos, riesgos y ejemplos de aplicación.`
  );

  return (
    <Link
      href={`/?prompt=${prompt}&contextSlug=${slug}#asistente`}
      className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
    >
      <MessageSquare className="h-4 w-4" />
      Consultar al asistente IA
    </Link>
  );
}
