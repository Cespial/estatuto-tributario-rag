import assert from 'node:assert';
import { calcularICA, validarBalanceICA } from '../calculadora-ica';
import { MUNICIPIOS_ICA } from '../../config/ica-data';
import type { MunicipioICA, BalanceICA } from '../../config/ica-data';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try { 
    fn(); 
    passed++; 
    console.log('  PASS: ' + name); 
  } catch (e: unknown) { 
    failed++; 
    const error = e as Error;
    console.log('  FAIL: ' + name + ' — ' + error.message); 
    if (error.stack) console.error(error.stack);
  }
}

function getMunicipio(id: string): MunicipioICA {
  const m = MUNICIPIOS_ICA.find(m => m.id === id);
  if (!m) throw new Error(`Municipio ${id} no encontrado`);
  return m;
}

function makeBalance(overrides: Partial<BalanceICA>): BalanceICA {
  return {
    ingresosTotalesPais: 0,
    ingresosFueraMunicipio: 0,
    devoluciones: 0,
    exportacionesYActivosFijos: 0,
    actividadesExcluidasNoSujetas: 0,
    actividadesExentas: 0,
    ingresosPorActividad: [],
    retencionesPracticadas: 0,
    autorretenciones: 0,
    anticipoAnterior: 0,
    saldoFavorAnterior: 0,
    ...overrides,
  };
}

console.log('\n=== Tests Calculadora ICA ===\n');

// CASO 1: Básico Cisneros
test('Caso 1: Básico Cisneros — ICA + avisos + bomberil', () => {
  const m = getMunicipio('cisneros');
  const b = makeBalance({
    ingresosTotalesPais: 100_000_000,
    ingresosPorActividad: [{ codigoActividad: '8230', descripcion: 'Eventos', tarifa: 10, ingresos: 100_000_000 }],
  });
  const r = calcularICA(m, b);
  assert.strictEqual(r.renglon15, 100_000_000, 'R15 ingresos gravables');
  assert.strictEqual(r.renglon17, 1_000_000, 'R17 impuesto actividades');
  assert.strictEqual(r.renglon20, 1_000_000, 'R20 total ICA');
  assert.strictEqual(r.renglon21, 150_000, 'R21 avisos 15%');
  assert.strictEqual(r.renglon23, 30_000, 'R23 bomberil 3% ICA');
  assert.strictEqual(r.renglon25, 1_180_000, 'R25 total a cargo');
});

// CASO 2: Dos actividades
test('Caso 2: Dos actividades Cisneros', () => {
  const m = getMunicipio('cisneros');
  const b = makeBalance({
    ingresosTotalesPais: 200_000_000,
    ingresosPorActividad: [
      { codigoActividad: '8230', descripcion: 'Eventos', tarifa: 10, ingresos: 120_000_000 },
      { codigoActividad: '4711', descripcion: 'Comercio', tarifa: 10, ingresos: 80_000_000 },
    ],
  });
  const r = calcularICA(m, b);
  assert.strictEqual(r.renglon17, 2_000_000, 'R17 = 1.2M + 0.8M');
});

// CASO 3: Con retenciones Bogotá
test('Caso 3: Bogotá con retenciones', () => {
  const m = getMunicipio('bogota');
  const b = makeBalance({
    ingresosTotalesPais: 500_000_000,
    ingresosPorActividad: [{ codigoActividad: '4711', descripcion: 'Comercio', tarifa: 11.04, ingresos: 500_000_000 }],
    retencionesPracticadas: 1_000_000,
  });
  const r = calcularICA(m, b);
  assert.strictEqual(r.renglon17, 5_520_000, 'R17 = 500M × 11.04‰');
  assert.ok((r.renglon25 ?? 0) > r.renglon17, 'R25 > R17 por sobretasas');
  assert.ok(r.renglon33 > 0, 'Saldo a cargo (retenciones < impuesto)');
});

// CASO 4: Saldo a favor
test('Caso 4: Saldo a favor por retenciones altas', () => {
  const m = getMunicipio('cisneros');
  const b = makeBalance({
    ingresosTotalesPais: 50_000_000,
    ingresosPorActividad: [{ codigoActividad: '8230', descripcion: 'Eventos', tarifa: 10, ingresos: 50_000_000 }],
    retencionesPracticadas: 2_000_000,
  });
  const r = calcularICA(m, b);
  assert.ok(r.renglon33 < 0, 'R33 negativo = saldo a favor');
  assert.ok(r.renglon34 > 0, 'R34 saldo a favor');
  assert.strictEqual(r.renglon35, 0, 'R35 = 0 cuando saldo a favor');
  assert.strictEqual(r.renglon38, 0, 'R38 = 0 cuando saldo a favor');
});

