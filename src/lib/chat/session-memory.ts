export function buildConversationContext(
  messages: Array<Record<string, unknown>>,
  maxTurns = 5
): string {
  const relevant = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-maxTurns * 2);

  if (relevant.length === 0) return "";

  const summary = relevant
    .map((m) => {
      let text = "";
      if (typeof m.content === "string") {
        text = m.content;
      } else if (Array.isArray(m.content)) {
        text = m.content.map((p: Record<string, unknown>) => (p.text as string) || "").join(" ");
      } else if (Array.isArray(m.parts)) {
        text = (m.parts as Array<Record<string, unknown>>)
          .filter((p) => p.type === "text")
          .map((p) => (p.text as string) || "")
          .join(" ");
      }
      const truncated = text.length > 200 ? text.slice(0, 200) + "..." : text;
      return `${m.role === "user" ? "Usuario" : "Asistente"}: ${truncated}`;
    })
    .join("\n");

  return `<conversation_history>\n${summary}\n</conversation_history>`;
}
