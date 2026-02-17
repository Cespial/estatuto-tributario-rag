"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface NormasSectionProps {
  normasParsed: Record<string, string[]>;
}

const TABS = [
  { key: "jurisprudencia", label: "Jurisprudencia" },
  { key: "decretos", label: "Decretos" },
  { key: "doctrina_dian", label: "Doctrina DIAN" },
  { key: "notas", label: "Notas" },
  { key: "otros", label: "Otros" },
];

export function NormasSection({ normasParsed }: NormasSectionProps) {
  const nonEmptyTabs = TABS.filter(
    (t) => normasParsed[t.key] && normasParsed[t.key].length > 0
  );

  const [activeTab, setActiveTab] = useState(nonEmptyTabs[0]?.key || "");

  if (nonEmptyTabs.length === 0) return null;

  const items = normasParsed[activeTab] || [];

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold">Normas relacionadas</h2>
      {/* Tabs */}
      <div className="mb-3 flex gap-1 overflow-x-auto border-b border-border">
        {nonEmptyTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({normasParsed[tab.key]?.length || 0})
            </span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
