"use client";

import { Download } from "lucide-react";

interface DashboardExportActionsProps {
  filenamePrefix: string;
  payload: Record<string, unknown>;
  rowsForCsv: Array<Record<string, string | number>>;
}

function exportJson(filename: string, payload: Record<string, unknown>) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const escaped = String(value ?? "").replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DashboardExportActions({
  filenamePrefix,
  payload,
  rowsForCsv,
}: DashboardExportActionsProps) {
  const dateTag = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => exportJson(`${filenamePrefix}-${dateTag}.json`, payload)}
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <Download className="h-4 w-4" />
        Exportar JSON
      </button>
      <button
        onClick={() => exportCsv(`${filenamePrefix}-${dateTag}.csv`, rowsForCsv)}
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </button>
    </div>
  );
}
