"use client";

import { Download, FileJson, FileText } from "lucide-react";
import { downloadJsonFile } from "@/lib/export/toJson";
import { printLegalDocument } from "@/lib/export/toLegalPdf";
import { buildWorkspaceExportHtml } from "@/lib/export/workspace-pdf";
import { BookmarkItem, NoteItem, Workspace } from "@/types/productivity";

interface WorkspaceExportMenuProps {
  workspace: Workspace;
  bookmarks: BookmarkItem[];
  notes: NoteItem[];
}

export function WorkspaceExportMenu({
  workspace,
  bookmarks,
  notes,
}: WorkspaceExportMenuProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => {
          downloadJsonFile(
            `workspace-${workspace.name.toLowerCase().replace(/\s+/g, "-")}.json`,
            {
              workspace,
              bookmarks,
              notes,
              exportedAt: new Date().toISOString(),
            }
          );
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <FileJson className="h-3.5 w-3.5" />
        Exportar JSON
      </button>
      <button
        onClick={() => {
          printLegalDocument({
            title: `Workspace ${workspace.name}`,
            subtitle: "Exportación de investigación tributaria",
            bodyHtml: buildWorkspaceExportHtml(workspace, bookmarks, notes),
          });
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <FileText className="h-3.5 w-3.5" />
        Exportar PDF
      </button>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Download className="h-3.5 w-3.5" />
        {bookmarks.length + notes.length} ítems
      </span>
    </div>
  );
}
