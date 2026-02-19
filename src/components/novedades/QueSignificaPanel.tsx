"use client";

import { Lightbulb, TriangleAlert } from "lucide-react";

interface QueSignificaPanelProps {
  resumen: string;
  accion: string;
}

export function QueSignificaPanel({ resumen, accion }: QueSignificaPanelProps) {
  return (
    <div className="mt-3 grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3">
      <div>
        <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" />
          Qué significa para ti
        </p>
        <p className="text-sm text-foreground">{resumen}</p>
      </div>
      <div className="rounded border border-border/60 bg-card p-2.5">
        <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          <TriangleAlert className="h-3.5 w-3.5" />
          Qué hacer hoy
        </p>
        <p className="text-sm text-foreground">{accion}</p>
      </div>
    </div>
  );
}

