"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  StickyNote, 
  Trash2, 
  ExternalLink, 
  Download, 
  Upload,
  Calendar,
  FileText,
  Calculator,
  GraduationCap,
  Newspaper
} from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useNotes } from "@/hooks/useNotes";
import { Header } from "@/components/layout/header";
import { clsx } from "clsx";

const TYPE_ICONS = {
  art: FileText,
  calc: Calculator,
  guide: GraduationCap,
  doctrina: Newspaper,
  novedad: Calendar,
};

const TYPE_LABELS = {
  art: "Artículos",
  calc: "Calculadoras",
  guide: "Guías",
  doctrina: "Doctrina",
  novedad: "Novedades",
};

export default function FavoritosPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { notes, deleteNote, saveNote } = useNotes();
  const [activeTab, setActiveTab] = useState<"favoritos" | "notas">("favoritos");

  const exportData = () => {
    const data = {
      bookmarks,
      notes,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `favoritos-superapp-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.bookmarks) {
          localStorage.setItem("superapp-bookmarks", JSON.stringify(data.bookmarks));
          window.dispatchEvent(new Event("bookmarks-changed"));
        }
        if (data.notes) {
          localStorage.setItem("superapp-notes", JSON.stringify(data.notes));
          window.dispatchEvent(new Event("notes-changed"));
        }
      } catch {
        alert("Error al importar el archivo. Verifica que sea un archivo JSON válido.");
      }
    };
    input.click();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Espacio</h1>
          <p className="text-muted-foreground">Gestiona tus favoritos, notas y datos guardados.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={importData}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            Importar
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="mb-8 flex border-b">
        <button
          onClick={() => setActiveTab("favoritos")}
          className={clsx(
            "flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-colors",
            activeTab === "favoritos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Bookmark className="h-4 w-4" />
          Favoritos ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab("notas")}
          className={clsx(
            "flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-colors",
            activeTab === "notas" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <StickyNote className="h-4 w-4" />
          Notas ({notes.length})
        </button>
      </div>

      {activeTab === "favoritos" ? (
        <div className="space-y-6">
          {bookmarks.length === 0 ? (
            <div className="rounded-3xl border border-dashed py-20 text-center">
              <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
              <p className="text-muted-foreground">No tienes favoritos guardados aún.</p>
            </div>
          ) : (
            Object.entries(
              bookmarks.reduce((acc, b) => {
                if (!acc[b.type]) acc[b.type] = [];
                acc[b.type].push(b);
                return acc;
              }, {} as Record<string, typeof bookmarks>)
            ).map(([type, items]) => (
              <div key={type} className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => {
                    const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || FileText;
                    return (
                      <div key={item.id} className="group relative flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50">
                        <Link href={item.href} className="flex flex-1 items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="truncate font-semibold text-sm">{item.title}</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                        <div className="ml-4 flex items-center gap-2">
                          <button
                            onClick={() => removeBookmark(item.id)}
                            className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {notes.length === 0 ? (
            <div className="rounded-3xl border border-dashed py-20 text-center">
              <StickyNote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
              <p className="text-muted-foreground">No tienes notas creadas aún.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <div key={note.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between border-b pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Nota en {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteNote(note.targetId)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    className="min-h-[100px] w-full resize-none bg-transparent text-sm focus:outline-none"
                    value={note.content}
                    onChange={(e) => saveNote(note.targetId, e.target.value)}
                  />
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/explorador?art=${note.targetId}`}
                      className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                    >
                      Ver referencia
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
