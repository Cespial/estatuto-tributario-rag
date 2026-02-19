"use client";
import { FileDown } from "lucide-react";

interface PdfExportButtonProps {
  onClick: () => void;
  label?: string;
}

export function PdfExportButton({ onClick, label = "Exportar PDF" }: PdfExportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <FileDown className="h-4 w-4" />
      {label}
    </button>
  );
}
