"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ExternalLink, Hash, ChevronRight } from "lucide-react";
import { GLOSARIO } from "@/config/glosario-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { clsx } from "clsx";

export default function GlosarioPage() {
  const [search, setSearch] = useState("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredGlosario = search
    ? [...GLOSARIO.filter((term) => {
        const lowerSearch = search.toLowerCase();
        return term.termino.toLowerCase().includes(lowerSearch) ||
          term.definicion.toLowerCase().includes(lowerSearch) ||
          term.relacionados?.some(r => r.toLowerCase().includes(lowerSearch));
      })].sort((a, b) => a.termino.localeCompare(b.termino))
    : [...GLOSARIO].sort((a, b) => a.termino.localeCompare(b.termino));

  const groupedGlosario = (() => {
    const groups: Record<string, typeof GLOSARIO> = {};
    filteredGlosario.forEach((term) => {
      const firstLetter = term.termino[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(term);
    });
    return groups;
  })();

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Highlighting helper
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-foreground/10 dark:bg-foreground/20 text-foreground rounded px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <ReferencePageLayout
      title="Glosario Tributario"
      description="Definiciones y conceptos clave del sistema tributario colombiano."
      icon={BookOpen}
    >
      {/* A-Z Quick Nav */}
      <div className="sticky top-0 z-10 -mx-6 bg-background/95 px-6 py-4 backdrop-blur shadow-sm border-b border-border mb-8">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mb-4">
          {alphabet.map((letter) => {
            const hasItems = groupedGlosario[letter];
            return (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                disabled={!hasItems}
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all",
                  hasItems
                    ? "bg-muted hover:bg-foreground hover:text-background cursor-pointer shadow-sm"
                    : "text-muted-foreground/20 cursor-not-allowed"
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar término, definición o relacionado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-card py-3 pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(groupedGlosario).sort().map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-40">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl font-black text-foreground/70">
                {letter}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {groupedGlosario[letter].map((term, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-border">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-foreground transition-colors flex items-center justify-between">
                      <HighlightText text={term.termino} highlight={search} />
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-foreground/70" />
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    <HighlightText text={term.definicion} highlight={search} />
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                    {term.articulos && term.articulos.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex gap-2">
                          {term.articulos.map(art => (
                            <Link 
                              key={art} 
                              href={`/articulo/${art}`}
                              className="text-xs font-medium text-foreground/70 hover:underline flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded"
                            >
                              Art. {art}
                              <ExternalLink className="h-2 w-2 opacity-50" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {term.relacionados && term.relacionados.length > 0 && (
                      <div className="flex items-center gap-2 w-full mt-2 sm:mt-0 sm:w-auto">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ver:</span>
                        <div className="flex flex-wrap gap-1">
                          {term.relacionados.map(rel => (
                            <button
                              key={rel}
                              onClick={() => { setSearch(rel); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className="text-[10px] bg-muted px-2 py-0.5 rounded-full hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                            >
                              {rel}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedGlosario).length === 0 && (
          <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border border-dashed">
            <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No se encontraron términos</p>
            <p className="text-sm">Intente con otra búsqueda o revise la ortografía.</p>
            <button 
              onClick={() => setSearch("")}
              className="mt-4 text-sm text-foreground hover:underline font-medium"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      <div className="mt-20 border-t border-border pt-8 text-center">
        <button 
          onClick={() => { setSearch(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <ChevronRight className="h-4 w-4 -rotate-90" />
          </div>
          Volver arriba
        </button>
      </div>
    </ReferencePageLayout>
  );
}
