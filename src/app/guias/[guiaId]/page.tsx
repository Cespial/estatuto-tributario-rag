"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Undo2
} from "lucide-react";
import { GUIAS_EDUCATIVAS } from "@/config/guias-data";
import { Header } from "@/components/layout/header";
import { clsx } from "clsx";

export default function GuiaInteractivaPage() {
  const { guiaId } = useParams();
  const guia = useMemo(() => GUIAS_EDUCATIVAS.find(g => g.id === guiaId), [guiaId]);

  const [currentNodeId, setCurrentNodeId] = useState(guia?.nodoInicial || "");
  const [history, setHistory] = useState<string[]>([]);

  if (!guia) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">Guía no encontrada</h1>
          <p className="mt-2 text-muted-foreground">La guía que buscas no existe o fue removida.</p>
          <Link href="/guias" className="mt-4 inline-block text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground">Volver al índice de guías</Link>
        </div>
      </div>
    );
  }

  const currentNode = guia.nodos.find(n => n.id === currentNodeId);

  const handleOptionSelect = (nextNodeId: string) => {
    setHistory(prev => [...prev, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentNodeId(prevId);
    }
  };

  const handleReset = () => {
    setCurrentNodeId(guia.nodoInicial);
    setHistory([]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/guias" className="mb-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a guías
      </Link>

      <div className="mb-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">{guia.titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{guia.descripcion}</p>

        {/* Progress breadcrumb */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className={clsx("h-2 w-12 rounded-full", history.length >= 0 ? "bg-foreground" : "bg-muted")} />
          {history.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              <div className="h-2 w-12 rounded-full bg-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-8 shadow-sm">
        {currentNode?.tipo === "pregunta" ? (
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-muted p-2 text-foreground/70">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold leading-tight">{currentNode.texto}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {currentNode.opciones?.map((opcion, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(opcion.nextNodeId)}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:shadow-sm active:scale-95"
                >
                  <span className="font-semibold">{opcion.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground/70 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-muted p-2 text-foreground">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-foreground leading-tight">
                  {currentNode?.texto}
                </h2>
                {currentNode?.recomendacion && (
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    {currentNode.recomendacion}
                  </p>
                )}
              </div>
            </div>

            {currentNode?.enlaces && (
              <div className="grid gap-3 sm:grid-cols-2">
                {currentNode.enlaces.map((enlace, i) => (
                  <Link
                    key={i}
                    href={enlace.href}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:shadow-sm"
                  >
                    {enlace.label}
                    <ExternalLink className="h-4 w-4 text-foreground/70" />
                  </Link>
                ))}
              </div>
            )}

            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-4 font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar autodiagnóstico
            </button>
          </div>
        )}

        <div className="mt-10 flex justify-between pt-6">
          <button
            onClick={handleBack}
            disabled={history.length === 0}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
            Volver atrás
          </button>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
            Paso {history.length + 1}
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
