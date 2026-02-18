/**
 * Motor de cálculo del Impuesto de Industria y Comercio (ICA)
 * Implementa la lógica del Formulario Único Nacional (38 renglones)
 * Usa Decimal.js para precisión financiera
 */

import { Decimal } from "decimal.js";
import type { MunicipioICA, BalanceICA, ResultadoICA } from "@/config/ica-data";

function redondear(valor: Decimal, aMil: boolean = false): Decimal {
  if (aMil) {
    return valor.dividedBy(1000).round().times(1000);
  }
  return valor.round();
}

/**
 * Formatea un número como moneda colombiana
 */
function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function calcularICA(
  municipio: MunicipioICA,
  balance: BalanceICA
): ResultadoICA {
  const aMil = municipio.redondeoAMil ?? false;
  const d = (val?: number) => new Decimal(val || 0);
  const r = (val: Decimal) => redondear(val, aMil);

  // === SECCION B: BASE GRAVABLE ===
  const renglon8 = r(d(balance.ingresosTotalesPais));
  const renglon9 = r(d(balance.ingresosFueraMunicipio));
  const renglon10 = r(renglon8.minus(renglon9));
  const renglon11 = r(d(balance.devoluciones));
  const renglon12 = r(d(balance.exportacionesYActivosFijos));
  const renglon13 = r(d(balance.actividadesExcluidasNoSujetas));
  const renglon14 = r(d(balance.actividadesExentas));
  
  // Protección: R15 no puede ser negativo
  const renglon15raw = renglon10.minus(renglon11).minus(renglon12).minus(renglon13).minus(renglon14);
  const renglon15 = renglon15raw.isNegative() ? new Decimal(0) : r(renglon15raw);

  // === SECCION C: DISCRIMINACION DE ACTIVIDADES ===
  const actividades = balance.ingresosPorActividad.map((ing) => {
    const ingresosGravados = r(d(ing.ingresos));
    const tarifa = new Decimal(ing.tarifa);
    const impuestoICA = r(ingresosGravados.times(tarifa).dividedBy(1000));
    return {
      nombre: ing.descripcion,
      codigo: ing.codigoActividad,
      ingresos: ingresosGravados.toNumber(),
      tarifa: ing.tarifa,
      impuesto: impuestoICA.toNumber(),
    };
  });

  const renglon16 = r(
    actividades.reduce((sum, a) => sum.plus(d(a.ingresos)), new Decimal(0))
  );
  const renglon17 = r(
    actividades.reduce((sum, a) => sum.plus(d(a.impuesto)), new Decimal(0))
  );

  // === SECCION D: LIQUIDACION ===
  const renglon19 = r(d(balance.generacionEnergia)); // R19 - Ley 56/1981
  const renglon20 = renglon17.plus(renglon19); // R20 = R17 + R19

  // Renglon 21: Avisos y Tableros
  const renglon21 = municipio.avisosYTableros.aplica
    ? r(renglon20.times(municipio.avisosYTableros.porcentaje).dividedBy(100))
    : new Decimal(0);

  const renglon22 = r(d(balance.unidadesFinanciero)); // R22 - Unidades adicional financiero

  // Renglon 23: Sobretasa Bomberil (Ley 1575/2012)
  let renglon23 = new Decimal(0);
  if (municipio.sobretasaBomberil.aplica) {
    let baseBomberil = new Decimal(0);
    switch (municipio.sobretasaBomberil.base) {
      case "ICA":
        baseBomberil = renglon20;
        break;
      case "AVISOS":
        baseBomberil = renglon21;
        break;
      case "ICA+AVISOS":
        baseBomberil = renglon20.plus(renglon21);
        break;
    }
    renglon23 = r(baseBomberil.times(municipio.sobretasaBomberil.porcentaje).dividedBy(100));
  }

  // Renglon 24: Sobretasa de Seguridad
  const renglon24 = municipio.sobretasaSeguridad.aplica
    ? r(renglon20.times(municipio.sobretasaSeguridad.porcentaje).dividedBy(100))
    : new Decimal(0);

  // Renglon 25: Total impuesto a cargo
  const renglon25 = r(renglon20.plus(renglon21).plus(renglon22).plus(renglon23).plus(renglon24));

  const renglon26 = r(d(balance.exenciones)); // R26 - Exenciones manuales

  // Renglon 27-29: Retenciones, autorretenciones, anticipo anterior
  const renglon27 = r(d(balance.retencionesPracticadas));
  const renglon28 = r(d(balance.autorretenciones));
  const renglon29 = r(d(balance.anticipoAnterior));

  // Renglon 30: Anticipo año siguiente
  const renglon30 = municipio.anticipo.aplica
    ? r(renglon25.times(municipio.anticipo.porcentaje).dividedBy(100))
    : new Decimal(0);

  const renglon31 = r(d(balance.sanciones)); // R31 - Sanciones
  const renglon32 = r(d(balance.saldoFavorAnterior)); // R32 - Saldo favor anterior

  // Renglon 33: Total saldo a cargo = 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32
  const renglon33 = r(
    renglon25
      .minus(renglon26)
      .minus(renglon27)
      .minus(renglon28)
      .minus(renglon29)
      .plus(renglon30)
      .plus(renglon31)
      .minus(renglon32)
  );

  // Renglon 34: Saldo a favor (si renglon 33 < 0)
  const renglon34 = renglon33.isNegative() ? renglon33.abs() : new Decimal(0);

  // === SECCION E: PAGO ===
  const renglon35 = renglon33.isPositive() ? renglon33 : new Decimal(0);

  // Renglon 36: Descuento pronto pago
  const renglon36 = municipio.descuentoProntoPago.aplica
    ? r(renglon35.times(municipio.descuentoProntoPago.porcentaje).dividedBy(100))
    : new Decimal(0);

  const renglon37 = r(d(balance.interesesMora)); // R37 - Intereses mora

  // Renglon 38: Total a pagar = 35 - 36 + 37
  const renglon38 = r(renglon35.minus(renglon36).plus(renglon37));

  return {
    renglon8: renglon8.toNumber(),
    renglon9: renglon9.toNumber(),
    renglon10: renglon10.toNumber(),
    renglon11: renglon11.toNumber(),
    renglon12: renglon12.toNumber(),
    renglon13: renglon13.toNumber(),
    renglon14: renglon14.toNumber(),
    renglon15: renglon15.toNumber(),
    actividades,
    renglon16: renglon16.toNumber(),
    renglon17: renglon17.toNumber(),
    renglon19: renglon19.toNumber(),
    renglon20: renglon20.toNumber(),
    renglon21: renglon21.toNumber(),
    renglon22: renglon22.toNumber(),
    renglon23: renglon23.toNumber(),
    renglon24: renglon24.toNumber(),
    renglon25: renglon25.toNumber(),
    renglon26: renglon26.toNumber(),
    renglon27: renglon27.toNumber(),
    renglon28: renglon28.toNumber(),
    renglon29: renglon29.toNumber(),
    renglon30: renglon30.toNumber(),
    renglon31: renglon31.toNumber(),
    renglon32: renglon32.toNumber(),
    renglon33: renglon33.toNumber(),
    renglon34: renglon34.toNumber(),
    renglon35: renglon35.toNumber(),
    renglon36: renglon36.toNumber(),
    renglon37: renglon37.toNumber(),
    renglon38: renglon38.toNumber(),
  };
}

