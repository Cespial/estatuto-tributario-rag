// ── Calendario Tributario 2026 ──
// Source: DIAN Resolucion (typically published late December of prior year)
// Note: These are approximate dates based on typical DIAN patterns.
// Real dates should be verified against the official DIAN resolution for 2026.

export interface DeadlineEntry {
  obligacion: string;
  descripcion: string;
  tipoContribuyente: "grandes" | "juridicas" | "naturales" | "todos";
  periodicidad: "anual" | "bimestral" | "cuatrimestral" | "mensual";
  vencimientos: Array<{
    periodo: string;
    ultimoDigito: string;
    fecha: string; // ISO date
  }>;
}

export const OBLIGACIONES: DeadlineEntry[] = [
  {
    obligacion: "Declaracion de Renta Personas Naturales",
    descripcion: "Declaracion anual del impuesto sobre la renta y complementarios",
    tipoContribuyente: "naturales",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "01-02", fecha: "2026-08-12" },
      { periodo: "AG 2025", ultimoDigito: "03-04", fecha: "2026-08-13" },
      { periodo: "AG 2025", ultimoDigito: "05-06", fecha: "2026-08-14" },
      { periodo: "AG 2025", ultimoDigito: "07-08", fecha: "2026-08-18" },
      { periodo: "AG 2025", ultimoDigito: "09-10", fecha: "2026-08-19" },
      { periodo: "AG 2025", ultimoDigito: "11-12", fecha: "2026-08-20" },
      { periodo: "AG 2025", ultimoDigito: "13-14", fecha: "2026-08-21" },
      { periodo: "AG 2025", ultimoDigito: "15-16", fecha: "2026-08-25" },
      { periodo: "AG 2025", ultimoDigito: "17-18", fecha: "2026-08-26" },
      { periodo: "AG 2025", ultimoDigito: "19-20", fecha: "2026-08-27" },
      { periodo: "AG 2025", ultimoDigito: "21-22", fecha: "2026-08-28" },
      { periodo: "AG 2025", ultimoDigito: "23-24", fecha: "2026-09-01" },
      { periodo: "AG 2025", ultimoDigito: "25-26", fecha: "2026-09-02" },
      { periodo: "AG 2025", ultimoDigito: "27-28", fecha: "2026-09-03" },
      { periodo: "AG 2025", ultimoDigito: "29-30", fecha: "2026-09-04" },
      { periodo: "AG 2025", ultimoDigito: "31-32", fecha: "2026-09-08" },
      { periodo: "AG 2025", ultimoDigito: "33-34", fecha: "2026-09-09" },
      { periodo: "AG 2025", ultimoDigito: "35-36", fecha: "2026-09-10" },
      { periodo: "AG 2025", ultimoDigito: "37-38", fecha: "2026-09-11" },
      { periodo: "AG 2025", ultimoDigito: "39-40", fecha: "2026-09-15" },
      { periodo: "AG 2025", ultimoDigito: "41-42", fecha: "2026-09-16" },
      { periodo: "AG 2025", ultimoDigito: "43-44", fecha: "2026-09-17" },
      { periodo: "AG 2025", ultimoDigito: "45-46", fecha: "2026-09-18" },
      { periodo: "AG 2025", ultimoDigito: "47-48", fecha: "2026-09-22" },
      { periodo: "AG 2025", ultimoDigito: "49-50", fecha: "2026-09-23" },
      { periodo: "AG 2025", ultimoDigito: "51-52", fecha: "2026-09-24" },
      { periodo: "AG 2025", ultimoDigito: "53-54", fecha: "2026-09-25" },
      { periodo: "AG 2025", ultimoDigito: "55-56", fecha: "2026-09-29" },
      { periodo: "AG 2025", ultimoDigito: "57-58", fecha: "2026-09-30" },
      { periodo: "AG 2025", ultimoDigito: "59-60", fecha: "2026-10-01" },
      { periodo: "AG 2025", ultimoDigito: "61-62", fecha: "2026-10-02" },
      { periodo: "AG 2025", ultimoDigito: "63-64", fecha: "2026-10-06" },
      { periodo: "AG 2025", ultimoDigito: "65-66", fecha: "2026-10-07" },
      { periodo: "AG 2025", ultimoDigito: "67-68", fecha: "2026-10-08" },
      { periodo: "AG 2025", ultimoDigito: "69-70", fecha: "2026-10-09" },
      { periodo: "AG 2025", ultimoDigito: "71-72", fecha: "2026-10-14" },
      { periodo: "AG 2025", ultimoDigito: "73-74", fecha: "2026-10-15" },
      { periodo: "AG 2025", ultimoDigito: "75-76", fecha: "2026-10-16" },
      { periodo: "AG 2025", ultimoDigito: "77-78", fecha: "2026-10-20" },
      { periodo: "AG 2025", ultimoDigito: "79-80", fecha: "2026-10-21" },
      { periodo: "AG 2025", ultimoDigito: "81-82", fecha: "2026-10-22" },
      { periodo: "AG 2025", ultimoDigito: "83-84", fecha: "2026-10-23" },
      { periodo: "AG 2025", ultimoDigito: "85-86", fecha: "2026-10-27" },
      { periodo: "AG 2025", ultimoDigito: "87-88", fecha: "2026-10-28" },
      { periodo: "AG 2025", ultimoDigito: "89-90", fecha: "2026-10-29" },
      { periodo: "AG 2025", ultimoDigito: "91-92", fecha: "2026-10-30" },
      { periodo: "AG 2025", ultimoDigito: "93-94", fecha: "2026-11-03" },
      { periodo: "AG 2025", ultimoDigito: "95-96", fecha: "2026-11-04" },
      { periodo: "AG 2025", ultimoDigito: "97-98", fecha: "2026-11-05" },
      { periodo: "AG 2025", ultimoDigito: "99-00", fecha: "2026-11-06" },
    ],
  },
  {
    obligacion: "Declaracion de Renta Personas Juridicas",
    descripcion: "Declaracion anual del impuesto sobre la renta sociedades",
    tipoContribuyente: "juridicas",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-04-14" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-04-15" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-04-16" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-04-17" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-04-20" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-04-21" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-04-22" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-04-23" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-04-24" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-04-27" },
    ],
  },
  {
    obligacion: "Retencion en la Fuente (mensual)",
    descripcion: "Declaracion y pago mensual de retenciones practicadas",
    tipoContribuyente: "todos",
    periodicidad: "mensual",
    vencimientos: [
      { periodo: "Enero 2026", ultimoDigito: "1", fecha: "2026-02-11" },
      { periodo: "Enero 2026", ultimoDigito: "2-9,0", fecha: "2026-02-12" },
      { periodo: "Febrero 2026", ultimoDigito: "1", fecha: "2026-03-11" },
      { periodo: "Febrero 2026", ultimoDigito: "2-9,0", fecha: "2026-03-12" },
    ],
  },
  {
    obligacion: "IVA Bimestral",
    descripcion: "Declaracion bimestral del impuesto sobre las ventas",
    tipoContribuyente: "todos",
    periodicidad: "bimestral",
    vencimientos: [
      { periodo: "Ene-Feb 2026", ultimoDigito: "1", fecha: "2026-03-11" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "2-9,0", fecha: "2026-03-12" },
    ],
  },
];

// Note: Add a disclaimer that dates should be verified against official DIAN resolution
export const CALENDARIO_DISCLAIMER = "Fechas basadas en patrones historicos de la DIAN. Verifique contra la Resolucion oficial de la DIAN para 2026. Ultima actualizacion: Febrero 2026.";
