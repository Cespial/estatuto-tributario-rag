"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ArticlePanelState {
  isOpen: boolean;
  slug: string | null;
  openPanel: (slug: string) => void;
  closePanel: () => void;
}

const ArticlePanelContext = createContext<ArticlePanelState | null>(null);

export function ArticlePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  const openPanel = useCallback((s: string) => {
    setSlug(s);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setSlug(null), 300); // Wait for transition
  }, []);

  return (
    <ArticlePanelContext.Provider value={{ isOpen, slug, openPanel, closePanel }}>
      {children}
    </ArticlePanelContext.Provider>
  );
}

export function useArticlePanel() {
  const ctx = useContext(ArticlePanelContext);
  if (!ctx) throw new Error("useArticlePanel must be used within ArticlePanelProvider");
  return ctx;
}
