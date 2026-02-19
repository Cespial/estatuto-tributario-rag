"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import {
  DEFAULT_WORKSPACE,
  DEFAULT_WORKSPACE_ID,
  Workspace,
  WorkspaceIcon,
} from "@/types/productivity";

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function ensureWorkspaceDefaults(items: Workspace[]): Workspace[] {
  const hasGeneral = items.some((w) => w.id === DEFAULT_WORKSPACE_ID);
  if (hasGeneral) return items;
  return [{ ...DEFAULT_WORKSPACE, createdAt: Date.now(), updatedAt: Date.now() }, ...items];
}

function getWorkspaces(): Workspace[] {
  const stored = readJsonStorage<Workspace[]>(STORAGE_KEYS.workspaces, []);
  const withDefaults = ensureWorkspaceDefaults(stored).sort((a, b) => a.order - b.order);
  if (typeof window !== "undefined" && withDefaults.length !== stored.length) {
    writeJsonStorage(STORAGE_KEYS.workspaces, withDefaults);
  }
  return withDefaults;
}

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.workspaces, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.workspaces, callback);
  };
};

export function useWorkspaces() {
  const workspaces = useSyncExternalStore(subscribe, getWorkspaces, () => [DEFAULT_WORKSPACE]);

  const save = useCallback((next: Workspace[]) => {
    writeJsonStorage(
      STORAGE_KEYS.workspaces,
      next.sort((a, b) => a.order - b.order)
    );
    dispatchStorageEvent(STORAGE_EVENTS.workspaces);
  }, []);

  const addWorkspace = useCallback(
    (params: { name: string; color?: string; icon?: WorkspaceIcon }) => {
      const current = getWorkspaces();
      const now = Date.now();
      const item: Workspace = {
        id: createId("workspace"),
        name: params.name.trim(),
        color: params.color || "#0f0e0d",
        icon: params.icon || "folder",
        createdAt: now,
        updatedAt: now,
        order: current.length,
      };
      save([...current, item]);
      return item;
    },
    [save]
  );

  const updateWorkspace = useCallback(
    (id: string, patch: Partial<Pick<Workspace, "name" | "color" | "icon">>) => {
      const current = getWorkspaces();
      const next = current.map((w) =>
        w.id === id ? { ...w, ...patch, updatedAt: Date.now() } : w
      );
      save(next);
    },
    [save]
  );

  const removeWorkspace = useCallback(
    (id: string) => {
      if (id === DEFAULT_WORKSPACE_ID) return;
      const current = getWorkspaces();
      const next = current
        .filter((w) => w.id !== id)
        .map((w, index) => ({ ...w, order: index }));
      save(next);
      return DEFAULT_WORKSPACE_ID;
    },
    [save]
  );

  const reorderWorkspaces = useCallback(
    (orderedIds: string[]) => {
      const current = getWorkspaces();
      const map = new Map(current.map((w) => [w.id, w]));
      const next: Workspace[] = [];
      orderedIds.forEach((id) => {
        const workspace = map.get(id);
        if (workspace) next.push(workspace);
      });
      current.forEach((workspace) => {
        if (!orderedIds.includes(workspace.id)) next.push(workspace);
      });
      save(next.map((workspace, index) => ({ ...workspace, order: index })));
    },
    [save]
  );

  return {
    workspaces,
    addWorkspace,
    updateWorkspace,
    removeWorkspace,
    reorderWorkspaces,
  };
}
