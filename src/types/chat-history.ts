import type { UIMessage } from "ai";

export interface ChatPageContext {
  pathname: string;
  module:
    | "home"
    | "comparar"
    | "favoritos"
    | "tablas-retencion"
    | "calculadora"
    | "articulo"
    | "other";
  calculatorSlug?: string;
  articleSlug?: string;
  workspaceId?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
  pageContext?: ChatPageContext;
  libroFilter?: string;
}

export interface ChatMessageFeedback {
  conversationId: string;
  messageId: string;
  value: "up" | "down";
  createdAt: number;
}
