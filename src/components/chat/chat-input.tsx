"use client";

import { FormEvent, useRef, useEffect, useCallback } from "react";
import { MessageSquarePlus, Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onNewConversation?: () => void;
  contextLabel?: string;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  onNewConversation,
  contextLabel,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    },
    [input, isLoading]
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="border-t border-border/40 p-4">
      <div className="mx-auto mb-2 flex max-w-4xl items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          {contextLabel || "Asistente IA del Estatuto Tributario"}
        </p>
        {onNewConversation && (
          <button
            type="button"
            onClick={onNewConversation}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Nueva conversación
          </button>
        )}
      </div>
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <div className="relative flex-1">
          <label htmlFor="chat-input" className="sr-only">
            Pregunta sobre tributaria colombiana
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre el Estatuto Tributario..."
            rows={1}
            className="w-full resize-none rounded-lg border border-border/60 bg-card px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-foreground focus-visible:ring-1 focus-visible:ring-foreground/20"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
