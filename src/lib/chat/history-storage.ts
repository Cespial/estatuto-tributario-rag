"use client";

import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import { ChatConversation, ChatMessageFeedback } from "@/types/chat-history";

const MAX_CONVERSATIONS = 30;
const MAX_MESSAGES_PER_CONVERSATION = 80;

function sanitizeConversation(conversation: ChatConversation): ChatConversation {
  const messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
  return {
    ...conversation,
    title: conversation.title.trim() || "Conversación sin título",
    updatedAt: Date.now(),
    messages,
  };
}

let _conversationsCache: { raw: string; parsed: ChatConversation[] } | null = null;

export function readConversations(): ChatConversation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.chatConversations) ?? "";
  if (_conversationsCache && _conversationsCache.raw === raw) return _conversationsCache.parsed;
  const parsed = readJsonStorage<ChatConversation[]>(STORAGE_KEYS.chatConversations, [])
    .map((conversation) => ({
      ...conversation,
      title: conversation.title || "Conversación sin título",
      messages: Array.isArray(conversation.messages) ? conversation.messages : [],
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  _conversationsCache = { raw, parsed };
  return parsed;
}

export function writeConversations(conversations: ChatConversation[]): void {
  _conversationsCache = null;
  const cleaned = conversations
    .map(sanitizeConversation)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS);
  writeJsonStorage(STORAGE_KEYS.chatConversations, cleaned);
  dispatchStorageEvent(STORAGE_EVENTS.chatConversations);
}

export function upsertConversation(conversation: ChatConversation): void {
  const current = readConversations();
  const next = current.filter((c) => c.id !== conversation.id);
  writeConversations([{ ...sanitizeConversation(conversation) }, ...next]);
}

export function deleteConversation(conversationId: string): void {
  const current = readConversations();
  writeConversations(current.filter((c) => c.id !== conversationId));
}

export function getConversation(conversationId: string): ChatConversation | undefined {
  return readConversations().find((c) => c.id === conversationId);
}

let _feedbackCache: { raw: string; parsed: ChatMessageFeedback[] } | null = null;

export function readFeedback(): ChatMessageFeedback[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.chatFeedback) ?? "";
  if (_feedbackCache && _feedbackCache.raw === raw) return _feedbackCache.parsed;
  const parsed = readJsonStorage<ChatMessageFeedback[]>(STORAGE_KEYS.chatFeedback, []);
  _feedbackCache = { raw, parsed };
  return parsed;
}

export function upsertFeedback(nextFeedback: ChatMessageFeedback): void {
  const current = readFeedback();
  const next = current.filter(
    (f) =>
      !(
        f.conversationId === nextFeedback.conversationId &&
        f.messageId === nextFeedback.messageId
      )
  );
  next.push(nextFeedback);
  _feedbackCache = null;
  writeJsonStorage(STORAGE_KEYS.chatFeedback, next);
  dispatchStorageEvent(STORAGE_EVENTS.chatFeedback);
}

export function getFeedbackForMessage(
  conversationId: string,
  messageId: string
): ChatMessageFeedback | undefined {
  return readFeedback().find(
    (feedback) =>
      feedback.conversationId === conversationId && feedback.messageId === messageId
  );
}
