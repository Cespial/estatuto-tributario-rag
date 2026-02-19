"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useMemo, FormEvent, useEffect, useRef } from "react";
import { Scale, BookOpen } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import { FilterChips } from "./filter-chips";
import { CalculatorSuggestions } from "./calculator-suggestions";
import { suggestCalculators } from "@/lib/chat/calculator-context";
import type { SourceCitation } from "@/types/rag";
import { UI_COPY } from "@/config/ui-copy";
import { getContextualQuestions, getPageModule } from "@/lib/chat/contextual-questions";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ChatConversation, ChatPageContext } from "@/types/chat-history";
import { ConversationSidebar } from "./conversation-sidebar";
import { trackEvent } from "@/lib/telemetry/events";
import { ChatBottomSheet } from "./chat-bottom-sheet";

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  return (
    message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text || "")
      .join("") || ""
  );
}

function createConversationId(): string {
  return `conv-${Math.random().toString(36).slice(2, 11)}`;
}

function buildConversationTitle(messages: Array<{ role?: string; parts?: Array<{ type: string; text?: string }> }>, fallback = "Nueva conversación"): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return fallback;
  const text = getMessageText(firstUser);
  if (!text.trim()) return fallback;
  return text.slice(0, 72);
}

function parsePageContext(pathname: string): ChatPageContext {
  const segments = pathname.split("/").filter(Boolean);
  return {
    pathname,
    module: getPageModule(pathname),
    calculatorSlug: pathname.startsWith("/calculadoras/") ? segments[1] : undefined,
    articleSlug: pathname.startsWith("/articulo/") ? segments[1] : undefined,
  };
}

