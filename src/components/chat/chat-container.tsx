"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useMemo, FormEvent } from "react";
import { Scale, BookOpen } from "lucide-react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import { FilterChips } from "./filter-chips";
import { CalculatorSuggestions } from "./calculator-suggestions";
import { suggestCalculators } from "@/lib/chat/calculator-context";
import type { SourceCitation } from "@/types/rag";

export function ChatContainer() {
  const [libroFilter, setLibroFilter] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: libroFilter ? { filters: { libro: libroFilter } } : undefined,
      }),
    [libroFilter]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!input.trim() || isLoading) return;
      const text = input.trim();
      setInput("");
      sendMessage({ text });
    },
    [input, isLoading, sendMessage]
  );

  const handleQuestionSelect = useCallback(
    (question: string) => {
      setInput("");
      sendMessage({ text: question });
    },
    [sendMessage]
  );

  // Extract sources from the last assistant message metadata
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const sources: SourceCitation[] =
    (lastAssistant?.metadata as { sources?: SourceCitation[] } | undefined)?.sources ?? [];

  // Find last user message to generate calculator suggestions
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const userText = lastUserMessage
    ? lastUserMessage.parts
        ?.filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("") || ""
    : "";
  const suggestions = userText ? suggestCalculators(userText) : [];

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Filter chips */}
      <div className="border-b border-border/40 px-4 py-2">
        <div className="mx-auto max-w-4xl">
          <FilterChips selected={libroFilter} onChange={setLibroFilter} />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-muted p-4">
                <Scale className="h-10 w-10 text-foreground" />
              </div>
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-playfair)] text-2xl font-bold">
              SuperApp Tributaria Colombia
            </h2>
            <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Consulta los 1,294 articulos indexados
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <SuggestedQuestions onSelect={handleQuestionSelect} />
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          sources={sources}
          isLoading={isLoading}
        />
      )}

      {messages.length > 0 && suggestions.length > 0 && (
        <CalculatorSuggestions suggestions={suggestions} />
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
