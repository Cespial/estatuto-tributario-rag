"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, User, Award } from "lucide-react";
import { SelectInput, NumberInput } from "@/components/calculators/shared-inputs";
import { CalculatorResult } from "@/components/calculators/calculator-result";
import { SEMANAS_MUJERES_PROGRESIVO, PENSION_REQUISITOS } from "@/config/tax-data-wave4";

function calculateAge(birthday: string): number {
  if (!birthday) return 0;
  const ageDifMs = Date.now() - new Date(birthday).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function calculateAgeAt(birthday: string, targetYear: number): number {
  if (!birthday) return 0;
  return targetYear - new Date(birthday).getFullYear();
}

export default function PensionPage() {
  const [genero, setGenero] = useState("hombre");
  const [nacimiento, setNacimiento] = useState("");
  const [semanasActuales, setSemanasActuales] = useState(0);
  const [anoRetiro, setAnoRetiro] = useState(new Date().getFullYear());

  const calculo = useMemo(() => {
    if (!nacimiento || !anoRetiro) return null;

    const edadActual = calculateAge(nacimiento);
    const edadAlRetiro = calculateAgeAt(nacimiento, anoRetiro);
    const edadRequerida = genero === "hombre" ? PENSION_REQUISITOS.edadHombreActual : PENSION_REQUISITOS.edadMujerActual;

    // Semanas requeridas segun genero y año de retiro
    let semanasRequeridas: number = PENSION_REQUISITOS.semanasBase;
    if (genero === "mujer") {
      const entry = SEMANAS_MUJERES_PROGRESIVO.find(e => e.anio === anoRetiro);
      if (entry) {
        semanasRequeridas = entry.semanas;
      } else if (anoRetiro > 2036) {
        semanasRequeridas = 1000;
      }
    }

    const cumpleEdad = edadAlRetiro >= edadRequerida;
    const cumpleSemanas = semanasActuales >= semanasRequeridas;
    const faltanSemanas = Math.max(0, semanasRequeridas - semanasActuales);
    const anosTrabajoFaltantes = faltanSemanas / 52;

    const fechaCumpleEdad = new Date(nacimiento);
    fechaCumpleEdad.setFullYear(fechaCumpleEdad.getFullYear() + edadRequerida);

    return {
      edadActual,
      edadAlRetiro,
      edadRequerida,
      semanasRequeridas,
      cumpleEdad,
      cumpleSemanas,
      faltanSemanas,
      anosTrabajoFaltantes,
      fechaCumpleEdad: fechaCumpleEdad.getFullYear(),
      totalCumple: cumpleEdad && cumpleSemanas
    };
  }, [genero, nacimiento, semanasActuales, anoRetiro]);

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/calculadoras" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">Verificador de Pensión</h1>
        <p className="mt-2 text-muted-foreground">
          Proyecta el cumplimiento de requisitos de pensión bajo la Ley 100/1993 y la Reforma 2024.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <SelectInput
            id="genero"
            label="Género"
            value={genero}
            onChange={setGenero}
            options={[
              { value: "hombre", label: "Hombre" },
              { value: "mujer", label: "Mujer" }
            ]}
          />

          <div className="grid gap-4">
            <label htmlFor="nacimiento" className="text-sm font-medium">Fecha de nacimiento</label>
            <input
              id="nacimiento"
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={nacimiento}
              onChange={(e) => setNacimiento(e.target.value)}
            />
          </div>

          <NumberInput
            id="semanas-actuales"
            label="Semanas cotizadas a la fecha"
            value={semanasActuales}
            onChange={setSemanasActuales}
            placeholder="Ej: 850"
          />

          <NumberInput
            id="ano-retiro"
            label="Año estimado de retiro"
            value={anoRetiro}
            onChange={setAnoRetiro}
            placeholder="Ej: 2030"
          />
        </div>

        <div>
          {calculo ? (
            <div className="space-y-6">
              <CalculatorResult
                items={[
                  {
                    label: calculo.totalCumple ? "Estado Requisitos" : "Semanas faltantes",
                    value: calculo.totalCumple ? "PROYECTADO" : `${calculo.faltanSemanas}`,
                    sublabel: calculo.totalCumple ? "Según proyección al retiro" : `Requeridas: ${calculo.semanasRequeridas}`
                  }
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-center">
                  <User className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-xs uppercase text-muted-foreground">Edad al Retiro</p>
                  <p className={`text-xl font-bold ${calculo.cumpleEdad ? "text-foreground" : "text-foreground"}`}>
                    {calculo.edadAlRetiro} años
                  </p>
                  <p className="text-[10px] text-muted-foreground">Meta: {calculo.edadRequerida}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm text-center">
                  <Award className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-xs uppercase text-muted-foreground">Semanas Meta</p>
                  <p className={`text-xl font-bold ${calculo.cumpleSemanas ? "text-foreground" : "text-foreground"}`}>
                    {calculo.semanasRequeridas}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Actuales: {semanasActuales}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Hoja de Ruta</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Edad de jubilación ({calculo.edadRequerida} años):</span>
                    <span className="font-medium">Año {calculo.fechaCumpleEdad}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Años de cotización faltantes:</span>
                    <span className="font-medium">{calculo.anosTrabajoFaltantes.toFixed(1)} años</span>
                  </div>
                  <div className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
                    * Nota: La reducción de semanas para mujeres aplica gradualmente por la Ley 2381/2024. Este cálculo es una proyección informativa.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Ingresa tus datos para ver la proyección de pensión
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 text-foreground bg-muted/50 border border-border/60 rounded-lg p-6">
        <h3 className="mb-4 text-lg font-bold">Cronograma Reducción Semanas (Mujeres)</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {SEMANAS_MUJERES_PROGRESIVO.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border/60 bg-card p-2 text-center shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground">{item.anio}</p>
              <p className="text-sm font-bold">{item.semanas}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Fuente: Ley 2381 de 2024 y Sentencia C-197 de 2023 de la Corte Constitucional.
        </p>
      </div>
    </div>
  );
}
