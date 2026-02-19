"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import {
  DEFAULT_WORKSPACE_ID,
  NoteHighlight,
  NoteItem,
  NoteTargetType,
} from "@/types/productivity";

export type Note = NoteItem;

interface LegacyNote {
  id: string;
  targetId: string;
  content: string;
  createdAt?: number;
  updatedAt?: number;
}

interface SaveNoteOptions {
  workspaceId?: string;
  targetType?: NoteTargetType;
  targetSlug?: string;
  tags?: string[];
  pinned?: boolean;
}

function createId(): string {
  return Math.random().toString(36).slice(2, 11);
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

function guessTargetType(targetId: string): NoteTargetType {
  if (/^art\./i.test(targetId) || /^articulo-/i.test(targetId)) return "art";
  if (targetId.includes("calculadora")) return "calc";
  return "other";
}

function migrateLegacyNotes(): NoteItem[] {
  const legacy = readJsonStorage<LegacyNote[]>(STORAGE_KEYS.legacyNotes, []);
  if (!legacy.length) return [];
  const migrated = legacy.map((item) => {
    const createdAt = item.createdAt ?? Date.now();
    const updatedAt = item.updatedAt ?? createdAt;
    return {
      id: item.id || createId(),
      targetId: item.targetId,
      targetType: guessTargetType(item.targetId),
      targetSlug: undefined,
      workspaceId: DEFAULT_WORKSPACE_ID,
      contentMarkdown: item.content || "",
      highlights: [],
      tags: [],
      pinned: false,
      createdAt,
      updatedAt,
    } satisfies NoteItem;
  });
  writeJsonStorage(STORAGE_KEYS.notes, migrated);
  return migrated;
}

function getNotes(): NoteItem[] {
  const current = readJsonStorage<NoteItem[]>(STORAGE_KEYS.notes, []);
  const source = current.length > 0 ? current : migrateLegacyNotes();
  return source
    .map((item) => ({
      ...item,
      workspaceId: item.workspaceId || DEFAULT_WORKSPACE_ID,
      targetType: item.targetType || guessTargetType(item.targetId),
      contentMarkdown: item.contentMarkdown || "",
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
      tags: normalizeTags(item.tags),
      pinned: Boolean(item.pinned),
      updatedAt: item.updatedAt || item.createdAt || Date.now(),
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
}

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.notes, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.notes, callback);
  };
};

function saveNotes(next: NoteItem[]) {
  writeJsonStorage(STORAGE_KEYS.notes, next);
  dispatchStorageEvent(STORAGE_EVENTS.notes);
}

export function useNotes() {
  const notes = useSyncExternalStore(subscribe, getNotes, () => []);

  const getNoteFor = useCallback((targetId: string) => {
    return notes.find((n) => n.targetId === targetId);
  }, [notes]);

  const saveNote = useCallback((targetId: string, contentMarkdown: string, options?: SaveNoteOptions) => {
    const current = getNotes();
    const existingIndex = current.findIndex((n) => n.targetId === targetId);

    let next;
    if (existingIndex >= 0) {
      next = [...current];
      next[existingIndex] = {
        ...next[existingIndex],
        contentMarkdown,
        targetSlug: options?.targetSlug ?? next[existingIndex].targetSlug,
        workspaceId: options?.workspaceId ?? next[existingIndex].workspaceId,
        targetType: options?.targetType ?? next[existingIndex].targetType,
        tags: options?.tags ? normalizeTags(options.tags) : next[existingIndex].tags,
        pinned: options?.pinned ?? next[existingIndex].pinned,
        highlights: next[existingIndex].highlights || [],
        updatedAt: Date.now(),
      };
    } else {
      next = [
        ...current,
        {
          id: createId(),
          targetId,
          targetType: options?.targetType || guessTargetType(targetId),
          targetSlug: options?.targetSlug,
          workspaceId: options?.workspaceId || DEFAULT_WORKSPACE_ID,
          contentMarkdown,
          highlights: [],
          tags: normalizeTags(options?.tags),
          pinned: options?.pinned || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    }

    saveNotes(next);
  }, []);

  const getHighlightsFor = useCallback((targetId: string): NoteHighlight[] => {
    return notes.find((n) => n.targetId === targetId)?.highlights || [];
  }, [notes]);

  const saveHighlightsFor = useCallback((targetId: string, highlights: NoteHighlight[]) => {
    const current = getNotes();
    const existingIndex = current.findIndex((n) => n.targetId === targetId);

    let next: NoteItem[];
    if (existingIndex >= 0) {
      next = [...current];
      next[existingIndex] = {
        ...next[existingIndex],
        highlights,
        updatedAt: Date.now(),
      };
    } else {
      next = [
        ...current,
        {
          id: createId(),
          targetId,
          targetType: "art",
          targetSlug: targetId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          contentMarkdown: "",
          highlights,
          tags: [],
          pinned: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    }

    saveNotes(next);
  }, []);

  const addHighlight = useCallback((targetId: string, highlight: Omit<NoteHighlight, "id" | "createdAt">) => {
    const current = getHighlightsFor(targetId);
    const next = [
      ...current,
      {
        ...highlight,
        id: createId(),
        createdAt: Date.now(),
      },
    ];
    saveHighlightsFor(targetId, next);
  }, [getHighlightsFor, saveHighlightsFor]);

  const removeHighlight = useCallback((targetId: string, highlightId: string) => {
    const current = getHighlightsFor(targetId);
    const next = current.filter((highlight) => highlight.id !== highlightId);
    saveHighlightsFor(targetId, next);
  }, [getHighlightsFor, saveHighlightsFor]);

  const deleteNote = useCallback((targetId: string) => {
    const current = getNotes();
    const next = current.filter((n) => n.targetId !== targetId);
    saveNotes(next);
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Omit<NoteItem, "id" | "createdAt">>) => {
    const current = getNotes();
    const next = current.map((note) =>
      note.id === id
        ? {
            ...note,
            ...patch,
            tags: patch.tags ? normalizeTags(patch.tags) : note.tags,
            updatedAt: Date.now(),
          }
        : note
    );
    saveNotes(next);
  }, []);

  const moveNotesToWorkspace = useCallback((workspaceId: string, targetWorkspaceId: string) => {
    const current = getNotes();
    const next = current.map((note) =>
      note.workspaceId === workspaceId
        ? { ...note, workspaceId: targetWorkspaceId, updatedAt: Date.now() }
        : note
    );
    saveNotes(next);
  }, []);

  return {
    notes,
    getNoteFor,
    saveNote,
    getHighlightsFor,
    saveHighlightsFor,
    addHighlight,
    removeHighlight,
    deleteNote,
    updateNote,
    moveNotesToWorkspace,
  };
}
