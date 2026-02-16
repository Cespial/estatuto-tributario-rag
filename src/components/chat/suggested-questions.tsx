"use client";

import { MessageSquare } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/config/constants";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SUGGESTED_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="flex items-start gap-2 rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted"
        >
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{q}</span>
        </button>
      ))}
    </div>
  );
}
