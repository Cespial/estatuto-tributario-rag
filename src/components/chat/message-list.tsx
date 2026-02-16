"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { SourceCitation } from "./source-citation";
import type { UIMessage } from "ai";
import type { SourceCitation as SourceType } from "@/types/rag";

interface MessageListProps {
  messages: UIMessage[];
  sources: SourceType[];
  isLoading: boolean;
}

export function MessageList({ messages, sources, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={message.id}>
          <MessageBubble message={message} />
          {/* Show sources after the last assistant message */}
          {message.role === "assistant" &&
            index === messages.length - 1 &&
            sources.length > 0 && (
              <div className="ml-11 mt-2 flex flex-wrap gap-1.5">
                {sources.map((source) => (
                  <SourceCitation
                    key={source.idArticulo}
                    idArticulo={source.idArticulo}
                    titulo={source.titulo}
                    url={source.url}
                    categoriaLibro={source.categoriaLibro}
                  />
                ))}
              </div>
            )}
        </div>
      ))}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
