"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Table, ExternalLink } from "lucide-react";
import { RETENCION_CONCEPTOS_COMPLETOS } from "@/config/retencion-tabla-data";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { QuickCalculator } from "@/components/retention/QuickCalculator";

export default function RetencionPage() {
  const [search, setSearch] = useState("");
  const uvtValue = UVT_VALUES[CURRENT_UVT_YEAR];

  const filteredConcepts = useMemo(() => {
    return RETENCION_CONCEPTOS_COMPLETOS.filter((c) => 
      c.concepto.toLowerCase().includes(search.toLowerCase()) ||
      c.articulo.toLowerCase().includes(search.toLowerCase()) ||
      (c.tarifa * 100).toString().includes(search)
    );
  }, [search]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <ReferencePageLayout
      title="Tabla de Retención 2026"
      description="Conceptos, bases y tarifas vigentes para el año gravable 2026."
      icon={Table}
      rightContent={
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Valor UVT {CURRENT_UVT_YEAR}</div>
          <div className="text-2xl font-semibold text-foreground">{formatCurrency(uvtValue)}</div>
        </div>
      }
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar concepto, artículo o tarifa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-sm"
        />
      </div>

      <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Concepto</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-center">Base Min (UVT)</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">Base Min ($)</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-center">Tarifa</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-center">Artículo</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Notas</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-center">Calculadora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredConcepts.length > 0 ? (
                filteredConcepts.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.concepto}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.baseMinUVT > 0 ? item.baseMinUVT : "0"}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {item.baseMinUVT > 0 ? formatCurrency(item.baseMinUVT * uvtValue) : "$ 0"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">
                      {(item.tarifa * 100).toFixed(item.tarifa < 0.01 ? 1 : 1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link 
                        href={`/articulo/${item.articulo}`}
                        className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:underline bg-muted px-2 py-0.5 rounded-full"
                      >
                        {item.articulo}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate" title={item.notas}>
                      {item.notas || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <QuickCalculator 
                        concepto={item.concepto}
                        tarifa={item.tarifa}
                        baseMinUVT={item.baseMinUVT}
                        uvtValue={uvtValue}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>No se encontraron conceptos con la búsqueda actual.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border/40 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p><strong>Nota:</strong> Las tarifas aquí expresadas son las generales. Algunos contribuyentes pueden estar sujetos a tarifas diferenciales o convenios para evitar la doble imposición.</p>
      </div>
    </ReferencePageLayout>
  );
}
