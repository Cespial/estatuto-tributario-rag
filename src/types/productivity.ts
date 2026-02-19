export type WorkspaceIcon =
  | "briefcase"
  | "folder"
  | "user"
  | "building"
  | "bookmark"
  | "file";

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon: WorkspaceIcon;
  createdAt: number;
  updatedAt: number;
  order: number;
}

export type BookmarkType = "art" | "calc" | "guide" | "doctrina" | "novedad";

export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  title: string;
  href: string;
  preview?: string;
  tags: string[];
  workspaceId: string;
  createdAt: number;
  updatedAt: number;
  order: number;
}

export type NoteTargetType = "art" | "calc" | "guide" | "doctrina" | "other";

export interface NoteHighlight {
  id: string;
  text: string;
  color: "amber" | "blue" | "green" | "rose";
  note?: string;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  targetId: string;
  targetType: NoteTargetType;
  targetSlug?: string;
  workspaceId: string;
  contentMarkdown: string;
  highlights?: NoteHighlight[];
  tags: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type RecentItemType = "art" | "calc" | "guide" | "other";

export interface RecentItem {
  id: string;
  type: RecentItemType;
  title: string;
  href: string;
  slug?: string;
  visitedAt: number;
}

export const DEFAULT_WORKSPACE_ID = "workspace-general";

export const DEFAULT_WORKSPACE: Workspace = {
  id: DEFAULT_WORKSPACE_ID,
  name: "General",
  color: "#0f0e0d",
  icon: "briefcase",
  createdAt: 0,
  updatedAt: 0,
  order: 0,
};
