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
}

export function ReferencePageLayout({
  title,
  description,
  icon: Icon,
  children,
  rightContent,
}: ReferencePageLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl p-6 animate-in fade-in duration-500">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Inicio
      </Link>

      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="h-8 w-8" />
            </div>
            {title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
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
