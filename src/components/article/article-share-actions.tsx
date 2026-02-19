"use client";

import { useState } from "react";
import { Copy, Printer, Share2 } from "lucide-react";

interface ArticleShareActionsProps {
  title: string;
  permalink: string;
}

export function ArticleShareActions({
  title,
  permalink,
}: ArticleShareActionsProps) {
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "ok" | "error">(
    "idle"
  );

  const resolvePermalink = () => {
    if (typeof window === "undefined") return permalink;
    if (permalink.startsWith("http")) return permalink;
    return `${window.location.origin}${permalink}`;
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;
    const url = resolvePermalink();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopyFeedback("ok");
      setTimeout(() => setCopyFeedback("idle"), 1500);
    } catch {
      setCopyFeedback("error");
      setTimeout(() => setCopyFeedback("idle"), 1500);
    }
  };

  const handleCopy = async () => {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(resolvePermalink());
      setCopyFeedback("ok");
      setTimeout(() => setCopyFeedback("idle"), 1500);
    } catch {
      setCopyFeedback("error");
      setTimeout(() => setCopyFeedback("idle"), 1500);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <Share2 className="h-4 w-4" />
        Compartir
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <Copy className="h-4 w-4" />
        {copyFeedback === "ok"
          ? "URL copiada"
          : copyFeedback === "error"
          ? "Error al copiar"
          : "Copiar URL"}
      </button>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <Printer className="h-4 w-4" />
        Imprimir / PDF
      </button>
    </div>
  );
}
