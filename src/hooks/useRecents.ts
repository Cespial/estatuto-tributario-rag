"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import { RecentItem, RecentItemType } from "@/types/productivity";

const MAX_RECENTS = 20;

interface TrackRecentInput {
  id: string;
  title: string;
  href: string;
  type: RecentItemType;
  slug?: string;
}

let _recentsCache: { raw: string; parsed: RecentItem[] } | null = null;

function getRecents(): RecentItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.recents) ?? "";
  if (_recentsCache && _recentsCache.raw === raw) return _recentsCache.parsed;
  const parsed = readJsonStorage<RecentItem[]>(STORAGE_KEYS.recents, []).sort(
    (a, b) => b.visitedAt - a.visitedAt
  );
  _recentsCache = { raw, parsed };
  return parsed;
}

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.recents, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.recents, callback);
  };
};

export function useRecents() {
  const recents = useSyncExternalStore(subscribe, getRecents, () => []);

  const save = useCallback((next: RecentItem[]) => {
    _recentsCache = null;
    writeJsonStorage(
      STORAGE_KEYS.recents,
      next
        .sort((a, b) => b.visitedAt - a.visitedAt)
        .slice(0, MAX_RECENTS)
    );
    dispatchStorageEvent(STORAGE_EVENTS.recents);
  }, []);

  const trackRecent = useCallback(
    (input: TrackRecentInput) => {
      const current = getRecents();
      const filtered = current.filter((item) => item.id !== input.id);
      const next: RecentItem = {
        ...input,
        visitedAt: Date.now(),
      };
      save([next, ...filtered]);
    },
    [save]
  );

  const removeRecent = useCallback(
    (id: string) => {
      const current = getRecents();
      save(current.filter((item) => item.id !== id));
    },
    [save]
  );

  const clearRecents = useCallback(() => {
    save([]);
  }, [save]);

  return { recents, trackRecent, removeRecent, clearRecents };
}
