"use client";

import { Bookmark, BookmarkCheck, FolderOpen } from "lucide-react";
import { useBookmarks, type Bookmark as BookmarkType } from "@/hooks/useBookmarks";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { clsx } from "clsx";
import { useState } from "react";

interface BookmarkButtonProps {
  id: string;
  type: BookmarkType["type"];
  title: string;
  href: string;
  preview?: string;
  tags?: string[];
  workspaceId?: string;
  className?: string;
  showLabel?: boolean;
  allowWorkspacePicker?: boolean;
}

export function BookmarkButton({ 
  id, 
  type, 
  title, 
  href, 
  preview,
  tags,
  workspaceId,
  className,
  showLabel = false,
  allowWorkspacePicker = false,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { workspaces } = useWorkspaces();
  const [openPicker, setOpenPicker] = useState(false);
  const bookmarked = isBookmarked(id);

  const handleSave = (selectedWorkspaceId?: string) => {
    toggleBookmark({
      id,
      type,
      title,
      href,
      preview,
      tags,
      workspaceId: selectedWorkspaceId || workspaceId,
    });
    setOpenPicker(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!bookmarked && allowWorkspacePicker && workspaces.length > 1) {
            setOpenPicker((prev) => !prev);
            return;
          }
          handleSave();
        }}
        className={clsx(
          "flex items-center gap-1.5 transition-all active:scale-90",
          bookmarked ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          className
        )}
        title={bookmarked ? "Quitar de favoritos" : "Guardar en favoritos"}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-5 w-5 fill-current" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {bookmarked ? "Guardado" : "Guardar"}
          </span>
        )}
      </button>

      {!bookmarked && openPicker && allowWorkspacePicker && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Guardar en workspace
          </p>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave(workspace.id);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted"
              >
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                {workspace.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
