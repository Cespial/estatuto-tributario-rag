"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ReferencePageLayoutProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  updatedAt?: string;
}

export function ReferencePageLayout({
  title,
  description,
  icon: Icon,
  children,
  rightContent,
  updatedAt,
}: ReferencePageLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 animate-in fade-in duration-500">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Inicio
      </Link>

      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-border/60">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex items-center gap-3 heading-serif text-2xl sm:text-3xl text-foreground">
              <div className="rounded-lg bg-muted p-2.5 text-foreground/70">
                <Icon className="h-7 w-7" />
              </div>
              {title}
            </h1>
            {updatedAt && (
              <span className="inline-flex items-center rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40">
                Actualizado al {updatedAt}
              </span>
            )}
          </div>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-2xl">
            {description}
          </p>
        </div>
        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>

      <main className="space-y-8">
        {children}
      </main>
    </div>
  );
}
