"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useNotes } from "@/hooks/useNotes";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { TagInput } from "./tag-input";

function inferType(pathname: string) {
  if (pathname.startsWith("/calculadoras")) return "calc" as const;
  if (pathname.startsWith("/guias")) return "guide" as const;
  if (pathname.startsWith("/doctrina")) return "doctrina" as const;
  if (pathname.startsWith("/novedades")) return "novedad" as const;
  return "art" as const;
}

export function QuickAddFab() {
  const pathname = usePathname();
  const { workspaces } = useWorkspaces();
  const { addBookmark } = useBookmarks();
  const { saveNote } = useNotes();

  const [open, setOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const defaultWorkspaceId = workspaces[0]?.id || "workspace-general";

  useEffect(() => {
    if (!workspaceId && defaultWorkspaceId) {
      queueMicrotask(() => setWorkspaceId(defaultWorkspaceId));
    }
  }, [workspaceId, defaultWorkspaceId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const suggestedTitle = useMemo(() => {
    if (pathname === "/") return "Consulta IA destacada";
    if (pathname.startsWith("/articulo/")) return `Artículo ${pathname.split("/").pop()}`;
    return pathname.replaceAll("/", " ").trim() || "Contenido guardado";
  }, [pathname]);

  const save = () => {
    const cleanTitle = (title || suggestedTitle).trim();
    const cleanHref = pathname || "/";
    const targetId = cleanHref.replace(/\W+/g, "-");
    addBookmark({
      id: `quick-${targetId}`,
      type: inferType(pathname),
      title: cleanTitle,
      href: cleanHref,
      workspaceId: workspaceId || defaultWorkspaceId,
      tags,
      preview: "Guardado desde acceso rápido.",
    });
    if (note.trim()) {
      saveNote(targetId, note.trim(), {
        workspaceId: workspaceId || defaultWorkspaceId,
        tags,
        targetSlug: pathname.startsWith("/articulo/") ? pathname.split("/").pop() : undefined,
        targetType: pathname.startsWith("/calculadoras") ? "calc" : "other",
      });
    }
    setOpen(false);
    setTitle("");
    setNote("");
    setTags([]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition-transform hover:scale-[1.02]"
        title="Quick-add (Cmd/Ctrl + Shift + K)"
      >
        <Plus className="h-4 w-4" />
        Quick-add
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                  Guardar en workspace
                </p>
                <h3 className="heading-serif mt-1 text-xl">Quick-add</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.05em] text-muted-foreground">
                  Workspace
                </label>
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.05em] text-muted-foreground">
                  Título
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={suggestedTitle}
                  className="w-full rounded-md border border-border/60 bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.05em] text-muted-foreground">
                  Nota rápida (opcional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border/60 bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
                />
              </div>

              <TagInput tags={tags} onChange={setTags} />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
