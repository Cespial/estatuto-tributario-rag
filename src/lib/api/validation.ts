import { z } from "zod/v4";

const MessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

const UIMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(MessagePartSchema),
});

const PageContextSchema = z.object({
  pathname: z.string(),
  module: z.enum([
    "home",
    "comparar",
    "favoritos",
    "tablas-retencion",
    "calculadora",
    "articulo",
    "other",
  ]),
  calculatorSlug: z.string().optional(),
  articleSlug: z.string().optional(),
  workspaceId: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(UIMessageSchema).min(1).max(50),
  conversationId: z.string().optional(),
  filters: z
    .object({
      libro: z.string().optional(),
    })
    .optional(),
  pageContext: PageContextSchema.optional(),
});

export const MAX_MESSAGE_LENGTH = 5000;

export function validateMessageLength(messages: z.infer<typeof ChatRequestSchema>["messages"]): string | null {
  for (const msg of messages) {
    for (const part of msg.parts) {
      if (part.text && part.text.length > MAX_MESSAGE_LENGTH) {
        return `El mensaje excede el límite de ${MAX_MESSAGE_LENGTH} caracteres.`;
      }
    }
  }
  return null;
}
