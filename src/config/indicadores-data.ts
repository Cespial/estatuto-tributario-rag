// ── Indicadores y Cifras Tributarias 2026 ──

export interface Indicador {
  categoria: string;
  items: Array<{
    nombre: string;
    valor: string;
    valorNumerico?: number;
    notas?: string;
    articulo?: string;
  }>;
}

export const INDICADORES_2026: Indicador[] = [
  {
    categoria: "Valores Basicos",
    items: [
      { nombre: "UVT 2026", valor: "$52,374", valorNumerico: 52374, notas: "Resolucion DIAN 001264/2025", articulo: "868" },
      { nombre: "SMLMV 2026", valor: "$1,750,905", valorNumerico: 1750905, notas: "Decreto 0025/2025" },
      { nombre: "Auxilio de Transporte 2026", valor: "$249,095", valorNumerico: 249095, notas: "Decreto 0026/2025" },
      { nombre: "Total minimo (SMLMV + Aux)", valor: "$2,000,000", valorNumerico: 2000000 },
      { nombre: "Salario integral minimo", valor: "$22,761,765", valorNumerico: 22761765, notas: "13 SMLMV" },
    ],
  },
  {
    categoria: "Topes Declarar Renta PN (AG 2025)",
    items: [
      { nombre: "Patrimonio bruto", valor: "4,500 UVT ($224,095,500)", notas: "UVT 2025 = $49,799", articulo: "592" },
      { nombre: "Ingresos brutos", valor: "1,400 UVT ($69,718,600)", articulo: "593" },
      { nombre: "Consumos tarjeta credito", valor: "1,400 UVT ($69,718,600)", articulo: "594-3" },
      { nombre: "Compras y consumos", valor: "1,400 UVT ($69,718,600)", articulo: "594-3" },
      { nombre: "Consignaciones bancarias", valor: "1,400 UVT ($69,718,600)", articulo: "594-3" },
    ],
  },
  {
    categoria: "Tarifas Impuesto de Renta",
    items: [
      { nombre: "Personas naturales (max)", valor: "0% - 39%", notas: "Tabla progresiva Art. 241", articulo: "241" },
      { nombre: "Personas juridicas (general)", valor: "35%", articulo: "240" },
      { nombre: "Sector financiero", valor: "50%", notas: "35% + 15% sobretasa (Decreto 1474/2025)", articulo: "240" },
      { nombre: "Zonas francas (exportacion)", valor: "20%", articulo: "240-1" },
      { nombre: "Ganancias ocasionales", valor: "15%", articulo: "314" },
      { nombre: "Dividendos PN (max)", valor: "20%", notas: "Sobre >1,090 UVT", articulo: "242" },
    ],
  },
  {
    categoria: "Limites Deducciones y Exenciones PN",
    items: [
      { nombre: "Rentas exentas maximo", valor: "790 UVT ($41,375,460)", notas: "Ley 2277/2022", articulo: "206" },
      { nombre: "Deducciones + exentas maximo", valor: "1,340 UVT ($70,181,160)", articulo: "336" },
      { nombre: "Limite global", valor: "40% del ingreso neto", articulo: "336" },
      { nombre: "Dependientes", valor: "72 UVT ($3,770,928), max 4", articulo: "387" },
      { nombre: "Medicina prepagada", valor: "16 UVT/mes ($838,784)", articulo: "387" },
    ],
  },
  {
    categoria: "Seguridad Social",
    items: [
      { nombre: "Salud total", valor: "12.5% (4% trabajador + 8.5% empleador)" },
      { nombre: "Pension total", valor: "16% (4% trabajador + 12% empleador)" },
      { nombre: "ARL Clase I (minima)", valor: "0.522% (empleador)" },
      { nombre: "IBC minimo", valor: "1 SMLMV ($1,750,905)" },
      { nombre: "IBC maximo", valor: "25 SMLMV ($43,772,625)" },
      { nombre: "Exoneracion Art. 114-1", valor: "IBC < 10 SMLMV", notas: "Salud emp., SENA, ICBF", articulo: "114-1" },
    ],
  },
  {
    categoria: "Otros Impuestos",
    items: [
      { nombre: "IVA general", valor: "19%", articulo: "468" },
      { nombre: "IVA reducido", valor: "5%", articulo: "468-1" },
      { nombre: "GMF (4x1000)", valor: "0.4%", articulo: "871" },
      { nombre: "GMF exencion mensual", valor: "350 UVT ($18,330,900)", articulo: "879" },
      { nombre: "Timbre", valor: "1% (> 6,000 UVT)", notas: "Decreto 175/2025", articulo: "519" },
      { nombre: "Patrimonio umbral", valor: "40,000 UVT", notas: "Decreto 1474/2025", articulo: "292-2" },
      { nombre: "Sancion minima", valor: "10 UVT ($523,740)", articulo: "639" },
    ],
  },
  {
    categoria: "Parafiscales",
    items: [
      { nombre: "SENA", valor: "2%", notas: "Exonerable Art. 114-1" },
      { nombre: "ICBF", valor: "3%", notas: "Exonerable Art. 114-1" },
      { nombre: "Caja Compensacion (CCF)", valor: "4%", notas: "Siempre se paga" },
    ],
  },
  {
    categoria: "Prestaciones Sociales (provision mensual)",
    items: [
      { nombre: "Cesantias", valor: "8.33% (1 mes/ano)" },
      { nombre: "Intereses cesantias", valor: "1% (12% anual sobre cesantias)" },
      { nombre: "Prima de servicios", valor: "8.33% (1 mes/ano, 2 pagos)" },
      { nombre: "Vacaciones", valor: "4.17% (15 dias habiles/ano)" },
    ],
  },
];
