"use client";

import { Download } from "lucide-react";
import type { CalendarDeadlineItem } from "@/types/calendar";
import { downloadIcsFile } from "@/lib/calendar/ics";

interface ExportFilteredIcsButtonProps {
  items: CalendarDeadlineItem[];
}

function buildFileName() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `mis-vencimientos-${y}${m}${d}.ics`;
}

export function ExportFilteredIcsButton({ items }: ExportFilteredIcsButtonProps) {
  const canExport = items.length > 0;

  const handleExport = () => {
    if (!canExport) return;
    const events = items.map((item) => ({
      id: item.id,
      title: `${item.obligacion} (NIT ${item.ultimoDigito})`,
      date: item.fecha,
      description: `${item.descripcion}. Periodo: ${item.periodo}. Fuente: SuperApp Tributaria Colombia.`,
    }));
    downloadIcsFile(events, buildFileName());
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!canExport}
      className="inline-flex h-10 items-center gap-2 rounded border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Download className="h-4 w-4" />
      Exportar mis fechas (.ics)
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        {items.length}
      </span>
    </button>
  );
}

