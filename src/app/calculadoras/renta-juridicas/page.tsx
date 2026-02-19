"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, AlertTriangle, Info } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { PJ_RATES, SOBRETASA_FINANCIERO_THRESHOLD_UVT, SOBRETASA_FINANCIERO_RATE, TTD_MIN_RATE } from "@/config/tax-data-corporativo";
import { CurrencyInput, SelectInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

export default function RentaJuridicasPage() {
  const [rentaLiquida, setRentaLiquida] = useState(0);
  const [utilidadDepurada, setUtilidadDepurada] = useState(0);
  const [sector, setSector] = useState("general");

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const result = useMemo(() => {
    const selectedRate = PJ_RATES.find((r) => r.sector === sector) || PJ_RATES[0];
    const rentaUVT = rentaLiquida / uvt;

    const impuestoBase = rentaLiquida * selectedRate.rate;

    let sobretasa = 0;
    if (sector === "financiero" && rentaUVT > SOBRETASA_FINANCIERO_THRESHOLD_UVT) {
      const baseExcedente = rentaLiquida - (SOBRETASA_FINANCIERO_THRESHOLD_UVT * uvt);
      sobretasa = baseExcedente * SOBRETASA_FINANCIERO_RATE;
    }

    const totalImpuesto = impuestoBase + sobretasa;
    const tasaEfectiva = rentaLiquida > 0 ? totalImpuesto / rentaLiquida : 0;

    // Calculo TTD (Art. 240 Par. 6)
    const ttdReal = utilidadDepurada > 0 ? totalImpuesto / utilidadDepurada : 1;
    const requiereAjusteTTD = utilidadDepurada > 0 && ttdReal < TTD_MIN_RATE;
    const impuestoAjustadoTTD = requiereAjusteTTD ? utilidadDepurada * TTD_MIN_RATE : totalImpuesto;

    return {
      rentaLiquida,
      rentaUVT,
      selectedRate,
      impuestoBase,
      sobretasa,
      totalImpuesto,
      tasaEfectiva,
      ttdReal,
      requiereAjusteTTD,
      impuestoAjustadoTTD,
    };
  }, [rentaLiquida, utilidadDepurada, sector, uvt]);

  const resultItems = [
    { label: "Impuesto Neto", value: formatCOP(result.impuestoAjustadoTTD), sublabel: result.requiereAjusteTTD ? "Ajustado por TTD (15%)" : "Calculo normal" },
    { label: "Tarifa aplicada", value: `${(result.selectedRate.rate * 100).toFixed(0)}%` },
    { label: "Tasa Efectiva", value: (result.tasaEfectiva * 100).toFixed(2) + "%" },
    { label: "TTD Real", value: (result.ttdReal * 100).toFixed(2) + "%", sublabel: result.requiereAjusteTTD ? "Menor al 15% minimo" : "Cumple minimo" },
  ];

  return (
    <>
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Renta Personas Juridicas 2026</h1>
      <p className="mb-10 text-sm text-muted-foreground">Incluye medidas de emergencia del Decreto 1474 de 2025 y TTD del 15%.</p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <CurrencyInput id="renta-liquida" label="Renta liquida gravable" value={rentaLiquida} onChange={setRentaLiquida} />
          <CurrencyInput id="utilidad-depurada" label="Utilidad Depurada (Para TTD)" value={utilidadDepurada} onChange={setUtilidadDepurada} />
        </div>
        <div className="space-y-4">
          <SelectInput
            id="sector-economico"
            label="Sector economico"
            value={sector}
            onChange={setSector}
            options={PJ_RATES.map((r) => ({ value: r.sector, label: r.label }))}
          />
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border/60 p-4 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <p>La Utilidad Depurada se usa para calcular la Tasa de Tributacion Depurada (TTD). Segun Art. 240, esta no puede ser inferior al 15%.</p>
          </div>
        </div>
      </div>

      {result.requiereAjusteTTD && (
        <div className="mb-6 text-foreground bg-muted/50 border border-border/60 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <div className="text-sm">
            <strong>Alerta TTD:</strong> El impuesto calculado es menor al 15% de la utilidad depurada. Se ha ajustado el impuesto a {formatCOP(result.impuestoAjustadoTTD)}.
          </div>
        </div>
      )}

      <div className="mb-6">
        <CalculatorResult items={resultItems} />
      </div>

      <div className="mb-6">
        <CollapsibleSection title="Detalles del Impuesto y Sobretasas">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border py-1">
              <span>Impuesto sobre renta liquida ({(result.selectedRate.rate * 100).toFixed(0)}%)</span>
              <span>{formatCOP(result.impuestoBase)}</span>
            </div>
            {result.sobretasa > 0 && (
              <div className="flex justify-between border-b border-border py-1 text-muted-foreground">
                <span>Sobretasa financiera (15%)</span>
                <span>{formatCOP(result.sobretasa)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 font-bold">
              <span>Total Impuesto Determinado</span>
              <span>{formatCOP(result.totalImpuesto)}</span>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <div className="mb-6">
        <CollapsibleSection title="Tabla de tarifas 2026 (Dto 1474)" defaultOpen>
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                  <th className="px-4 py-2 text-left">Sector</th>
                  <th className="px-4 py-2 text-right">Tarifa Total</th>
                  <th className="px-4 py-2 text-left">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {PJ_RATES.map((r) => (
                  <tr key={r.sector} className={`border-b border-border last:border-0 ${r.sector === sector ? "bg-muted font-semibold" : ""}`}>
                    <td className="px-4 py-2">{r.label}</td>
                    <td className="px-4 py-2 text-right">{(r.rate * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2">{r.article}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      </div>

      <CalculatorSources articles={["240", "240-1"]} />
    </>
  );
}
