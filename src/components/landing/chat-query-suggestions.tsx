"use client";

interface ChatQuerySuggestionsProps {
  queries: string[];
}

export function ChatQuerySuggestions({ queries }: ChatQuerySuggestionsProps) {
  const handleQueryClick = (query: string) => {
    window.dispatchEvent(
      new CustomEvent("superapp:chat-query", { detail: { query } })
    );
  };

  return (
    <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
      {queries.map((query) => (
        <button
          key={query}
          onClick={() => handleQueryClick(query)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
