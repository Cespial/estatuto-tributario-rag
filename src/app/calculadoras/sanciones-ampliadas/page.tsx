"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { UVT_VALUES, CURRENT_UVT_YEAR } from "@/config/tax-data";
import { SANCION_MINIMA_UVT, SANCION_NO_DECLARAR, SANCION_CORRECCION, SANCION_INEXACTITUD, SANCION_EXTEMPORANEIDAD } from "@/config/tax-data-corporativo";
import { CurrencyInput, SelectInput, ToggleInput, NumberInput } from "@/components/calculators/shared-inputs";
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
    <div className="rounded-lg border border-border">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

export default function SancionesAmpliadasPage() {
  const [tipoSancion, setTipoSancion] = useState("extemporaneidad");
  const [tipoImpuesto, setTipoImpuesto] = useState("renta");
  const [ingresosBrutos, setIngresosBrutos] = useState(0);
  const [consignaciones, setConsignaciones] = useState(0);
  const [impuestoCargo, setImpuestoCargo] = useState(0);
  const [mesesRetraso, setMesesRetraso] = useState(0);
  const [impuestoInicial, setImpuestoInicial] = useState(0);
  const [impuestoCorregido, setImpuestoCorregido] = useState(0);
  const [impuestoDeclarado, setImpuestoDeclarado] = useState(0);
  const [impuestoCorrecto, setImpuestoCorrecto] = useState(0);
  const [esVoluntaria, setEsVoluntaria] = useState(true);
  const [esFraude, setEsFraude] = useState(false);
  const [aplicaReduccion640, setAplicaReduccion640] = useState(false);

  const uvt = UVT_VALUES[CURRENT_UVT_YEAR];
  const sancionMinima = SANCION_MINIMA_UVT * uvt;

  const result = useMemo(() => {
    let sancionBase = 0;
    let baseCalculoLabel = "";
    let baseCalculoValue = 0;

    if (tipoSancion === "extemporaneidad") {
      if (impuestoCargo > 0) {
        sancionBase = impuestoCargo * SANCION_EXTEMPORANEIDAD.por_impuesto * mesesRetraso;
        // Limite 100% del impuesto
        sancionBase = Math.min(sancionBase, impuestoCargo * SANCION_EXTEMPORANEIDAD.limite_impuesto);
        baseCalculoLabel = "Impuesto a cargo (5% mes)";
        baseCalculoValue = impuestoCargo;
      } else {
        sancionBase = ingresosBrutos * SANCION_EXTEMPORANEIDAD.por_ingresos * mesesRetraso;
        // Limite 5% de ingresos
        sancionBase = Math.min(sancionBase, ingresosBrutos * SANCION_EXTEMPORANEIDAD.limite_ingresos);
        baseCalculoLabel = "Ingresos brutos (0.5% mes)";
        baseCalculoValue = ingresosBrutos;
      }
    } else if (tipoSancion === "no_declarar") {
      if (tipoImpuesto === "renta") {
        const porIngresos = ingresosBrutos * SANCION_NO_DECLARAR.renta_ingresos;
        const porConsignaciones = consignaciones * SANCION_NO_DECLARAR.renta_consignaciones;
        sancionBase = Math.max(porIngresos, porConsignaciones);
        baseCalculoLabel = porIngresos > porConsignaciones ? "Ingresos brutos" : "Consignaciones";
        baseCalculoValue = porIngresos > porConsignaciones ? ingresosBrutos : consignaciones;
      } else if (tipoImpuesto === "iva") {
        const porIngresos = ingresosBrutos * SANCION_NO_DECLARAR.iva_ingresos;
        const porConsignaciones = consignaciones * SANCION_NO_DECLARAR.iva_ingresos;
        sancionBase = Math.max(porIngresos, porConsignaciones);
        baseCalculoLabel = porIngresos > porConsignaciones ? "Ingresos brutos" : "Consignaciones";
        baseCalculoValue = porIngresos > porConsignaciones ? ingresosBrutos : consignaciones;
      } else if (tipoImpuesto === "retefuente") {
        sancionBase = consignaciones * SANCION_NO_DECLARAR.retefuente;
        baseCalculoLabel = "Consignaciones";
        baseCalculoValue = consignaciones;
      }
    } else if (tipoSancion === "correccion") {
      const mayorValor = Math.max(0, impuestoCorregido - impuestoInicial);
      const rate = esVoluntaria ? SANCION_CORRECCION.voluntaria : SANCION_CORRECCION.post_emplazamiento;
      sancionBase = mayorValor * rate;
      baseCalculoLabel = "Mayor valor a pagar";
      baseCalculoValue = mayorValor;
    } else if (tipoSancion === "inexactitud") {
      const diferencia = Math.max(0, impuestoCorrecto - impuestoDeclarado);
      const rate = esFraude ? SANCION_INEXACTITUD.fraude : SANCION_INEXACTITUD.general;
      sancionBase = diferencia * rate;
      baseCalculoLabel = "Diferencia de impuesto";
      baseCalculoValue = diferencia;
    }

    const sancionAntesDeReduccion = Math.max(sancionBase, sancionMinima);
    const sancionFinal = aplicaReduccion640 ? Math.max(sancionAntesDeReduccion * 0.5, sancionMinima) : sancionAntesDeReduccion;

    return {
      sancionBase,
      baseCalculoLabel,
      baseCalculoValue,
      sancionAntesDeReduccion,
      sancionFinal,
    };
  }, [tipoSancion, tipoImpuesto, ingresosBrutos, consignaciones, impuestoCargo, mesesRetraso, impuestoInicial, impuestoCorregido, impuestoDeclarado, impuestoCorrecto, esVoluntaria, esFraude, aplicaReduccion640, sancionMinima]);

  const resultItems = [
    { label: "Sancion calculada", value: formatCOP(result.sancionBase) },
    { label: "Sancion minima 2026", value: formatCOP(sancionMinima), sublabel: "10 UVT ($52,374)" },
    { label: "Total a pagar", value: formatCOP(result.sancionFinal) },
  ];

  return (
    <>
      <Link href="/calculadoras" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Sanciones Tributarias Ampliadas</h1>
      <p className="mb-6 text-sm text-muted-foreground">Calculos actualizados al Estatuto Tributario y UVT 2026.</p>

      <div className="mb-6 space-y-4">
        <SelectInput
          id="tipo-sancion"
          label="Concepto de la sancion"
          value={tipoSancion}
          onChange={setTipoSancion}
          options={[
            { value: "extemporaneidad", label: "Extemporaneidad (Art. 641)" },
            { value: "no_declarar", label: "No declarar (Art. 643)" },
            { value: "correccion", label: "Correccion (Art. 644)" },
            { value: "inexactitud", label: "Inexactitud (Art. 647)" },
          ]}
        />

        {tipoSancion === "extemporaneidad" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CurrencyInput id="impuesto-cargo" label="Impuesto a cargo" value={impuestoCargo} onChange={setImpuestoCargo} />
            <CurrencyInput id="ingresos-ext" label="Ingresos brutos periodo" value={ingresosBrutos} onChange={setIngresosBrutos} />
            <NumberInput id="meses-retraso" label="Meses o fraccion retraso" value={mesesRetraso} onChange={setMesesRetraso} min={0} />
          </div>
        )}

        {tipoSancion === "no_declarar" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInput
              id="tipo-impuesto"
              label="Tipo de impuesto"
              value={tipoImpuesto}
              onChange={setTipoImpuesto}
              options={[
                { value: "renta", label: "Renta" },
                { value: "iva", label: "IVA" },
                { value: "retefuente", label: "Retefuente" },
              ]}
            />
            <CurrencyInput id="ingresos-brutos" label="Ingresos brutos del periodo" value={ingresosBrutos} onChange={setIngresosBrutos} />
            <CurrencyInput id="consignaciones" label="Consignaciones bancarias" value={consignaciones} onChange={setConsignaciones} />
          </div>
        )}

        {tipoSancion === "correccion" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CurrencyInput id="impuesto-inicial" label="Impuesto declaracion inicial" value={impuestoInicial} onChange={setImpuestoInicial} />
            <CurrencyInput id="impuesto-corregido" label="Impuesto declaracion corregida" value={impuestoCorregido} onChange={setImpuestoCorregido} />
            <div className="sm:col-span-2">
              <ToggleInput label="Es voluntaria (antes de emplazamiento)" pressed={esVoluntaria} onToggle={setEsVoluntaria} />
            </div>
          </div>
        )}

        {tipoSancion === "inexactitud" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CurrencyInput id="impuesto-declarado" label="Impuesto declarado" value={impuestoDeclarado} onChange={setImpuestoDeclarado} />
            <CurrencyInput id="impuesto-correcto" label="Impuesto correcto (DIAN)" value={impuestoCorrecto} onChange={setImpuestoCorrecto} />
            <div className="sm:col-span-2">
              <ToggleInput label="Es fraude o evasion" pressed={esFraude} onToggle={setEsFraude} />
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border p-4">
          <ToggleInput label="Aplica reduccion Art. 640 (50%)" pressed={aplicaReduccion640} onToggle={setAplicaReduccion640} />
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Requisito:</strong> No haber cometido la misma infraccion en los 2 años anteriores. La sancion resultante no puede ser menor a la minima ({formatCOP(sancionMinima)}).
          </p>
        </div>
      </div>

      <div className="mb-6">
        <CalculatorResult items={resultItems} />
      </div>

      <div className="mb-6">
        <CollapsibleSection title="Detalles del calculo" defaultOpen>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border py-1">
              <span>Base: {result.baseCalculoLabel}</span>
              <span>{formatCOP(result.baseCalculoValue)}</span>
            </div>
            {tipoSancion === "extemporaneidad" && (
              <div className="flex justify-between border-b border-border py-1">
                <span>Meses de retraso</span>
                <span>{mesesRetraso}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-border py-1">
              <span>Sancion nominal</span>
              <span>{formatCOP(result.sancionBase)}</span>
            </div>
            {aplicaReduccion640 && (
              <div className="flex justify-between border-b border-border py-1 text-green-600">
                <span>Reduccion Art. 640 (50%)</span>
                <span>-{formatCOP(result.sancionAntesDeReduccion * 0.5)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 font-bold">
              <span>Sancion Final</span>
              <span>{formatCOP(result.sancionFinal)}</span>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <CalculatorSources articles={["641", "643", "644", "647", "639", "640"]} />
    </>
  );
}
