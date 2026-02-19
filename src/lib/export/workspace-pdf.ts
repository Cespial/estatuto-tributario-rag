import { BookmarkItem, NoteItem, Workspace } from "@/types/productivity";

export function buildWorkspaceExportHtml(
  workspace: Workspace,
  bookmarks: BookmarkItem[],
  notes: NoteItem[]
): string {
  const bookmarkHtml = bookmarks.length
    ? bookmarks
        .map(
          (bookmark) => `
          <li>
            <strong>${escapeHtml(bookmark.title)}</strong><br />
            <span>${escapeHtml(bookmark.href)}</span><br />
            <small>Tags: ${bookmark.tags.join(", ") || "Sin tags"}</small>
          </li>`
        )
        .join("")
    : "<li>Sin favoritos en este workspace.</li>";

  const noteHtml = notes.length
    ? notes
        .map(
          (note) => `
          <li>
            <strong>Referencia:</strong> ${escapeHtml(note.targetId)}<br />
            <small>Tags: ${note.tags.join(", ") || "Sin tags"}</small>
            <p>${escapeHtml(note.contentMarkdown.slice(0, 400))}</p>
          </li>`
        )
        .join("")
    : "<li>Sin notas en este workspace.</li>";

  return `
    <section>
      <h2>Workspace: ${escapeHtml(workspace.name)}</h2>
      <p>Total de favoritos: ${bookmarks.length} · Total de notas: ${notes.length}</p>
    </section>
    <section>
      <h3>Favoritos</h3>
      <ol>${bookmarkHtml}</ol>
    </section>
    <section>
      <h3>Notas</h3>
      <ol>${noteHtml}</ol>
    </section>
  `;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
