"use client";

import dynamic from "next/dynamic";
import { ChatSkeleton } from "@/components/landing/chat-skeleton";

const DynamicChatContainer = dynamic(
  () => import("@/components/chat/chat-container").then((mod) => mod.ChatContainer),
  {
    ssr: false,
    loading: () => <ChatSkeleton />,
  }
);

export function LazyChatContainer() {
  return <DynamicChatContainer />;
}
