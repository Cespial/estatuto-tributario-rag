"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks, type Bookmark as BookmarkType } from "@/hooks/useBookmarks";
import { clsx } from "clsx";

interface BookmarkButtonProps {
  id: string;
  type: BookmarkType["type"];
  title: string;
  href: string;
  className?: string;
  showLabel?: boolean;
}

export function BookmarkButton({ 
  id, 
  type, 
  title, 
  href, 
  className,
  showLabel = false 
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ id, type, title, href });
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
  );
}
