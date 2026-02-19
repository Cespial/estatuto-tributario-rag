"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getFeedbackForMessage,
  readConversations,
  upsertConversation,
  deleteConversation,
  upsertFeedback,
  readFeedback,
} from "@/lib/chat/history-storage";
import { STORAGE_EVENTS } from "@/lib/storage/productivity-storage";
import { ChatConversation } from "@/types/chat-history";

const subscribeConversations = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.chatConversations, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.chatConversations, callback);
  };
};

const subscribeFeedback = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.chatFeedback, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.chatFeedback, callback);
  };
};

export function useChatHistory() {
  const conversations = useSyncExternalStore(subscribeConversations, readConversations, () => []);
  const feedback = useSyncExternalStore(subscribeFeedback, readFeedback, () => []);

  const saveConversation = useCallback((conversation: ChatConversation) => {
    upsertConversation(conversation);
  }, []);

  const removeConversation = useCallback((conversationId: string) => {
    deleteConversation(conversationId);
  }, []);

  const setFeedback = useCallback(
    (conversationId: string, messageId: string, value: "up" | "down") => {
      upsertFeedback({
        conversationId,
        messageId,
        value,
        createdAt: Date.now(),
      });
    },
    []
  );

  const getFeedback = useCallback(
    (conversationId: string, messageId: string) => {
      return (
        feedback.find(
          (item) =>
            item.conversationId === conversationId && item.messageId === messageId
        ) || getFeedbackForMessage(conversationId, messageId)
      );
    },
    [feedback]
  );

  return {
    conversations,
    saveConversation,
    removeConversation,
    setFeedback,
    getFeedback,
  };
}
