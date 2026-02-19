"use client";

import { FormEvent, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
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
            className="w-full resize-none rounded-lg border border-border/60 bg-card px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
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
