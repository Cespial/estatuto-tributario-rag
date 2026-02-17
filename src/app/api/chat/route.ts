import { streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { runRAGPipeline } from "@/lib/rag/pipeline";
import { LIBROS } from "@/config/categories";
import { ChatRequestSchema, validateMessageLength } from "@/lib/api/validation";
import { checkRateLimit } from "@/lib/api/rate-limiter";

export const maxDuration = 60;

const CHAT_MODEL = process.env.CHAT_MODEL || "claude-sonnet-4-5-20250929";

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = getClientIP(req);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Cuerpo de solicitud inválido." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Solicitud inválida.",
        details: parsed.error.issues.map((i) => i.message),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, filters } = parsed.data;

  // Validate message length
  const lengthError = validateMessageLength(messages);
  if (lengthError) {
    return new Response(
      JSON.stringify({ error: lengthError }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return new Response(
      JSON.stringify({ error: "Falta mensaje del usuario." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const userQuery = getTextFromMessage(lastMessage as unknown as UIMessage);

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
    model: anthropic(CHAT_MODEL),
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
