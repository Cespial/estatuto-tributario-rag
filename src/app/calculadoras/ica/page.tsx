"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Plus, Trash2, AlertTriangle, MapPin } from "lucide-react";
import { CurrencyInput, SelectInput, NumberInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";
import { MUNICIPIOS_ICA } from "@/config/ica-data";
import type { MunicipioICA, IngresoActividad } from "@/config/ica-data";
import { calcularICA, validarBalanceICA } from "@/lib/calculadora-ica";
import { clsx } from "clsx";

// ── HELPERS ──

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

/* ── CollapsibleSection ── */
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50"
      >
        {title}
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-muted-foreground transition-transform",
            open ? "rotate-180" : ""
          )}
        />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

function defaultCustomConfig(): MunicipioICA {
  return {
    id: "personalizado",
    nombre: "Personalizado",
    departamento: "N/A",
    tarifas: {
      actividadPrincipal: { codigo: "", descripcion: "", tarifa: 0, tipoActividad: "COMERCIAL" },
      actividadesAdicionales: [],
    },
    avisosYTableros: { aplica: true, porcentaje: 15 },
    sobretasaBomberil: { aplica: false, porcentaje: 0, base: "ICA" },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: false, porcentaje: 0 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
    redondeoAMil: false,
  };
}

export default function ICAPage() {
  // === STATE ===
  const [municipioId, setMunicipioId] = useState("cisneros");
  const [anoGravable, setAnoGravable] = useState("2025");
  const [customConfig, setCustomConfig] = useState<MunicipioICA>(defaultCustomConfig());

  // Balance fields
  const [ingresosTotalesPais, setIngresosTotalesPais] = useState(0);
  const [ingresosFueraMunicipio, setIngresosFueraMunicipio] = useState(0);
  const [devoluciones, setDevoluciones] = useState(0);
  const [exportacionesYActivosFijos, setExportacionesYActivosFijos] = useState(0);
  const [actividadesExcluidasNoSujetas, setActividadesExcluidasNoSujetas] = useState(0);
  const [actividadesExentas, setActividadesExentas] = useState(0);
  const [retencionesPracticadas, setRetencionesPracticadas] = useState(0);
  const [autorretenciones, setAutorretenciones] = useState(0);
  const [anticipoAnterior, setAnticipoAnterior] = useState(0);
  const [saldoFavorAnterior, setSaldoFavorAnterior] = useState(0);

  // Advanced fields
  const [sanciones, setSanciones] = useState(0);
  const [exenciones, setExenciones] = useState(0);
  const [interesesMora, setInteresesMora] = useState(0);

  const [actividades, setActividades] = useState<IngresoActividad[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // === COMPUTED ===
  const isCustom = municipioId === "personalizado";
  const municipio = useMemo(() => {
    return isCustom ? customConfig : MUNICIPIOS_ICA.find((m) => m.id === municipioId) || MUNICIPIOS_ICA[0];
  }, [isCustom, customConfig, municipioId]);

  const balance = useMemo(() => {
    return {
      ingresosTotalesPais,
      ingresosFueraMunicipio,
      devoluciones,
      exportacionesYActivosFijos,
      actividadesExcluidasNoSujetas,
      actividadesExentas,
      ingresosPorActividad: actividades,
      retencionesPracticadas,
      autorretenciones,
      anticipoAnterior,
      saldoFavorAnterior,
      // Potential new fields
      sanciones,
      exenciones,
      interesesMora,
    };
  }, [
    ingresosTotalesPais, ingresosFueraMunicipio, devoluciones,
    exportacionesYActivosFijos, actividadesExcluidasNoSujetas, actividadesExentas,
    actividades, retencionesPracticadas, autorretenciones,
    anticipoAnterior, saldoFavorAnterior, sanciones, exenciones, interesesMora
  ]);

  const { errores, warnings } = useMemo(() => validarBalanceICA(balance), [balance]);

  const resultado = useMemo(() => {
    if (ingresosTotalesPais <= 0 || actividades.length === 0) return null;
    return calcularICA(municipio, balance);
  }, [municipio, balance, ingresosTotalesPais, actividades.length]);

  const ingresosGravablesCalculado = useMemo(() => {
    return ingresosTotalesPais - ingresosFueraMunicipio - devoluciones - exportacionesYActivosFijos - actividadesExcluidasNoSujetas - actividadesExentas;
  }, [ingresosTotalesPais, ingresosFueraMunicipio, devoluciones, exportacionesYActivosFijos, actividadesExcluidasNoSujetas, actividadesExentas]);

  const sumaActividades = useMemo(() => {
    return actividades.reduce((sum, act) => sum + act.ingresos, 0);
  }, [actividades]);

  const coinciden = Math.abs(sumaActividades - ingresosGravablesCalculado) < 1;
  const diff = Math.abs(sumaActividades - ingresosGravablesCalculado);

  // === HANDLERS ===
  const handleMunicipioChange = (id: string) => {
    setMunicipioId(id);
    if (id !== "personalizado") {
      const m = MUNICIPIOS_ICA.find((m) => m.id === id);
      if (m) {
        const defaultActividades: IngresoActividad[] = [
          {
            codigoActividad: m.tarifas.actividadPrincipal.codigo,
            descripcion: m.tarifas.actividadPrincipal.descripcion,
            tarifa: m.tarifas.actividadPrincipal.tarifa,
            ingresos: 0,
          },
          ...m.tarifas.actividadesAdicionales.map((a) => ({
            codigoActividad: a.codigo,
            descripcion: a.descripcion,
            tarifa: a.tarifa,
            ingresos: 0,
          })),
        ];
        setActividades(defaultActividades);
      }
    } else {
      setActividades([]);
    }
  };

  const addActividad = () => {
    setActividades([
      ...actividades,
      { codigoActividad: "", descripcion: "", tarifa: 0, ingresos: 0 },
    ]);
  };

  const removeActividad = (index: number) => {
    setActividades(actividades.filter((_, i) => i !== index));
  };

  const updateActividad = (index: number, field: keyof IngresoActividad, value: string | number) => {
    const newActividades = [...actividades];
    newActividades[index] = { ...newActividades[index], [field]: value };
    setActividades(newActividades);
  };

  // === RENDER HELPERS ===
  const resultItems = useMemo(() => {
    if (!resultado) return [];
    const items = [
      { label: "Total ICA (R20)", value: formatCOP(resultado.renglon20) },
      { label: "Impuesto a cargo (R25)", value: formatCOP(resultado.renglon25), sublabel: "ICA + sobretasas" },
    ];
    if (resultado.renglon34 > 0) {
      items.push({ label: "Saldo a favor (R34)", value: formatCOP(resultado.renglon34) });
    } else {
      items.push({ label: "Total a pagar (R38)", value: formatCOP(resultado.renglon38) });
    }
    return items;
  }, [resultado]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Impuesto ICA (Industria y Comercio)</h1>
        <p className="mb-10 text-muted-foreground">Declaracion privada — Ano Gravable {anoGravable}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="space-y-6">
          {/* Bloque 1: Municipio y ano */}
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight">A. Seleccion</h3>
            <SelectInput
              id="municipio"
              label="Municipio"
              value={municipioId}
              onChange={handleMunicipioChange}
              options={[
                ...MUNICIPIOS_ICA.map((m) => ({ value: m.id, label: `${m.nombre} (${m.departamento})` })),
                { value: "personalizado", label: "Personalizado" },
              ]}
            />
            <SelectInput
              id="ano-gravable"
              label="Ano Gravable"
              value={anoGravable}
              onChange={setAnoGravable}
              options={[
                { value: "2024", label: "2024" },
                { value: "2025", label: "2025" },
                { value: "2026", label: "2026" },
              ]}
            />
          </div>

          {/* Bloque 2: Config personalizada */}
          {isCustom && (
            <div className="rounded-lg border border-dashed border-border/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase">Configuracion personalizada</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <ToggleInput
                  label="Avisos y tableros"
                  pressed={customConfig.avisosYTableros.aplica}
                  onToggle={(v) => setCustomConfig({ ...customConfig, avisosYTableros: { ...customConfig.avisosYTableros, aplica: v } })}
                />
                {customConfig.avisosYTableros.aplica && (
                  <NumberInput
                    id="avisos-pct"
                    label="Porcentaje avisos (%)"
                    value={customConfig.avisosYTableros.porcentaje}
                    onChange={(v) => setCustomConfig({ ...customConfig, avisosYTableros: { ...customConfig.avisosYTableros, porcentaje: v } })}
                    min={0}
                    max={100}
                  />
                )}
                <ToggleInput
                  label="Sobretasa bomberil"
                  pressed={customConfig.sobretasaBomberil.aplica}
                  onToggle={(v) => setCustomConfig({ ...customConfig, sobretasaBomberil: { ...customConfig.sobretasaBomberil, aplica: v } })}
                />
                {customConfig.sobretasaBomberil.aplica && (
                  <>
                    <NumberInput
                      id="bomberil-pct"
                      label="Porcentaje bomberil (%)"
                      value={customConfig.sobretasaBomberil.porcentaje}
                      onChange={(v) => setCustomConfig({ ...customConfig, sobretasaBomberil: { ...customConfig.sobretasaBomberil, porcentaje: v } })}
                      min={0}
                    />
                    <SelectInput
                      id="bomberil-base"
                      label="Base bomberil"
                      value={customConfig.sobretasaBomberil.base}
                      onChange={(v) => setCustomConfig({ ...customConfig, sobretasaBomberil: { ...customConfig.sobretasaBomberil, base: v as "ICA" | "AVISOS" | "ICA+AVISOS" } })}
                      options={[
                        { value: "ICA", label: "Solo ICA" },
                        { value: "AVISOS", label: "Solo Avisos" },
                        { value: "ICA+AVISOS", label: "ICA + Avisos" },
                      ]}
                    />
                  </>
                )}
                <ToggleInput
                  label="Sobretasa seguridad"
                  pressed={customConfig.sobretasaSeguridad.aplica}
                  onToggle={(v) => setCustomConfig({ ...customConfig, sobretasaSeguridad: { ...customConfig.sobretasaSeguridad, aplica: v } })}
                />
                {customConfig.sobretasaSeguridad.aplica && (
                  <NumberInput
                    id="seguridad-pct"
                    label="Porcentaje seguridad (%)"
                    value={customConfig.sobretasaSeguridad.porcentaje}
                    onChange={(v) => setCustomConfig({ ...customConfig, sobretasaSeguridad: { ...customConfig.sobretasaSeguridad, porcentaje: v } })}
                  />
                )}
                <ToggleInput
                  label="Anticipo"
                  pressed={customConfig.anticipo.aplica}
                  onToggle={(v) => setCustomConfig({ ...customConfig, anticipo: { ...customConfig.anticipo, aplica: v } })}
                />
                {customConfig.anticipo.aplica && (
                  <NumberInput
                    id="anticipo-pct"
                    label="Porcentaje anticipo (%)"
                    value={customConfig.anticipo.porcentaje}
                    onChange={(v) => setCustomConfig({ ...customConfig, anticipo: { ...customConfig.anticipo, porcentaje: v } })}
                  />
                )}
                <ToggleInput
                  label="Pronto pago"
                  pressed={customConfig.descuentoProntoPago.aplica}
                  onToggle={(v) => setCustomConfig({ ...customConfig, descuentoProntoPago: { ...customConfig.descuentoProntoPago, aplica: v } })}
                />
                <ToggleInput
                  label="Redondeo a mil"
                  pressed={customConfig.redondeoAMil || false}
                  onToggle={(v) => setCustomConfig({ ...customConfig, redondeoAMil: v })}
                />
              </div>
            </div>
          )}

          {/* Bloque 3: Base gravable */}
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight">B. Base gravable</h3>
            <div className="space-y-4">
              <CurrencyInput
                id="r8"
                label="R8. Ingresos brutos totales en el pais"
                value={ingresosTotalesPais}
                onChange={setIngresosTotalesPais}
                placeholder="Ingresos en Colombia"
              />
              <CurrencyInput
                id="r9"
                label="R9. Ingresos fuera del municipio"
                value={ingresosFueraMunicipio}
                onChange={setIngresosFueraMunicipio}
              />
              <CurrencyInput
                id="r11"
                label="R11. Devoluciones y rebajas"
                value={devoluciones}
                onChange={setDevoluciones}
              />
              <CurrencyInput
                id="r12"
                label="R12. Exportaciones y activos fijos"
                value={exportacionesYActivosFijos}
                onChange={setExportacionesYActivosFijos}
              />
              <CurrencyInput
                id="r13"
                label="R13. Actividades excluidas"
                value={actividadesExcluidasNoSujetas}
                onChange={setActividadesExcluidasNoSujetas}
              />
              <CurrencyInput
                id="r14"
                label="R14. Actividades exentas"
                value={actividadesExentas}
                onChange={setActividadesExentas}
              />
            </div>
          </div>

          {/* Bloque 4: Actividades economicas */}
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">C. Actividades economicas</h3>
              <button
                onClick={addActividad}
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                <Plus className="h-3 w-3" /> Agregar
              </button>
            </div>
            <div className="space-y-4">
              {actividades.map((act, idx) => (
                <div key={idx} className="rounded-md border border-border bg-muted/20 p-3 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Actividad {idx + 1}</span>
                    {actividades.length > 0 && (
                      <button onClick={() => removeActividad(idx)} className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Codigo CIIU</label>
                      <input
                        type="text"
                        value={act.codigoActividad}
                        onChange={(e) => updateActividad(idx, "codigoActividad", e.target.value)}
                        className={clsx(
                          "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none",
                          !isCustom && "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        )}
                        readOnly={!isCustom}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Tarifa (x1000)</label>
                      <input
                        type="number"
                        value={act.tarifa}
                        onChange={(e) => updateActividad(idx, "tarifa", Number(e.target.value))}
                        className={clsx(
                          "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none",
                          !isCustom && "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        )}
                        readOnly={!isCustom}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Descripcion</label>
                    <input
                      type="text"
                      value={act.descripcion}
                      onChange={(e) => updateActividad(idx, "descripcion", e.target.value)}
                      className={clsx(
                        "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none",
                        !isCustom && "bg-muted/50 text-muted-foreground cursor-not-allowed"
                      )}
                      readOnly={!isCustom}
                    />
                  </div>
                  <CurrencyInput
                    id={`act-ing-${idx}`}
                    label="Ingresos de esta actividad"
                    value={act.ingresos}
                    onChange={(v) => updateActividad(idx, "ingresos", v)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md bg-muted/30 px-3 py-2 text-xs">
              Suma actividades: {formatCOP(sumaActividades)} / Ingresos gravables (R15): {formatCOP(ingresosGravablesCalculado)}
              {coinciden ? (
                <span className="ml-2 text-foreground font-medium">✓ Coinciden</span>
              ) : (
                <span className="ml-2 text-foreground/70">Diferencia: {formatCOP(diff)}</span>
              )}
            </div>
          </div>

          {/* Bloque 5: Retenciones y anticipos */}
          <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight">D. Retenciones y anticipos</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <CurrencyInput id="r27" label="R27. Retenciones practicadas" value={retencionesPracticadas} onChange={setRetencionesPracticadas} />
              <CurrencyInput id="r28" label="R28. Autorretenciones" value={autorretenciones} onChange={setAutorretenciones} />
              <CurrencyInput id="r29" label="R29. Anticipo anterior" value={anticipoAnterior} onChange={setAnticipoAnterior} />
              <CurrencyInput id="r32" label="R32. Saldo favor anterior" value={saldoFavorAnterior} onChange={setSaldoFavorAnterior} />
            </div>
          </div>

          {/* Bloque 6: Avanzado */}
          <div className="space-y-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ChevronDown className={clsx("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
              {showAdvanced ? "Ocultar campos avanzados" : "Mostrar campos avanzados"}
            </button>
            {showAdvanced && (
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <CurrencyInput id="r31" label="R31. Sanciones" value={sanciones} onChange={setSanciones} />
                <CurrencyInput id="r26" label="R26. Exenciones" value={exenciones} onChange={setExenciones} />
                <CurrencyInput id="r37" label="R37. Intereses de mora" value={interesesMora} onChange={setInteresesMora} />
                <p className="text-[10px] text-muted-foreground italic">Estos campos son opcionales. Uselos solo si aplican a su declaracion.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="space-y-6">
          {!resultado ? (
            <div className="flex flex-col items-center justify-center h-full rounded-lg border border-dashed p-10 text-center text-muted-foreground min-h-[400px]">
              <MapPin className="h-16 w-16 opacity-20 mb-4" />
              <p>Ingresa los datos del balance para calcular el ICA</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Bloque R1: Resultado cards */}
              <CalculatorResult items={resultItems} />

              {/* Bloque R2: Resumen descriptivo */}
              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm space-y-4">
                <h3 className="font-semibold tracking-tight border-b border-border/60 pb-2">Resumen de liquidacion</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Total ICA (R20)</span>
                    <span>{formatCOP(resultado.renglon20)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">+ Avisos y tableros (R21)</span>
                    <span>{formatCOP(resultado.renglon21)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">+ Sobretasa bomberil (R23)</span>
                    <span>{formatCOP(resultado.renglon23)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">+ Sobretasa seguridad (R24)</span>
                    <span>{formatCOP(resultado.renglon24)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 font-semibold">
                    <span className="text-foreground">= Total impuesto a cargo (R25)</span>
                    <span>{formatCOP(resultado.renglon25)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 italic">
                    <span className="text-muted-foreground">− Retenciones (R27)</span>
                    <span>{formatCOP(resultado.renglon27)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 italic">
                    <span className="text-muted-foreground">− Autorretenciones (R28)</span>
                    <span>{formatCOP(resultado.renglon28)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">− Anticipo anterior (R29)</span>
                    <span>{formatCOP(resultado.renglon29)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">− Saldo favor anterior (R32)</span>
                    <span>{formatCOP(resultado.renglon32)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">+ Anticipo siguiente (R30)</span>
                    <span>{formatCOP(resultado.renglon30)}</span>
                  </div>
                  {resultado.renglon31 && resultado.renglon31 > 0 ? (
                    <div className="flex justify-between border-b pb-1 text-muted-foreground">
                      <span>+ Sanciones (R31)</span>
                      <span>{formatCOP(resultado.renglon31)}</span>
                    </div>
                  ) : null}
                  {resultado.renglon37 && resultado.renglon37 > 0 ? (
                    <div className="flex justify-between border-b pb-1 text-muted-foreground">
                      <span>+ Intereses mora (R37)</span>
                      <span>{formatCOP(resultado.renglon37)}</span>
                    </div>
                  ) : null}
                  <div className={clsx(
                    "flex justify-between border-b pb-1 text-lg font-bold",
                    resultado.renglon33 > 0 ? "text-foreground" : "text-foreground"
                  )}>
                    <span>= Saldo neto (R33)</span>
                    <span>{formatCOP(resultado.renglon33)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 italic">
                    <span className="text-muted-foreground">− Descuento pronto pago (R36)</span>
                    <span>{formatCOP(resultado.renglon36)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-foreground text-xl font-bold text-foreground">
                    <span>TOTAL A PAGAR (R38)</span>
                    <span>{formatCOP(resultado.renglon38)}</span>
                  </div>
                </div>
              </div>

              {/* Bloque R3: Banner saldo a favor */}
              {resultado.renglon34 > 0 && (
                <div className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>Tiene un saldo a favor de {formatCOP(resultado.renglon34)}. Puede solicitar compensacion o devolucion ante la administracion municipal.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DEBAJO DEL GRID: ANCHO COMPLETO */}
      {resultado && (
        <div className="mt-12 space-y-10">
          {/* Bloque T1: Formulario oficial */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Formulario Oficial (Declaracion Privada)</h2>
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wide font-medium text-muted-foreground w-16">Item</th>
                    <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Concepto / Renglon</th>
                    <th className="px-4 py-2 text-right text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {/* SECCION B */}
                  <tr className="bg-muted/30"><td colSpan={3} className="px-4 py-1 text-[10px] font-bold text-foreground/70 uppercase tracking-widest">B. Base Gravable</td></tr>
                  <FormRow n={8} label="Ingresos brutos ordinarios y extraordinarios en todo el pais" value={resultado.renglon8} />
                  <FormRow n={9} label="Menos ingresos fuera de este municipio" value={resultado.renglon9} />
                  <FormRow n={10} label="Total ingresos brutos en este municipio (8-9)" value={resultado.renglon10} />
                  <FormRow n={11} label="Menos devoluciones, rebajas y descuentos" value={resultado.renglon11} />
                  <FormRow n={12} label="Menos exportaciones y enajenacion de activos fijos" value={resultado.renglon12} />
                  <FormRow n={13} label="Menos actividades no sujetas o excluidas y otras deducciones" value={resultado.renglon13} />
                  <FormRow n={14} label="Menos ingresos por actividades exentas" value={resultado.renglon14} />
                  <FormRow n={15} label="TOTAL INGRESOS GRAVABLES (10-11-12-13-14)" value={resultado.renglon15} bold color="text-foreground" />

                  {/* SECCION C */}
                  <tr className="bg-muted/30"><td colSpan={3} className="px-4 py-1 text-[10px] font-bold text-foreground/70 uppercase tracking-widest">C. Actividades Economicas</td></tr>
                  {resultado.actividades?.map((act, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{act.codigo}</td>
                      <td className="px-4 py-2 flex flex-col">
                        <span>{act.nombre}</span>
                        <span className="text-[10px] text-muted-foreground italic">Tarifa: {act.tarifa} x 1000 | Base: {formatCOP(act.ingresos)}</span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{formatCOP(act.impuesto)}</td>
                    </tr>
                  ))}
                  <FormRow n={16} label="Total ingresos gravados" value={resultado.renglon16} />
                  <FormRow n={17} label="Total impuesto de industria y comercio" value={resultado.renglon17} bold />
                  {resultado.renglon19 ? <FormRow n={19} label="Impuesto de industria y comercio" value={resultado.renglon19} /> : null}

                  {/* SECCION D */}
                  <tr className="bg-muted/30"><td colSpan={3} className="px-4 py-1 text-[10px] font-bold text-foreground/70 uppercase tracking-widest">D. Liquidacion Privada</td></tr>
                  <FormRow n={20} label="Impuesto de industria y comercio (R17)" value={resultado.renglon20} />
                  <FormRow n={21} label="Impuesto de avisos y tableros (15% de R20)" value={resultado.renglon21} />
                  {resultado.renglon22 ? <FormRow n={22} label="Unidades comerciales adicionales" value={resultado.renglon22} /> : null}
                  <FormRow n={23} label="Sobretasa bomberil" value={resultado.renglon23} />
                  <FormRow n={24} label="Sobretasa de seguridad" value={resultado.renglon24} />
                  <FormRow n={25} label="TOTAL IMPUESTO A CARGO (20+21+22+23+24)" value={resultado.renglon25} bold />
                  {resultado.renglon26 ? <FormRow n={26} label="Menos exenciones o exoneraciones" value={resultado.renglon26} /> : null}
                  <FormRow n={27} label="Menos retenciones que le practicaron" value={resultado.renglon27} />
                  <FormRow n={28} label="Menos autorretenciones" value={resultado.renglon28} />
                  <FormRow n={29} label="Menos anticipo periodo anterior" value={resultado.renglon29} />
                  <FormRow n={30} label="Mas anticipo periodo siguiente" value={resultado.renglon30} />
                  <FormRow n={31} label="Mas sanciones" value={resultado.renglon31 || 0} />
                  <FormRow n={32} label="Menos saldo a favor periodo anterior" value={resultado.renglon32} />
                  <FormRow n={33} label="TOTAL SALDO A CARGO (25-26-27-28-29+30+31-32)" value={resultado.renglon33} bold />
                  <FormRow n={34} label="O SALDO A FAVOR" value={resultado.renglon34} bold color="text-foreground" />

                  {/* SECCION E */}
                  <tr className="bg-muted/30"><td colSpan={3} className="px-4 py-1 text-[10px] font-bold text-foreground/70 uppercase tracking-widest">E. Pago</td></tr>
                  <FormRow n={35} label="Valor a pagar" value={resultado.renglon35} />
                  <FormRow n={36} label="Menos descuentos por pronto pago" value={resultado.renglon36} />
                  <FormRow n={37} label="Mas intereses de mora" value={resultado.renglon37 || 0} />
                  <FormRow n={38} label="TOTAL A PAGAR (35-36+37)" value={resultado.renglon38} bold highlight />
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloque T2: Configuracion del municipio */}
          <CollapsibleSection title="Configuracion y parametros del municipio">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              <ConfigRow label="Nombre" value={municipio.nombre} />
              <ConfigRow label="Departamento" value={municipio.departamento} />
              <ConfigRow label="Avisos y Tableros" value={municipio.avisosYTableros.aplica ? `${municipio.avisosYTableros.porcentaje}%` : "No aplica"} />
              <ConfigRow label="Sobretasa Bomberil" value={municipio.sobretasaBomberil.aplica ? `${municipio.sobretasaBomberil.porcentaje}% sobre ${municipio.sobretasaBomberil.base}` : "No aplica"} />
              <ConfigRow label="Sobretasa Seguridad" value={municipio.sobretasaSeguridad.aplica ? `${municipio.sobretasaSeguridad.porcentaje}%` : "No aplica"} />
              <ConfigRow label="Anticipo" value={municipio.anticipo.aplica ? `${municipio.anticipo.porcentaje}%` : "No aplica"} />
              <ConfigRow label="Descuento Pronto Pago" value={municipio.descuentoProntoPago.aplica ? `${municipio.descuentoProntoPago.porcentaje}%` : "No aplica"} />
              <ConfigRow label="Redondeo a mil" value={municipio.redondeoAMil ? "Si" : "No"} />
            </div>
          </CollapsibleSection>

          {/* Bloque T3: Warnings y errores */}
          {(errores.length > 0 || warnings.length > 0) && (
            <div className="space-y-4">
              <h3 className="font-semibold tracking-tight">Validaciones y Alertas</h3>
              {errores.length > 0 && (
                <div className="space-y-2">
                  {errores.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/60">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border/60">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-12 pt-8 space-y-4">
        <CalculatorSources articles={[]} />
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          <strong>Nota legal:</strong> Los calculos presentados son una proyeccion informativa basada en el Formulario Unico Nacional de ICA y las normativas municipales vigentes (Ley 14 de 1983, Ley 1575 de 2012). Esta herramienta no sustituye la asesoria de un profesional contable ni exime de la obligacion de verificar los datos ante la secretaria de hacienda correspondiente.
        </p>
      </div>
    </div>
  );
}

// ── HELPER COMPONENTS ──

function FormRow({
  n,
  label,
  value = 0,
  bold = false,
  highlight = false,
  color,
}: {
  n: number;
  label: string;
  value?: number;
  bold?: boolean;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <tr className={clsx(
      "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
      highlight && "bg-muted/50"
    )}>
      <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{n}</td>
      <td className={clsx("px-4 py-2", bold && "font-semibold")}>{label}</td>
      <td className={clsx("px-4 py-2 text-right font-mono", bold && "font-bold", color)}>{formatCOP(value)}</td>
    </tr>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
