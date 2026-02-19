"use client";

import { MessageSquare } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/config/constants";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  questions?: string[];
  title?: string;
}

export function SuggestedQuestions({
  onSelect,
  questions = SUGGESTED_QUESTIONS,
  title = "Preguntas sugeridas",
}: SuggestedQuestionsProps) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.05em] text-muted-foreground">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-all hover:border-foreground/30 hover:shadow-sm"
          >
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
