"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface TocSection {
  id: string;
  label: string;
}

interface ArticleTocProps {
  sections: TocSection[];
}

export function ArticleToc({ sections }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.2, 0.4, 0.7] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav className="rounded-lg border border-border/60 bg-card p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
        Tabla de contenido
      </p>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={clsx(
                "block rounded px-2 py-1.5 text-sm transition-colors",
                activeId === section.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
