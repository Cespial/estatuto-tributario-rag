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

export function readConversations(): ChatConversation[] {
  return readJsonStorage<ChatConversation[]>(STORAGE_KEYS.chatConversations, [])
    .map((conversation) => ({
      ...conversation,
      title: conversation.title || "Conversación sin título",
      messages: Array.isArray(conversation.messages) ? conversation.messages : [],
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function writeConversations(conversations: ChatConversation[]): void {
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

export function readFeedback(): ChatMessageFeedback[] {
  return readJsonStorage<ChatMessageFeedback[]>(STORAGE_KEYS.chatFeedback, []);
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
