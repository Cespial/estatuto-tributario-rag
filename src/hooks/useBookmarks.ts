"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import { BookmarkItem, BookmarkType, DEFAULT_WORKSPACE_ID } from "@/types/productivity";

export type Bookmark = BookmarkItem;

interface LegacyBookmark {
  id: string;
  type: BookmarkType;
  title: string;
  href: string;
  createdAt?: number;
}

interface AddBookmarkInput {
  id: string;
  type: BookmarkType;
  title: string;
  href: string;
  preview?: string;
  tags?: string[];
  workspaceId?: string;
}

function normalizeTags(tags: string[] = []): string[] {
  return Array.from(
    new Set(
      tags
        .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
        .filter(Boolean)
        .map((t) => `#${t}`)
    )
  );
}

function sortBookmarks(items: BookmarkItem[]): BookmarkItem[] {
  return [...items].sort((a, b) => {
    if (a.workspaceId !== b.workspaceId) {
      return a.workspaceId.localeCompare(b.workspaceId);
    }
    if (a.order !== b.order) return a.order - b.order;
    return b.updatedAt - a.updatedAt;
  });
}

function migrateLegacyBookmarks(): BookmarkItem[] {
  const legacy = readJsonStorage<LegacyBookmark[]>(STORAGE_KEYS.legacyBookmarks, []);
  if (!legacy.length) return [];
  const migrated = legacy.map((item, index) => {
    const ts = item.createdAt ?? Date.now();
    return {
      id: item.id,
      type: item.type,
      title: item.title,
      href: item.href,
      preview: "",
      tags: [],
      workspaceId: DEFAULT_WORKSPACE_ID,
      createdAt: ts,
      updatedAt: ts,
      order: index,
    } satisfies BookmarkItem;
  });
  writeJsonStorage(STORAGE_KEYS.bookmarks, migrated);
  return migrated;
}

function getBookmarks(): BookmarkItem[] {
  const current = readJsonStorage<BookmarkItem[]>(STORAGE_KEYS.bookmarks, []);
  const source = current.length > 0 ? current : migrateLegacyBookmarks();
  const normalized = source.map((item) => ({
    ...item,
    tags: normalizeTags(item.tags),
    workspaceId: item.workspaceId || DEFAULT_WORKSPACE_ID,
    preview: item.preview || "",
    updatedAt: item.updatedAt || item.createdAt || Date.now(),
    order: typeof item.order === "number" ? item.order : 0,
  }));
  return sortBookmarks(normalized);
}

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.bookmarks, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.bookmarks, callback);
  };
};

function saveBookmarks(next: BookmarkItem[]) {
  writeJsonStorage(STORAGE_KEYS.bookmarks, sortBookmarks(next));
  dispatchStorageEvent(STORAGE_EVENTS.bookmarks);
}

function getNextOrder(items: BookmarkItem[], workspaceId: string): number {
  const workspaceItems = items.filter((item) => item.workspaceId === workspaceId);
  return workspaceItems.length > 0
    ? Math.max(...workspaceItems.map((item) => item.order)) + 1
    : 0;
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getBookmarks, () => []);

  const addBookmark = useCallback((bookmark: AddBookmarkInput) => {
    const current = getBookmarks();
    if (current.find((b) => b.id === bookmark.id)) return;

    const now = Date.now();
    const workspaceId = bookmark.workspaceId || DEFAULT_WORKSPACE_ID;
    const next = [
      ...current,
      {
        ...bookmark,
        workspaceId,
        preview: bookmark.preview || "",
        tags: normalizeTags(bookmark.tags),
        createdAt: now,
        updatedAt: now,
        order: getNextOrder(current, workspaceId),
      },
    ];
    saveBookmarks(next);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    const current = getBookmarks();
    const next = current.filter((b) => b.id !== id);
    saveBookmarks(next);
  }, []);

  const isBookmarked = useCallback((id: string) => {
    return !!bookmarks.find((b) => b.id === id);
  }, [bookmarks]);

  const updateBookmark = useCallback((id: string, patch: Partial<Omit<BookmarkItem, "id" | "createdAt">>) => {
    const current = getBookmarks();
    const next = current.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch,
            tags: patch.tags ? normalizeTags(patch.tags) : item.tags,
            updatedAt: Date.now(),
          }
        : item
    );
    saveBookmarks(next);
  }, []);

  const moveBookmarkToWorkspace = useCallback((id: string, workspaceId: string) => {
    const current = getBookmarks();
    const targetOrder = getNextOrder(current, workspaceId);
    const next = current.map((item) =>
      item.id === id
        ? {
            ...item,
            workspaceId,
            order: targetOrder,
            updatedAt: Date.now(),
          }
        : item
    );
    saveBookmarks(next);
  }, []);

  const reorderBookmarks = useCallback((workspaceId: string, orderedIds: string[]) => {
    const current = getBookmarks();
    const workspaceItems = current.filter((item) => item.workspaceId === workspaceId);
    const otherItems = current.filter((item) => item.workspaceId !== workspaceId);
    const workspaceMap = new Map(workspaceItems.map((item) => [item.id, item]));
    const ordered: BookmarkItem[] = [];

    orderedIds.forEach((id) => {
      const item = workspaceMap.get(id);
      if (item) ordered.push(item);
    });
    workspaceItems.forEach((item) => {
      if (!orderedIds.includes(item.id)) ordered.push(item);
    });

    const nextWorkspace = ordered.map((item, index) => ({ ...item, order: index, updatedAt: Date.now() }));
    saveBookmarks([...otherItems, ...nextWorkspace]);
  }, []);

  const toggleBookmark = useCallback((bookmark: AddBookmarkInput) => {
    if (isBookmarked(bookmark.id)) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(bookmark);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    moveBookmarkToWorkspace,
    reorderBookmarks,
    isBookmarked,
    toggleBookmark,
  };
}
