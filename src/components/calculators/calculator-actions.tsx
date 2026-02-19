"use client";

import { useState } from "react";
import { FileDown, Share2 } from "lucide-react";
import { shareCalculatorResult } from "@/lib/calculators/share";

interface CalculatorActionsProps {
  title: string;
  shareText: string;
  shareUrl: string;
  onExportPdf?: () => void;
}

export function CalculatorActions({
  title,
  shareText,
  shareUrl,
  onExportPdf,
}: CalculatorActionsProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    const status = await shareCalculatorResult({
      title,
      text: shareText,
      url: shareUrl,
    });

    if (status === "shared") {
      setFeedback("Resultado compartido.");
    } else if (status === "copied") {
      setFeedback("Enlace copiado al portapapeles.");
    } else {
      setFeedback("No fue posible compartir el resultado.");
    }

    setLoading(false);
    window.setTimeout(() => setFeedback(""), 2200);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className="text-xs text-muted-foreground">
        Comparte este escenario o exportalo para adjuntarlo en tu analisis.
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          Compartir resultado
        </button>

        {onExportPdf && (
          <button
            type="button"
            onClick={onExportPdf}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </button>
        )}
      </div>
      {feedback && <p className="w-full text-xs text-muted-foreground">{feedback}</p>}
    </div>
  );
}
