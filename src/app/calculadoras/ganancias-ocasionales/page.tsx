"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { 
  GANANCIA_OCASIONAL_RATE, 
  VIVIENDA_EXENCION_UVT, 
  REAJUSTE_FISCAL_2025 
} from "@/config/tax-data-ganancias";
import { CurrencyInput, SelectInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

const ASSET_TYPES = [
  { value: "inmueble_vivienda", label: "Inmueble (Vivienda de Habitación)" },
  { value: "inmueble_otro", label: "Inmueble (Otros)" },
  { value: "acciones", label: "Acciones o Participaciones" },
  { value: "otro_activo", label: "Otro Activo Fijo" },
];

const YEARS = Array.from({ length: 2026 - 2010 }, (_, i) => ({
  value: (2010 + i).toString(),
  label: (2010 + i).toString(),
})).reverse();

export default function GananciasOcasionalesPage() {
  const [precioVenta, setPrecioVenta] = useState(0);
  const [costoFiscal, setCostoFiscal] = useState(0);
  const [anoAdquisicion, setAnoAdquisicion] = useState("2024");
  const [tipoActivo, setTipoActivo] = useState("inmueble_vivienda");
  const [posesionMas2Anos, setPosesionMas2Anos] = useState(true);
  const [depositoAFC, setDepositoAFC] = useState(false);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];

  const results = useMemo(() => {
    if (precioVenta <= 0) return null;

    const nAnos = Math.max(0, 2025 - parseInt(anoAdquisicion));
    const costoAjustado = costoFiscal * Math.pow(1 + REAJUSTE_FISCAL_2025, nAnos);
    const gananciaBruta = Math.max(0, precioVenta - costoAjustado);
    
    let exencion = 0;
    if (tipoActivo === "inmueble_vivienda" && depositoAFC) {
      exencion = Math.min(gananciaBruta, VIVIENDA_EXENCION_UVT * uvt);
    }

    const gananciaGravable = Math.max(0, gananciaBruta - exencion);
    const impuesto = gananciaGravable * GANANCIA_OCASIONAL_RATE;

    return {
      costoAjustado,
      gananciaBruta,
      exencion,
      gananciaGravable,
      impuesto,
      ajusteFiscal: costoAjustado - costoFiscal
    };
  }, [precioVenta, costoFiscal, anoAdquisicion, tipoActivo, depositoAFC, uvt]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/calculadoras"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-6 heading-serif text-3xl">Ganancias Ocasionales</h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">
        Calcula el impuesto por la venta de activos fijos poseídos por más de 2 años.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-4 heading-serif text-lg">Datos del Activo</h2>
            <div className="space-y-4">
              <CurrencyInput 
                id="precio-venta" 
                label="Precio de Venta" 
                value={precioVenta} 
                onChange={setPrecioVenta} 
              />
              <CurrencyInput 
                id="costo-fiscal" 
                label="Costo Fiscal de Adquisición" 
                value={costoFiscal} 
                onChange={setCostoFiscal} 
              />
              <SelectInput 
                id="tipo-activo" 
                label="Tipo de Activo" 
                value={tipoActivo} 
                onChange={setTipoActivo}
                options={ASSET_TYPES}
              />
              <div className="grid grid-cols-2 gap-4">
                <SelectInput 
                  id="ano-adquisicion" 
                  label="Año de Adquisición" 
                  value={anoAdquisicion} 
                  onChange={setAnoAdquisicion}
                  options={YEARS}
                />
                <div className="flex flex-col justify-end">
                  <ToggleInput 
                    label="Posesión > 2 años" 
                    pressed={posesionMas2Anos} 
                    onToggle={setPosesionMas2Anos} 
                  />
                </div>
              </div>

              {tipoActivo === "inmueble_vivienda" && (
                <div className="pt-4 border-t border-border">
                  <ToggleInput 
                    label="Dinero invertido en AFC o Crédito Hipotecario" 
                    pressed={depositoAFC} 
                    onToggle={setDepositoAFC} 
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Requisito del Art. 311-1 para acceder a la exención de las primeras 5.000 UVT.
                  </p>
                </div>
              )}
            </div>
          </div>

          {!posesionMas2Anos && (
            <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground">
              <AlertTriangle className="h-5 w-5 shrink-0 text-foreground/70" />
              <p>
                <strong>Atención:</strong> Activos poseídos menos de 2 años tributan como 
                <strong> Renta Ordinaria</strong>.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {results ? (
            <>
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="mb-4 heading-serif text-lg">Resultado del Cálculo</h2>
                <CalculatorResult items={[
                  { label: "Ganancia Bruta", value: formatCOP(results.gananciaBruta) },
                  { 
                    label: "Exención Aplicada", 
                    value: formatCOP(results.exencion), 
                    sublabel: results.exencion > 0 ? "Art. 311-1 (Max 5.000 UVT)" : "No cumple requisitos" 
                  },
                  { label: "Ganancia Gravable", value: formatCOP(results.gananciaGravable) },
                  { label: "Impuesto (15%)", value: formatCOP(results.impuesto) },
                ]} />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Desglose Técnico</h3>
                <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm text-sm">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="px-4 py-3">Precio de Venta</td>
                        <td className="px-4 py-3 text-right">{formatCOP(precioVenta)}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-4 py-3 text-muted-foreground italic">Costo Ajustado (Art. 73)</td>
                        <td className="px-4 py-3 text-right">{formatCOP(results.costoAjustado)}</td>
                      </tr>
                      <tr className="border-b border-border font-medium">
                        <td className="px-4 py-3">Ganancia Bruta</td>
                        <td className="px-4 py-3 text-right">{formatCOP(results.gananciaBruta)}</td>
                      </tr>
                      {tipoActivo === "inmueble_vivienda" && (
                        <tr className="border-b border-border text-muted-foreground">
                          <td className="px-4 py-3">Exención Vivienda</td>
                          <td className="px-4 py-3 text-right">-{formatCOP(results.exencion)}</td>
                        </tr>
                      )}
                      <tr className="bg-muted font-bold">
                        <td className="px-4 py-3">BASE GRAVABLE</td>
                        <td className="px-4 py-3 text-right">{formatCOP(results.gananciaGravable)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>Ingresa los datos para ver el cálculo.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <CalculatorSources articles={["299", "73", "311-1", "313"]} />
      </div>
    </div>
  );
}
