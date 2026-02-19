"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  SMLMV_2026,
  SALARIO_INTEGRAL_MIN_SMLMV,
  ARL_CLASSES,
  FSP_BRACKETS,
  IBC_MIN_SMLMV,
  IBC_MAX_SMLMV,
  SS_PENSION_TOTAL_RATE,
  SS_SALUD_TOTAL_RATE,
  EXONERATION_THRESHOLD_SMLMV,
} from "@/config/tax-data";
import { CurrencyInput, SelectInput, ToggleInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { CalculatorSources } from "@/components/calculators/calculator-sources";

// ── Types ──

type TipoCotizante = "dependiente" | "independiente_cps" | "independiente_cp" | "integral";

const TIPO_OPTIONS = [
  { value: "dependiente", label: "Dependiente (contrato laboral)" },
  { value: "independiente_cps", label: "Independiente — Contrato de Prestacion de Servicios" },
  { value: "independiente_cp", label: "Independiente — Cuenta Propia" },
  { value: "integral", label: "Salario Integral" },
];

const ARL_OPTIONS = ARL_CLASSES.map((c) => ({
  value: c.clase,
  label: `Clase ${c.clase} — ${c.rate * 100}% — ${c.description}`,
}));

// ── Helpers ──

function formatCOP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function formatPct(n: number): string {
  return (n * 100).toFixed(2) + "%";
}

function isIndependiente(tipo: TipoCotizante): boolean {
  return tipo === "independiente_cps" || tipo === "independiente_cp";
}

function isEmpleador(tipo: TipoCotizante): boolean {
  return tipo === "dependiente" || tipo === "integral";
}

// ── Collapsible ──

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
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-border/60 px-4 py-4">{children}</div>}
    </div>
  );
}

// ── Main Page ──

