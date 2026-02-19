"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BarChart3, Copy, Check, ExternalLink } from "lucide-react";
import { INDICADORES_2026 } from "@/config/indicadores-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { UvtHistoryChart } from "@/components/indicators/TaxCharts";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title="Copiar valor"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copiar</span>
        </>
      )}
    </button>
  );
}

export default function IndicadoresPage() {
  const [search, setSearch] = useState("");

  const filteredIndicadores = useMemo(() => {
    if (!search) return INDICADORES_2026;
    
    return INDICADORES_2026.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.valor.toLowerCase().includes(search.toLowerCase()) ||
        (item.notas && item.notas.toLowerCase().includes(search.toLowerCase()))
      )
    })).filter(cat => cat.items.length > 0);
  }, [search]);

  return (
    <ReferencePageLayout
      title="Indicadores 2026"
      description="Principales valores, topes y tarifas vigentes para el año gravable 2026."
      icon={BarChart3}
    >
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar indicador, valor o concepto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-card py-3 pl-4 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-sm"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredIndicadores.length > 0 ? (
              filteredIndicadores.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-bold border-b border-border pb-2 text-foreground font-[family-name:var(--font-playfair)] flex items-center gap-2">
                    {cat.categoria}
                  </h2>
                  <div className="grid gap-4">
                    {cat.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx} 
                        className="group relative"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                {item.nombre}
                              </span>
                              {item.articulo && (
                                <Link 
                                  href={`/articulo/${item.articulo}`}
                                  className="inline-flex items-center gap-0.5 text-[10px] text-foreground/70 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Art. {item.articulo}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                            </div>
                            <div className="mt-1 flex items-baseline justify-between">
                              <div className="text-xl font-bold tracking-tight text-foreground">
                                {item.valor}
                              </div>
                              <CopyButton value={item.valorNumerico?.toString() || item.valor} />
                            </div>
                            {item.notas && (
                              <p className="mt-1 text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                                {item.notas}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                No se encontraron indicadores que coincidan con su búsqueda.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <UvtHistoryChart />
          
          <div className="rounded-lg border border-border/60 bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground mb-2">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tablas/retencion" className="flex items-center gap-2 hover:underline">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                  Tabla de Retención
                </Link>
              </li>
              <li>
                <Link href="/calendario" className="flex items-center gap-2 hover:underline">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                  Calendario Tributario
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-muted-foreground border-t border-border pt-8">
        <p>Última actualización: Febrero 2026. Estos valores están sujetos a cambios legislativos o reglamentarios.</p>
      </div>
    </ReferencePageLayout>
  );
}
