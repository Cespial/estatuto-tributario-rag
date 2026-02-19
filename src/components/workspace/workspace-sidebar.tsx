"use client";

import { FolderOpen, Plus, Briefcase, User, Building2, FileText, Bookmark } from "lucide-react";
import { Workspace } from "@/types/productivity";
import { clsx } from "clsx";

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  counts: Record<string, number>;
  onSelect: (workspaceId: string) => void;
  onCreate: () => void;
}

function iconForWorkspace(icon: Workspace["icon"]) {
  if (icon === "briefcase") return Briefcase;
  if (icon === "user") return User;
  if (icon === "building") return Building2;
  if (icon === "bookmark") return Bookmark;
  if (icon === "file") return FileText;
  return FolderOpen;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  counts,
  onSelect,
  onCreate,
}: WorkspaceSidebarProps) {
  return (
    <aside className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          Workspaces
        </p>
        <button
          onClick={onCreate}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Crear workspace"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1">
        {workspaces.map((workspace) => {
          const Icon = iconForWorkspace(workspace.icon);
          const isActive = workspace.id === activeWorkspaceId;
          return (
            <button
              key={workspace.id}
              onClick={() => onSelect(workspace.id)}
              className={clsx(
                "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{workspace.name}</span>
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-[11px]",
                  isActive
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[workspace.id] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
