import { streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { runRAGPipeline } from "@/lib/rag/pipeline";
import { LIBROS } from "@/config/categories";

export const maxDuration = 60;

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages: UIMessage[] = body.messages ?? [];
  const filters = body.filters as { libro?: string } | undefined;

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return new Response("Missing user message", { status: 400 });
  }

  const userQuery = getTextFromMessage(lastMessage);

  // Resolve libro filter
  let libroFilter: string | undefined;
  if (filters?.libro) {
    const libro = LIBROS.find((l) => l.key === filters.libro);
    if (libro) libroFilter = libro.filter;
  }

  // Run RAG pipeline
  const { system, contextBlock, sources, debugInfo } = await runRAGPipeline(userQuery, {
    libroFilter,
  });

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system,
    messages: [
      { role: "user" as const, content: contextBlock },
    ],
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return {
          sources,
          ragMetadata: {
            chunksRetrieved: debugInfo?.chunksRetrieved,
            tokensUsed: debugInfo?.tokensUsed,
            queryEnhanced: debugInfo?.queryEnhanced,
          },
        };
      }
      return undefined;
    },
  });
}