export default function SeguridadSocialPage() {
  const [tipoCotizante, setTipoCotizante] = useState<string>("dependiente");
  const [ingresoBruto, setIngresoBruto] = useState(0);
  const [claseARL, setClaseARL] = useState("I");
  const [esPensionado, setEsPensionado] = useState(false);
  const [aplicaExoneracion, setAplicaExoneracion] = useState(false);

  const tipo = tipoCotizante as TipoCotizante;
  const smlmv = SMLMV_2026;
  const ibcMin = IBC_MIN_SMLMV * smlmv;
  const ibcMax = IBC_MAX_SMLMV * smlmv;

  const result = useMemo(() => {
    if (ingresoBruto <= 0) return null;

    // ── Paso 1: Derivar IBC ──
    let factor = 1.0;
    if (isIndependiente(tipo)) factor = 0.40;
    if (tipo === "integral") factor = 0.70;

    const ibcRaw = ingresoBruto * factor;
    const ibcClamped = Math.max(ibcMin, Math.min(ibcMax, ibcRaw));
    const wasClamped = ibcClamped !== ibcRaw;
    const clampDirection = ibcRaw < ibcMin ? "min" : ibcRaw > ibcMax ? "max" : null;

    const ibc = ibcClamped;
    const ibcSMLMV = ibc / smlmv;

    // ── Paso 2: Warnings ──
    const warnings: string[] = [];
    if (tipo === "integral" && ingresoBruto < SALARIO_INTEGRAL_MIN_SMLMV * smlmv) {
      warnings.push(
        `Salario Integral requiere minimo ${SALARIO_INTEGRAL_MIN_SMLMV} SMLMV (${formatCOP(SALARIO_INTEGRAL_MIN_SMLMV * smlmv)}). El ingreso ingresado es inferior.`
      );
    }
    if (wasClamped && clampDirection === "min") {
      warnings.push(
        `El IBC calculado (${formatCOP(ibcRaw)}) es inferior al minimo de 1 SMLMV. Se ajusta a ${formatCOP(ibcMin)}.`
      );
    }
    if (wasClamped && clampDirection === "max") {
      warnings.push(
        `El IBC calculado (${formatCOP(ibcRaw)}) supera el maximo de 25 SMLMV. Se ajusta a ${formatCOP(ibcMax)}.`
      );
    }

    const exoneracionAplica =
      aplicaExoneracion && isEmpleador(tipo) && ibc < EXONERATION_THRESHOLD_SMLMV * smlmv;
    if (aplicaExoneracion && isEmpleador(tipo) && ibc >= EXONERATION_THRESHOLD_SMLMV * smlmv) {
      warnings.push(
        `Exoneracion Art. 114-1 no aplica: IBC (${formatCOP(ibc)}) >= ${EXONERATION_THRESHOLD_SMLMV} SMLMV (${formatCOP(EXONERATION_THRESHOLD_SMLMV * smlmv)}).`
      );
    }

    // ── Paso 3: Salud (12.5%) ──
    let saludTrabajador = 0;
    let saludEmpleador = 0;
    if (isIndependiente(tipo)) {
      saludTrabajador = ibc * SS_SALUD_TOTAL_RATE;
    } else {
      saludTrabajador = ibc * 0.04;
      saludEmpleador = exoneracionAplica ? 0 : ibc * 0.085;
    }

    // ── Paso 4: Pension (16%) ──
    let pensionTrabajador = 0;
    let pensionEmpleador = 0;
    if (!esPensionado) {
      if (isIndependiente(tipo)) {
        pensionTrabajador = ibc * SS_PENSION_TOTAL_RATE;
      } else {
        pensionTrabajador = ibc * 0.04;
        pensionEmpleador = ibc * 0.12;
      }
    }

    // ── Paso 5: ARL ──
    const arlClass = ARL_CLASSES.find((c) => c.clase === claseARL) ?? ARL_CLASSES[0];
    const arlRate = arlClass.rate;
    let arlTrabajador = 0;
    let arlEmpleador = 0;
    if (isIndependiente(tipo)) {
      arlTrabajador = ibc * arlRate;
    } else {
      arlEmpleador = ibc * arlRate;
    }

    // ── Paso 6: FSP ──
    let fspRate = 0;
    let fspTrabajador = 0;
    if (!esPensionado && ibcSMLMV >= 4) {
      const bracket = FSP_BRACKETS.find((b) => ibcSMLMV >= b.fromSMLMV && ibcSMLMV < b.toSMLMV);
      if (bracket) {
        fspRate = bracket.rate;
        fspTrabajador = ibc * fspRate;
      }
    }

    // ── Paso 7: Parafiscales ──
    let sena = 0;
    let icbf = 0;
    let ccf = 0;
    if (isEmpleador(tipo)) {
      const baseParafiscales = tipo === "integral" ? ingresoBruto : ibc;
      sena = exoneracionAplica ? 0 : baseParafiscales * 0.02;
      icbf = exoneracionAplica ? 0 : baseParafiscales * 0.03;
      ccf = baseParafiscales * 0.04;
    }

    // ── Paso 8: Totales ──
    const totalTrabajador = saludTrabajador + pensionTrabajador + arlTrabajador + fspTrabajador;
    const totalEmpleador = saludEmpleador + pensionEmpleador + arlEmpleador + sena + icbf + ccf;
    const netoAproximado = ingresoBruto - totalTrabajador;
    const costoEmpleador = isEmpleador(tipo) ? ingresoBruto + totalEmpleador : null;

    return {
      factor,
      ibc,
      ibcSMLMV,
      warnings,
      exoneracionAplica,
      saludTrabajador,
      saludEmpleador,
      pensionTrabajador,
      pensionEmpleador,
      arlTrabajador,
      arlEmpleador,
      arlRate,
      fspRate,
      fspTrabajador,
      sena,
      icbf,
      ccf,
      totalTrabajador,
      totalEmpleador,
      netoAproximado,
      costoEmpleador,
    };
  }, [ingresoBruto, tipo, claseARL, esPensionado, aplicaExoneracion, smlmv, ibcMin, ibcMax]);

  return (
    <>
      <Link
        href="/calculadoras"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Calculadoras
      </Link>

      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight">Aportes a Seguridad Social 2026</h1>

      {/* ── Inputs ── */}
      <div className="mb-6 space-y-4">
        <SelectInput
          id="ss-tipo"
          label="Tipo de cotizante"
          value={tipoCotizante}
          onChange={setTipoCotizante}
          options={TIPO_OPTIONS}
        />
        <CurrencyInput
          id="ss-ingreso"
          label="Ingreso mensual bruto"
          value={ingresoBruto}
          onChange={setIngresoBruto}
        />
        <div className="min-w-[260px]">
          <SelectInput
            id="ss-arl"
            label="Clase de riesgo ARL"
            value={claseARL}
            onChange={setClaseARL}
            options={ARL_OPTIONS}
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <ToggleInput label="Es pensionado" pressed={esPensionado} onToggle={setEsPensionado} />
          {isEmpleador(tipo) && (
            <ToggleInput
              label="Aplica exoneracion Art. 114-1"
              pressed={aplicaExoneracion}
              onToggle={setAplicaExoneracion}
            />
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-1">
              {result.warnings.map((w) => (
                <p key={w} className="text-foreground bg-muted/50 border border-border/60 rounded-xl p-4 text-sm">
                  {w}
                </p>
              ))}
            </div>
          )}

          {/* ════ A. Resumen IBC ════ */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Ingreso Base de Cotizacion (IBC)</h2>
            <CalculatorResult
              items={[
                { label: "Ingreso bruto", value: formatCOP(ingresoBruto) },
                {
                  label: "Factor aplicable",
                  value: (result.factor * 100).toFixed(0) + "%",
                  sublabel:
                    tipo === "dependiente"
                      ? "100% del salario"
                      : isIndependiente(tipo)
                        ? "40% del ingreso"
                        : "70% del salario integral",
                },
                {
                  label: "IBC calculado",
                  value: formatCOP(result.ibc),
                  sublabel: result.ibcSMLMV.toFixed(2) + " SMLMV",
                },
              ]}
            />
          </div>

          {/* ════ B. Tabla de Aportes ════ */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Tabla de Aportes</h2>
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                    <th className="px-4 py-2 text-left">Concepto</th>
                    <th className="px-4 py-2 text-right">Trab. %</th>
                    <th className="px-4 py-2 text-right">Trab. $</th>
                    <th className="px-4 py-2 text-right">Empl. %</th>
                    <th className="px-4 py-2 text-right">Empl. $</th>
                    <th className="px-4 py-2 text-right">Total $</th>
                  </tr>
                </thead>
                <tbody>
                  <AporteRow
                    label="Salud"
                    trabPct={isIndependiente(tipo) ? SS_SALUD_TOTAL_RATE : 0.04}
                    trabVal={result.saludTrabajador}
                    empPct={isIndependiente(tipo) ? null : (result.exoneracionAplica ? 0 : 0.085)}
                    empVal={result.saludEmpleador}
                    total={result.saludTrabajador + result.saludEmpleador}
                    note={result.exoneracionAplica && isEmpleador(tipo) ? "Exonerado Art. 114-1" : undefined}
                  />
                  <AporteRow
                    label="Pension"
                    trabPct={esPensionado ? 0 : (isIndependiente(tipo) ? SS_PENSION_TOTAL_RATE : 0.04)}
                    trabVal={result.pensionTrabajador}
                    empPct={esPensionado || isIndependiente(tipo) ? null : 0.12}
                    empVal={result.pensionEmpleador}
                    total={result.pensionTrabajador + result.pensionEmpleador}
                    note={esPensionado ? "Pensionado — exento" : undefined}
                  />
                  <AporteRow
                    label={`ARL (Clase ${claseARL})`}
                    trabPct={isIndependiente(tipo) ? result.arlRate : null}
                    trabVal={result.arlTrabajador}
                    empPct={isIndependiente(tipo) ? null : result.arlRate}
                    empVal={result.arlEmpleador}
                    total={result.arlTrabajador + result.arlEmpleador}
                  />
                  <AporteRow
                    label="Fondo de Solidaridad"
                    trabPct={result.fspRate}
                    trabVal={result.fspTrabajador}
                    empPct={null}
                    empVal={0}
                    total={result.fspTrabajador}
                    note={esPensionado ? "Pensionado — exento" : result.fspRate === 0 ? "IBC < 4 SMLMV" : undefined}
                  />
                  {isEmpleador(tipo) && (
                    <>
                      <tr className="border-b border-border bg-muted/30">
                        <td colSpan={6} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          Parafiscales {tipo === "integral" ? "(base: salario completo)" : "(base: IBC)"}
                        </td>
                      </tr>
                      <AporteRow
                        label="SENA"
                        trabPct={null}
                        trabVal={0}
                        empPct={result.exoneracionAplica ? 0 : 0.02}
                        empVal={result.sena}
                        total={result.sena}
                        note={result.exoneracionAplica ? "Exonerado Art. 114-1" : undefined}
                      />
                      <AporteRow
                        label="ICBF"
                        trabPct={null}
                        trabVal={0}
                        empPct={result.exoneracionAplica ? 0 : 0.03}
                        empVal={result.icbf}
                        total={result.icbf}
                        note={result.exoneracionAplica ? "Exonerado Art. 114-1" : undefined}
                      />
                      <AporteRow
                        label="CCF"
                        trabPct={null}
                        trabVal={0}
                        empPct={0.04}
                        empVal={result.ccf}
                        total={result.ccf}
                      />
                    </>
                  )}
                  {/* TOTAL row */}
                  <tr className="border-b border-border bg-muted/20 font-semibold">
                    <td className="px-4 py-2">TOTAL</td>
                    <td className="px-4 py-2 text-right"></td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.totalTrabajador)}</td>
                    <td className="px-4 py-2 text-right"></td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.totalEmpleador)}</td>
                    <td className="px-4 py-2 text-right">{formatCOP(result.totalTrabajador + result.totalEmpleador)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Notes */}
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {result.exoneracionAplica && (
                <p>Art. 114-1 ET: Empleadores exonerados de salud (8.5%), SENA (2%) e ICBF (3%) para trabajadores con IBC &lt; {EXONERATION_THRESHOLD_SMLMV} SMLMV.</p>
              )}
              {esPensionado && <p>Pensionado: no cotiza a pension ni FSP.</p>}
              {tipo === "integral" && (
                <p>Salario Integral: SS sobre 70% del salario, parafiscales sobre el 100%.</p>
              )}
            </div>
          </div>

          {/* ════ C. FSP Detalle ════ */}
          <CollapsibleSection title="Fondo de Solidaridad Pensional — Detalle">
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                    <th className="px-4 py-2 text-left">Rango IBC</th>
                    <th className="px-4 py-2 text-right">Tasa</th>
                    <th className="px-4 py-2 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className={`border-b border-border last:border-0 ${
                      !esPensionado && result.ibcSMLMV < 4
                        ? "bg-muted font-semibold"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2">&lt; 4 SMLMV</td>
                    <td className="px-4 py-2 text-right">0%</td>
                    <td className="px-4 py-2">No aplica</td>
                  </tr>
                  {FSP_BRACKETS.map((b) => {
                    const active =
                      !esPensionado &&
                      result.ibcSMLMV >= b.fromSMLMV &&
                      result.ibcSMLMV < b.toSMLMV;
                    return (
                      <tr
                        key={b.fromSMLMV}
                        className={`border-b border-border last:border-0 ${
                          active ? "bg-muted font-semibold" : ""
                        }`}
                      >
                        <td className="px-4 py-2">
                          {b.fromSMLMV} — {b.toSMLMV === Infinity ? "+" : b.toSMLMV} SMLMV
                        </td>
                        <td className="px-4 py-2 text-right">{(b.rate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2">{b.detail}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Reforma pensional Ley 2381/2024 SUSPENDIDA por Auto 841/2025 Corte Constitucional. Aplican tarifas Ley 797/2003 Art. 8.
            </p>
          </CollapsibleSection>

          {/* ════ D. Resumen Neto ════ */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Resumen Neto</h2>
            <CalculatorResult
              items={[
                { label: "Ingreso bruto mensual", value: formatCOP(ingresoBruto) },
                {
                  label: "(-) Aportes trabajador",
                  value: formatCOP(result.totalTrabajador),
                  sublabel: formatPct(result.totalTrabajador / ingresoBruto) + " del ingreso",
                },
                {
                  label: "Neto aproximado",
                  value: formatCOP(result.netoAproximado),
                  sublabel: "Sin retencion en la fuente",
                },
                ...(result.costoEmpleador !== null
                  ? [
                      {
                        label: "Costo total empleador",
                        value: formatCOP(result.costoEmpleador),
                        sublabel: formatPct(result.costoEmpleador / ingresoBruto - 1) + " sobre ingreso bruto",
                      },
                    ]
                  : []),
                {
                  label: "Aportes anuales (trabajador)",
                  value: formatCOP(result.totalTrabajador * 12),
                },
                ...(result.costoEmpleador !== null
                  ? [
                      {
                        label: "Aportes anuales (empleador)",
                        value: formatCOP(result.totalEmpleador * 12),
                      },
                    ]
                  : []),
              ]}
            />
          </div>

          {/* ════ E. Referencia ARL ════ */}
          <CollapsibleSection title="Tabla de Referencia — Clases de Riesgo ARL">
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/60 text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                    <th className="px-4 py-2 text-left">Clase</th>
                    <th className="px-4 py-2 text-right">Tasa</th>
                    <th className="px-4 py-2 text-left">Descripcion</th>
                  </tr>
                </thead>
                <tbody>
                  {ARL_CLASSES.map((c) => (
                    <tr
                      key={c.clase}
                      className={`border-b border-border last:border-0 ${
                        c.clase === claseARL ? "bg-muted font-semibold" : ""
                      }`}
                    >
                      <td className="px-4 py-2">{c.clase}</td>
                      <td className="px-4 py-2 text-right">{formatPct(c.rate)}</td>
                      <td className="px-4 py-2">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Decreto 1295/1994 Art. 26, Decreto 1072/2015. Tarifa inicial segun clase de riesgo de la actividad economica.
            </p>
          </CollapsibleSection>
        </div>
      )}

      <div className="mt-6">
        <CalculatorSources articles={["204", "114-1"]} />
      </div>
    </>
  );
}

// ── Table helper ──

function AporteRow({
  label,
  trabPct,
  trabVal,
  empPct,
  empVal,
  total,
  note,
}: {
  label: string;
  trabPct: number | null;
  trabVal: number;
  empPct: number | null;
  empVal: number;
  total: number;
  note?: string;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-2">
        {label}
        {note && <span className="ml-1 text-xs text-muted-foreground">({note})</span>}
      </td>
      <td className="px-4 py-2 text-right">{trabPct === null ? "—" : formatPct(trabPct)}</td>
      <td className="px-4 py-2 text-right">{trabPct === null ? "—" : formatCOP(trabVal)}</td>
      <td className="px-4 py-2 text-right">{empPct === null ? "—" : formatPct(empPct)}</td>
      <td className="px-4 py-2 text-right">{empPct === null ? "—" : formatCOP(empVal)}</td>
      <td className="px-4 py-2 text-right">{formatCOP(total)}</td>
    </tr>
  );
}
