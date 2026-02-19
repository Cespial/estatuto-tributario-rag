"use client";

import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "superapp-calendar-profiles-v1";

export interface CalendarProfile {
  id: string;
  name: string;
  nitFilters: string[];
  createdAt: number;
  updatedAt: number;
}

interface StoredCalendarProfiles {
  activeProfileId: string | null;
  profiles: CalendarProfile[];
}

const EMPTY_STORAGE: StoredCalendarProfiles = {
  activeProfileId: null,
  profiles: [],
};

function readStorage(): StoredCalendarProfiles {
  if (typeof window === "undefined") return EMPTY_STORAGE;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_STORAGE;
  try {
    const parsed = JSON.parse(raw) as StoredCalendarProfiles;
    if (!Array.isArray(parsed.profiles)) return EMPTY_STORAGE;
    return parsed;
  } catch {
    return EMPTY_STORAGE;
  }
}

function writeStorage(value: StoredCalendarProfiles) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useCalendarProfiles() {
  const [storage, setStorage] = useState<StoredCalendarProfiles>(() => readStorage());

  const persist = useCallback((next: StoredCalendarProfiles) => {
    setStorage(next);
    writeStorage(next);
  }, []);

  const saveProfile = useCallback(
    (name: string, nitFilters: string[]) => {
      if (!name.trim() || nitFilters.length === 0) return;
      const now = Date.now();
      const existing = storage.profiles.find((profile) => profile.name.toLowerCase() === name.trim().toLowerCase());
      if (existing) {
        persist({
          activeProfileId: existing.id,
          profiles: storage.profiles.map((profile) =>
            profile.id === existing.id
              ? { ...profile, nitFilters, updatedAt: now, name: name.trim() }
              : profile
          ),
        });
        return;
      }

      const profile: CalendarProfile = {
        id: createId(),
        name: name.trim(),
        nitFilters,
        createdAt: now,
        updatedAt: now,
      };

      persist({
        activeProfileId: profile.id,
        profiles: [profile, ...storage.profiles].slice(0, 20),
      });
    },
    [persist, storage]
  );

  const deleteProfile = useCallback(
    (profileId: string) => {
      const nextProfiles = storage.profiles.filter((profile) => profile.id !== profileId);
      persist({
        activeProfileId: storage.activeProfileId === profileId ? null : storage.activeProfileId,
        profiles: nextProfiles,
      });
    },
    [persist, storage.activeProfileId, storage.profiles]
  );

  const setActiveProfile = useCallback(
    (profileId: string | null) => {
      persist({
        ...storage,
        activeProfileId: profileId,
      });
    },
    [persist, storage]
  );

  const activeProfile = useMemo(
    () => storage.profiles.find((profile) => profile.id === storage.activeProfileId) ?? null,
    [storage.activeProfileId, storage.profiles]
  );

  return {
    profiles: storage.profiles,
    activeProfileId: storage.activeProfileId,
    activeProfile,
    saveProfile,
    deleteProfile,
    setActiveProfile,
  };
}

