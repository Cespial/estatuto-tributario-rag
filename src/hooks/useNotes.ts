"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "superapp-notes";

export interface Note {
  id: string; // Puede ser el mismo ID que el bookmark asociado
  targetId: string; // ID del articulo, guia, etc.
  content: string;
  createdAt: number;
  updatedAt: number;
}

function getNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("notes-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("notes-changed", callback);
  };
};

export function useNotes() {
  const notes = useSyncExternalStore(subscribe, getNotes, () => []);

  const getNoteFor = useCallback((targetId: string) => {
    return notes.find((n) => n.targetId === targetId);
  }, [notes]);

  const saveNote = useCallback((targetId: string, content: string) => {
    const current = getNotes();
    const existingIndex = current.findIndex((n) => n.targetId === targetId);
    
    let next;
    if (existingIndex >= 0) {
      next = [...current];
      next[existingIndex] = {
        ...next[existingIndex],
        content,
        updatedAt: Date.now()
      };
    } else {
      next = [
        ...current,
        {
          id: Math.random().toString(36).substr(2, 9),
          targetId,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("notes-changed"));
  }, []);

  const deleteNote = useCallback((targetId: string) => {
    const current = getNotes();
    const next = current.filter((n) => n.targetId !== targetId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("notes-changed"));
  }, []);

  return {
    notes,
    getNoteFor,
    saveNote,
    deleteNote,
  };
}
