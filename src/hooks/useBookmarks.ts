"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "superapp-bookmarks";

export interface Bookmark {
  id: string;
  type: "art" | "calc" | "guide" | "doctrina" | "novedad";
  title: string;
  href: string;
  createdAt: number;
}

function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("bookmarks-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("bookmarks-changed", callback);
  };
};

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getBookmarks, () => []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "createdAt">) => {
    const current = getBookmarks();
    if (current.find((b) => b.id === bookmark.id)) return;
    
    const next = [...current, { ...bookmark, createdAt: Date.now() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("bookmarks-changed"));
  }, []);

  const removeBookmark = useCallback((id: string) => {
    const current = getBookmarks();
    const next = current.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("bookmarks-changed"));
  }, []);

  const isBookmarked = useCallback((id: string) => {
    return !!bookmarks.find((b) => b.id === id);
  }, [bookmarks]);

  const toggleBookmark = useCallback((bookmark: Omit<Bookmark, "createdAt">) => {
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
    isBookmarked,
    toggleBookmark,
  };
}