export function ChatContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageContext = useMemo(() => parsePageContext(pathname), [pathname]);
  const contextualQuestions = useMemo(() => getContextualQuestions(pathname), [pathname]);
  const prefilledInput = useMemo(() => {
    const prompt = searchParams.get("prompt");
    if (!prompt) return "";
    const contextSlug = searchParams.get("contextSlug");
    return contextSlug
      ? `${prompt}\n\nContexto sugerido: Artículo ${contextSlug}.`
      : prompt;
  }, [searchParams]);

  const [libroFilter, setLibroFilter] = useState<string | undefined>(undefined);
  const [input, setInput] = useState(prefilledInput);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const persistKeyRef = useRef("");

  const {
    conversations,
    saveConversation,
    removeConversation,
    setFeedback,
    getFeedback,
  } = useChatHistory();

  useEffect(() => {
    if (selectedConversationId) return;
    if (conversations.length > 0) {
      queueMicrotask(() => setSelectedConversationId(conversations[0].id));
      return;
    }
    const id = createConversationId();
    saveConversation({
      id,
      title: "Nueva conversación",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      pageContext,
      libroFilter: undefined,
    });
    queueMicrotask(() => setSelectedConversationId(id));
  }, [selectedConversationId, conversations, saveConversation, pageContext]);

  const currentConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          conversationId: selectedConversationId,
          pageContext,
          ...(libroFilter ? { filters: { libro: libroFilter } } : {}),
        },
      }),
    [libroFilter, pageContext, selectedConversationId]
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    id: "superapp-chat-ui",
    transport,
    messages: currentConversation?.messages || [],
  });

  useEffect(() => {
    if (!currentConversation) return;
    queueMicrotask(() => {
      setMessages(currentConversation.messages || []);
      setLibroFilter(currentConversation.libroFilter);
    });
  }, [currentConversation, setMessages]);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!selectedConversationId) return;
    const existing = currentConversation;
    const compactMessages = messages.map((message) => ({
      id: message.id,
      role: message.role,
      text: getMessageText(message),
    }));
    const persistenceKey = JSON.stringify({
      id: selectedConversationId,
      messages: compactMessages,
      libroFilter: libroFilter || null,
      pathname: pageContext.pathname,
    });
    if (persistKeyRef.current === persistenceKey) return;
    persistKeyRef.current = persistenceKey;

    const nextConversation: ChatConversation = {
      id: selectedConversationId,
      title: buildConversationTitle(messages, existing?.title || "Nueva conversación"),
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages,
      pageContext,
      libroFilter,
    };
    saveConversation(nextConversation);
  }, [
    messages,
    selectedConversationId,
    saveConversation,
    currentConversation,
    pageContext,
    libroFilter,
  ]);

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

  const handleNewConversation = useCallback(() => {
    const id = createConversationId();
    setSelectedConversationId(id);
    setMessages([]);
    setInput("");
    setLibroFilter(undefined);
    saveConversation({
      id,
      title: "Nueva conversación",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      pageContext,
      libroFilter: undefined,
    });
  }, [pageContext, saveConversation, setMessages]);

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      removeConversation(conversationId);
      if (conversationId !== selectedConversationId) return;
      const next = conversations.find((conversation) => conversation.id !== conversationId);
      if (next) {
        setSelectedConversationId(next.id);
      } else {
        handleNewConversation();
      }
    },
    [removeConversation, selectedConversationId, conversations, handleNewConversation]
  );

  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const sources: SourceCitation[] =
    (lastAssistant?.metadata as { sources?: SourceCitation[] } | undefined)?.sources ?? [];

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const userText = lastUserMessage ? getMessageText(lastUserMessage) : "";
  const suggestions = userText ? suggestCalculators(userText, 3, pageContext) : [];

  const isEmpty = messages.length === 0;

  const shareResponse = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Respuesta del Asistente Tributario",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
      trackEvent("chat_response_shared", {
        conversationId: selectedConversationId,
      });
    } catch {
      // Share can fail when user cancels.
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onCreateConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <div className="min-w-0 flex-1">
        <ChatBottomSheet>
          <div className="flex h-full flex-col">
            <div className="border-b border-border/40 px-4 py-2">
              <div className="mx-auto max-w-4xl">
                <FilterChips selected={libroFilter} onChange={setLibroFilter} />
              </div>
            </div>

            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center p-4">
                <div className="mb-8 max-w-2xl text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-lg bg-muted p-4">
                      <Scale className="h-10 w-10 text-foreground" />
                    </div>
                  </div>
                  <h2 className="mb-2 heading-serif text-2xl">Asistente Tributario Colombia</h2>
                  <p className="mb-3 flex items-center justify-center gap-1.5 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Consulta los 1,294 artículos indexados
                  </p>
                  <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                    {UI_COPY.chat.onboarding}
                  </p>
                </div>
                <div className="w-full max-w-2xl">
                  <SuggestedQuestions
                    onSelect={handleQuestionSelect}
                    questions={contextualQuestions}
                    title="Preguntas sugeridas para esta página"
                  />
                </div>
              </div>
            ) : (
              <MessageList
                messages={messages}
                sources={sources}
                isLoading={isLoading}
                conversationId={selectedConversationId}
                onAskAgain={(text) =>
                  sendMessage({ text: `Responde de nuevo con otro enfoque profesional:\n\n${text}` })
                }
                onDeepen={(text) =>
                  sendMessage({
                    text: `Profundiza jurídicamente esta respuesta con mayor detalle técnico:\n\n${text}`,
                  })
                }
                onShare={shareResponse}
                onFeedback={(messageId, value) => {
                  setFeedback(selectedConversationId, messageId, value);
                  trackEvent("chat_feedback_submitted", {
                    conversationId: selectedConversationId,
                    messageId,
                    value,
                  });
                }}
                getFeedback={(messageId) =>
                  getFeedback(selectedConversationId, messageId)?.value
                }
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
              onNewConversation={handleNewConversation}
              contextLabel={`Contexto actual: ${pageContext.pathname}`}
            />
          </div>
        </ChatBottomSheet>
      </div>
    </div>
  );
}