// CASO 5: Pronto pago
test('Caso 5: Descuento pronto pago Cisneros 8%', () => {
  const m = getMunicipio('cisneros');
  const b = makeBalance({
    ingresosTotalesPais: 100_000_000,
    ingresosPorActividad: [{ codigoActividad: '8230', descripcion: 'Eventos', tarifa: 10, ingresos: 100_000_000 }],
  });
  const r = calcularICA(m, b);
  const descuento = Math.round(r.renglon35 * 0.08);
  assert.strictEqual(r.renglon36, descuento, 'R36 = R35 × 8%');
  assert.strictEqual(r.renglon38, r.renglon35 - r.renglon36, 'R38 = R35 - R36');
});

// CASO 6: Devoluciones reducen base
test('Caso 6: Devoluciones reducen base gravable', () => {
  const m = getMunicipio('cisneros');
  const b = makeBalance({
    ingresosTotalesPais: 100_000_000,
    devoluciones: 10_000_000,
    ingresosPorActividad: [{ codigoActividad: '8230', descripcion: 'Eventos', tarifa: 10, ingresos: 90_000_000 }],
  });
  const r = calcularICA(m, b);
  assert.strictEqual(r.renglon15, 90_000_000, 'R15 = 100M - 10M devoluciones');
  assert.strictEqual(r.renglon17, 900_000, 'R17 = 90M × 10‰');
});

// CASO 7: Ingresos fuera del municipio
test('Caso 7: Ingresos fuera reducen base', () => {
  const m = getMunicipio('cisneros');
  const b = makeBalance({
    ingresosTotalesPais: 500_000_000,
    ingresosFueraMunicipio: 400_000_000,
    ingresosPorActividad: [{ codigoActividad: '8230', descripcion: 'Eventos', tarifa: 10, ingresos: 100_000_000 }],
  });
  const r = calcularICA(m, b);
  assert.strictEqual(r.renglon10, 100_000_000, 'R10 = 500M - 400M');
  assert.strictEqual(r.renglon15, 100_000_000, 'R15 = R10 sin deducciones');
});

// CASO 8: Bomberil sobre ICA+AVISOS (Bogotá)
test('Caso 8: Bomberil sobre ICA+AVISOS en Bogotá', () => {
  const m = getMunicipio('bogota');
  const b = makeBalance({
    ingresosTotalesPais: 100_000_000,
    ingresosPorActividad: [{ codigoActividad: '4711', descripcion: 'Comercio', tarifa: 11.04, ingresos: 100_000_000 }],
  });
  const r = calcularICA(m, b);
  const expectedBomberil = Math.round((r.renglon20 + r.renglon21) * 0.015);
  assert.strictEqual(r.renglon23, expectedBomberil, 'R23 = (ICA+avisos) × 1.5%');
});

// CASO 9: Validación sin actividades
test('Caso 9: Validación rechaza balance sin actividades', () => {
  const b = makeBalance({ ingresosTotalesPais: 100_000_000 });
  const v = validarBalanceICA(b);
  const errores = v.errores;
  assert.ok(errores.length > 0, 'Debe tener errores');
  assert.ok(errores.some((e: string) => e.toLowerCase().includes('actividad')), 'Error menciona actividad');
});

// CASO 10: Anticipo (si algún municipio lo tiene)
test('Caso 10: Anticipo siguiente periodo', () => {
  const m: MunicipioICA = {
    id: 'test-anticipo', nombre: 'Test', departamento: 'Test',
    tarifas: {
      actividadPrincipal: { codigo: 'TEST', descripcion: 'Test', tarifa: 10, tipoActividad: 'COMERCIAL' },
      actividadesAdicionales: [],
    },
    avisosYTableros: { aplica: false, porcentaje: 0 },
    sobretasaBomberil: { aplica: false, porcentaje: 0, base: 'ICA' },
    sobretasaSeguridad: { aplica: false, porcentaje: 0 },
    anticipo: { aplica: true, porcentaje: 30 },
    descuentoProntoPago: { aplica: false, porcentaje: 0 },
  };
  const b = makeBalance({
    ingresosTotalesPais: 100_000_000,
    ingresosPorActividad: [{ codigoActividad: 'TEST', descripcion: 'Test', tarifa: 10, ingresos: 100_000_000 }],
  });
  const r = calcularICA(m, b);
  assert.strictEqual(r.renglon30, Math.round(r.renglon25 * 0.30), 'R30 = R25 × 30%');
  assert.ok(r.renglon33 > r.renglon25, 'R33 > R25 por anticipo sumado');
});

console.log('\n' + '='.repeat(40));
console.log('Resultado: ' + passed + '/' + (passed + failed) + ' tests passed');
if (failed > 0) process.exit(1);
