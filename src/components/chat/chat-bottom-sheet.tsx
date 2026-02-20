"use client";

import { ReactNode, useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface ChatBottomSheetProps {
  children: ReactNode;
}

export function ChatBottomSheet({ children }: ChatBottomSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="hidden h-full md:block">{children}</div>

      <div className="md:hidden">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir chat
          </button>
        )}

        {open && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl border border-border bg-background shadow-2xl animate-in slide-in-from-bottom"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-end border-b border-border/50 px-4 py-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(85vh-45px)]">{children}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