/**
 * Valida coherencia del balance ICA y retorna errores y advertencias
 */
export function validarBalanceICA(balance: BalanceICA): { errores: string[]; warnings: string[] } {
  const errores: string[] = [];
  const warnings: string[] = [];
  const d = (val?: number) => new Decimal(val || 0);

  // ERRORES
  if (balance.ingresosTotalesPais < 0) {
    errores.push("Los ingresos totales del país no pueden ser negativos");
  }
  if (balance.ingresosFueraMunicipio < 0) {
    errores.push("Los ingresos fuera del municipio no pueden ser negativos");
  }
  if (balance.ingresosFueraMunicipio > balance.ingresosTotalesPais) {
    errores.push("Los ingresos fuera del municipio no pueden superar los ingresos totales del país");
  }
  if (balance.ingresosPorActividad.length === 0) {
    errores.push("Debe haber al menos una actividad económica con ingresos");
  }
  balance.ingresosPorActividad.forEach(a => {
    if (a.ingresos < 0) {
      errores.push(`La actividad ${a.codigoActividad} tiene ingresos negativos`);
    }
  });

  // WARNINGS
  balance.ingresosPorActividad.forEach(a => {
    if (a.tarifa === 0) {
      warnings.push(`Actividad ${a.codigoActividad} tiene tarifa 0`);
    }
    if (a.tarifa > 15) {
      warnings.push(`Actividad ${a.codigoActividad} tiene tarifa inusualmente alta (${a.tarifa}‰)`);
    }
  });

  if (balance.ingresosFueraMunicipio > balance.ingresosTotalesPais * 0.95) {
    warnings.push("Más del 95% de ingresos fuera del municipio");
  }

  const r15raw = d(balance.ingresosTotalesPais)
    .minus(d(balance.ingresosFueraMunicipio))
    .minus(d(balance.devoluciones))
    .minus(d(balance.exportacionesYActivosFijos))
    .minus(d(balance.actividadesExcluidasNoSujetas))
    .minus(d(balance.actividadesExentas));

  if (r15raw.isNegative()) {
    warnings.push("Deducciones superan ingresos en el municipio — base gravable será $0");
  }

  const sumaActividades = balance.ingresosPorActividad.reduce((s, a) => s.plus(d(a.ingresos)), new Decimal(0));
  const ingresosGravables = Decimal.max(0, r15raw);

  if (sumaActividades.minus(ingresosGravables).abs().greaterThan(1)) {
    warnings.push(
      `La suma de ingresos por actividad ($${formatearMoneda(sumaActividades.toNumber())}) difiere de los ingresos gravables calculados ($${formatearMoneda(ingresosGravables.toNumber())})`
    );
  }

  // Simulación rápida de impuesto para warning de retenciones
  const totalRetenciones = d(balance.retencionesPracticadas).plus(d(balance.autorretenciones));
  const impuestoEstimado = sumaActividades.times(10).dividedBy(1000); // Promedio 10 por mil
  if (totalRetenciones.greaterThan(impuestoEstimado) && impuestoEstimado.greaterThan(0)) {
    warnings.push("Retenciones superan impuesto — probable saldo a favor");
  }

  return { errores, warnings };
}

/**
 * Extrae resumen ejecutivo del resultado para visualización de UI
 */
/*
export function calcularResumenICA(resultado: ResultadoICA): {
  baseGravable: number;
  totalICA: number;
  totalSobretasas: number;
  totalImpuestoCargo: number;
  totalDescuentos: number;
  saldoNeto: number;
  totalPagar: number;
  esSaldoFavor: boolean;
} {
  return {
    baseGravable: resultado.renglon15,
    totalICA: resultado.renglon20,
    totalSobretasas: resultado.renglon21 + resultado.renglon23 + resultado.renglon24,
    totalImpuestoCargo: resultado.renglon25,
    totalDescuentos: resultado.renglon27 + resultado.renglon28 + resultado.renglon29 + resultado.renglon32,
    saldoNeto: resultado.renglon33,
    totalPagar: resultado.renglon38,
    esSaldoFavor: resultado.renglon33 < 0,
  };
}
*/
