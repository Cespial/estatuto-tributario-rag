"use client";

import { ChatConversation } from "@/types/chat-history";
import { MessageSquarePlus, Trash2, Search } from "lucide-react";
import { clsx } from "clsx";
import { useState, useMemo } from "react";

interface ConversationSidebarProps {
  conversations: ChatConversation[];
  selectedConversationId: string;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const lowerQuery = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(lowerQuery);
      const contentMatch = c.messages.some((m) => {
        const text = m.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("") || "";
        return text.toLowerCase().includes(lowerQuery);
      });
      return titleMatch || contentMatch;
    });
  }, [conversations, searchQuery]);

  return (
    <aside className="hidden h-full w-72 shrink-0 border-r border-border/40 bg-card/50 md:flex md:flex-col">
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          Historial
        </p>
        <button
          onClick={onCreateConversation}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Nueva conversación"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-border/40 px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar en conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border/50 bg-background/50 py-1.5 pl-8 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {searchQuery ? "No se encontraron coincidencias." : "Sin conversaciones guardadas."}
          </p>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={clsx(
                "group rounded-md border border-transparent px-2 py-2",
                conversation.id === selectedConversationId
                  ? "border-border bg-muted/60"
                  : "hover:bg-muted/30"
              )}
            >
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className="w-full text-left"
              >
                <p className="line-clamp-1 text-sm font-medium text-foreground">{conversation.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(conversation.updatedAt).toLocaleString("es-CO")}
                </p>
              </button>
              <div className="mt-1 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onDeleteConversation(conversation.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Eliminar conversación"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
