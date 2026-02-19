"use client";

import { useMemo, useState } from "react";
import { Search, Table, Download } from "lucide-react";
import { RETENCION_CONCEPTOS_COMPLETOS } from "@/config/retencion-tabla-data";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { RetentionTable } from "@/components/retention/retention-table";
import { RetentionConceptWizard } from "@/components/retention/retention-concept-wizard";
import {
  exportRetencionConceptsToCsv,
  exportRetencionConceptsToExcelCompatible,
} from "@/lib/export/retencion-export";
import { UI_COPY } from "@/config/ui-copy";

export default function RetencionPage() {
  const [search, setSearch] = useState("");
  const [selectedConceptId, setSelectedConceptId] = useState<string | undefined>();
  const uvtValue = UVT_VALUES[CURRENT_UVT_YEAR];

  const filteredConcepts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return RETENCION_CONCEPTOS_COMPLETOS;
    return RETENCION_CONCEPTOS_COMPLETOS.filter(
      (concept) =>
        concept.concepto.toLowerCase().includes(q) ||
        concept.articulo.toLowerCase().includes(q) ||
        (concept.notas || "").toLowerCase().includes(q) ||
        (concept.keywords || []).some((keyword) => keyword.toLowerCase().includes(q)) ||
        (concept.tarifa * 100).toFixed(2).includes(q)
    );
  }, [search]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <ReferencePageLayout
      title="Tabla de Retención 2026"
      description="Conceptos, bases, tarifas y guía contextual para aplicar la retención en la fuente."
      icon={Table}
      rightContent={
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">Valor UVT {CURRENT_UVT_YEAR}</div>
            <div className="text-2xl font-semibold text-foreground">{formatCurrency(uvtValue)}</div>
          </div>
          <button
            onClick={() => exportRetencionConceptsToCsv(filteredConcepts, uvtValue)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => exportRetencionConceptsToExcelCompatible(filteredConcepts, uvtValue)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>
      }
    >
      <RetentionConceptWizard
        conceptos={RETENCION_CONCEPTOS_COMPLETOS}
        onSelectConcept={(concept) => {
          setSelectedConceptId(concept.id);
          setSearch(concept.concepto);
          setTimeout(() => {
            document.getElementById(`concepto-${concept.id}`)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 50);
        }}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar concepto, artículo, nota o palabra clave..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-sm"
        />
      </div>

      <RetentionTable
        concepts={filteredConcepts}
        uvtValue={uvtValue}
        selectedId={selectedConceptId}
      />

      <div className="rounded-lg border border-border/40 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          <strong>{UI_COPY.retencion.resultTitle}</strong> Las tarifas aquí expresadas son de referencia general.
          Revise condiciones especiales, convenios para evitar doble imposición y normas reglamentarias aplicables.
        </p>
      </div>
    </ReferencePageLayout>
  );
}
