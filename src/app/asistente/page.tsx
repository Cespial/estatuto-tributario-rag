import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ChatContainer } from "@/components/chat/chat-container";
import { ChatSkeleton } from "@/components/landing/chat-skeleton";

export default function AsistentePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<ChatSkeleton />}>
          <ChatContainer />
        </Suspense>
      </main>
    </div>
  );
}
