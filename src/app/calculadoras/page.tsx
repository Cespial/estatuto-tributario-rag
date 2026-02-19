import type { Metadata } from "next";
import {
  ArrowLeftRight,
  Receipt,
  Landmark,
  AlertTriangle,
  Banknote,
  ShoppingCart,
  Users,
  Shield,
  TrendingUp,
  Gift,
  PieChart,
  Building2,
  Building,
  Gavel,
  CheckCircle,
  FastForward,
  Stamp,
  FileText,
  Clock,
  Calculator,
  Percent,
  Layers,
  Search,
  Wallet,
  TrendingDown,
  Coffee,
  MapPin,
  Ticket,
  Briefcase,
  BadgePercent,
  Factory,
  GitCompare,
  Columns,
  ClipboardList,
  Baby,
} from "lucide-react";
import { CalculatorCard } from "@/components/calculators/calculator-card";

export const metadata: Metadata = {
  title: "Calculadoras Tributarias | SuperApp Tributaria Colombia",
  description:
    "Herramientas tributarias integrales: UVT, retencion, renta, sanciones, GMF, IVA, contratacion, seguridad social, ganancias ocasionales, herencias, dividendos, patrimonio, renta PJ, debo declarar, anticipo, timbre, liquidacion laboral, horas extras, intereses mora, SIMPLE, ICA y mas.",
  openGraph: {
    title: "Calculadoras Tributarias Colombianas",
    description: "35 calculadoras tributarias integradas con el Estatuto Tributario de Colombia.",
    type: "website",
    locale: "es_CO",
    siteName: "SuperApp Tributaria Colombia",
  },
};

const CALCULATORS = [
  {
    href: "/calculadoras/uvt",
    title: "Conversor UVT ↔ COP",
    description: "Convierte entre Unidades de Valor Tributario y pesos colombianos. Historico 2006-2026.",
    icon: ArrowLeftRight,
    articles: ["868"],
  },
  {
    href: "/calculadoras/retencion",
    title: "Retencion en la Fuente",
    description: "Calcula la retencion aplicable segun concepto, monto y tabla progresiva de salarios.",
    icon: Receipt,
    articles: ["392", "401", "383"],
  },
  {
    href: "/calculadoras/renta",
    title: "Renta Personas Naturales",
    description: "Impuesto de renta simplificado con desglose marginal segun Art. 241 ET.",
    icon: Landmark,
    articles: ["241", "206", "336"],
  },
  {
    href: "/calculadoras/sanciones",
    title: "Sancion por Extemporaneidad",
    description: "Calcula sanciones por presentacion extemporanea con reducciones Art. 640.",
    icon: AlertTriangle,
    articles: ["641", "642", "640"],
  },
  {
    href: "/calculadoras/gmf",
    title: "GMF (4×1000)",
    description: "Gravamen a los movimientos financieros con calculo de exencion 350 UVT.",
    icon: Banknote,
    articles: ["871", "879"],
  },
  {
    href: "/calculadoras/iva",
    title: "Referencia IVA",
    description: "Calcula y extrae IVA del 19% y 5%. Referencia rapida exento vs excluido.",
    icon: ShoppingCart,
    articles: ["468", "477", "424"],
  },
  {
    href: "/calculadoras/comparador",
    title: "Comparador de Contratacion",
    description: "Compara Laboral, Salario Integral y Prestacion de Servicios. Costo empresa, neto trabajador y retencion.",
    icon: Users,
    articles: ["383", "241", "905"],
  },
  {
    href: "/calculadoras/seguridad-social",
    title: "Aportes a Seguridad Social",
    description: "Calcula aportes a salud, pension, ARL y parafiscales para dependientes, independientes y salario integral.",
    icon: Shield,
    articles: ["204"],
  },
  {
    href: "/calculadoras/ganancias-ocasionales",
    title: "Ganancias Ocasionales — Inmuebles",
    description: "Calcula el impuesto sobre ganancia por venta de activos fijos con ajuste fiscal Art. 73.",
    icon: TrendingUp,
    articles: ["299", "300", "314"],
  },
  {
    href: "/calculadoras/herencias",
    title: "Herencias y Donaciones",
    description: "Impuesto sobre herencias, legados y donaciones con exenciones por parentesco.",
    icon: Gift,
    articles: ["302", "307", "314"],
  },
  {
    href: "/calculadoras/dividendos",
    title: "Dividendos Personas Naturales",
    description: "Impuesto sobre dividendos con doble capa: gravados y no gravados a nivel societario.",
    icon: PieChart,
    articles: ["242", "49"],
  },
  {
    href: "/calculadoras/patrimonio",
    title: "Impuesto al Patrimonio",
    description: "Impuesto progresivo sobre patrimonio liquido 2026 (umbral 40,000 UVT).",
    icon: Building2,
    articles: ["292-2", "296-3"],
  },
  {
    href: "/calculadoras/renta-juridicas",
    title: "Renta Personas Juridicas",
    description: "Impuesto de renta corporativo con tarifas sectoriales y sobretasa financiero.",
    icon: Building,
    articles: ["240", "240-1"],
  },
  {
    href: "/calculadoras/sanciones-ampliadas",
    title: "Sanciones Tributarias",
    description: "Sanciones por no declarar, correccion e inexactitud con reduccion Art. 640.",
    icon: Gavel,
    articles: ["643", "644", "647"],
  },
  {
    href: "/calculadoras/debo-declarar",
    title: "¿Debo Declarar Renta?",
    description: "Verifica si esta obligado a declarar renta comparando 5 topes en UVT.",
    icon: CheckCircle,
    articles: ["592", "593"],
  },
  {
    href: "/calculadoras/anticipo",
    title: "Anticipo de Renta",
    description: "Calcula el anticipo del impuesto de renta para el siguiente periodo gravable.",
    icon: FastForward,
    articles: ["807"],
  },
  {
    href: "/calculadoras/timbre",
    title: "Impuesto de Timbre",
    description: "Impuesto del 1% sobre documentos que superen 6,000 UVT (Decreto 175/2025).",
    icon: Stamp,
    articles: ["519", "520"],
  },
  {
    href: "/calculadoras/liquidacion-laboral",
    title: "Liquidacion de Contrato Laboral",
    description: "Cesantias, intereses, prima, vacaciones e indemnizacion por terminacion de contrato.",
    icon: FileText,
    articles: [],
  },
  {
    href: "/calculadoras/horas-extras",
    title: "Horas Extras y Recargos",
    description: "Calcula extras diurnas, nocturnas, dominicales y festivos con reforma Ley 2466/2025.",
    icon: Clock,
    articles: [],
  },
  {
    href: "/calculadoras/retencion-salarios",
    title: "Retencion Salarios Proc. 1",
    description: "Retencion mensual con depuracion completa Art. 388: deducciones, exentas y limites.",
    icon: Calculator,
    articles: ["383", "388"],
  },
  {
    href: "/calculadoras/intereses-mora",
    title: "Intereses Moratorios DIAN",
    description: "Calcula intereses de mora sobre deudas tributarias con tasa de usura vigente.",
    icon: Percent,
    articles: ["634", "635"],
  },
  {
    href: "/calculadoras/simple",
    title: "Regimen SIMPLE (RST)",
    description: "Impuesto unificado SIMPLE por grupo de actividad con comparativo vs ordinario.",
    icon: Layers,
    articles: ["903", "908"],
  },
  {
    href: "/calculadoras/beneficio-auditoria",
    title: "Beneficio de Auditoria",
    description: "Verifica si aplica reduccion del periodo de firmeza (6 o 12 meses).",
    icon: Search,
    articles: ["689-3"],
  },
  {
    href: "/calculadoras/pension",
    title: "Verificador de Pension",
    description: "Verifica requisitos de edad y semanas cotizadas con reforma pensional 2024.",
    icon: Wallet,
    articles: [],
  },
  {
    href: "/calculadoras/depreciacion",
    title: "Depreciacion Fiscal",
    description: "Deduccion anual por depreciacion de activos fijos con tabla de vida util.",
    icon: TrendingDown,
    articles: ["128", "137"],
  },
  {
    href: "/calculadoras/consumo",
    title: "Impuesto al Consumo",
    description: "Impuesto nacional al consumo para restaurantes, telefonia y vehiculos.",
    icon: Coffee,
    articles: ["512-1"],
  },
  {
    href: "/calculadoras/ica",
    title: "Impuesto ICA (Industria y Comercio)",
    description: "Calcula el ICA con el formulario oficial de 38 renglones. Tarifas por municipio, avisos, sobretasas y pronto pago.",
    icon: MapPin,
    articles: [],
  },
  {
    href: "/calculadoras/ganancias-loterias",
    title: "Ganancias Ocasionales — Loterías",
    description: "Impuesto del 20% sobre premios de loterías, rifas y apuestas (Art. 304 ET).",
    icon: Ticket,
    articles: ["304", "317"],
  },
  {
    href: "/calculadoras/dividendos-juridicas",
    title: "Dividendos Personas Jurídicas",
    description: "Tarifa del 7.5% para nacionales y 20% para extranjeros (Art. 242-1 ET).",
    icon: Briefcase,
    articles: ["242-1", "245"],
  },
  {
    href: "/calculadoras/descuentos-tributarios",
    title: "Descuentos Tributarios",
    description: "IVA activos productivos, donaciones e impuesto exterior (Art. 254-259 ET).",
    icon: BadgePercent,
    articles: ["254", "257", "258-1"],
  },
  {
    href: "/calculadoras/zonas-francas",
    title: "Zonas Francas",
    description: "Tarifa preferencial del 20% con plan de exportaciones (Art. 240-1 ET).",
    icon: Factory,
    articles: ["240-1"],
  },
  {
    href: "/calculadoras/comparacion-patrimonial",
    title: "Comparación Patrimonial",
    description: "Detecta renta no justificada por incremento patrimonial (Art. 236-239 ET).",
    icon: GitCompare,
    articles: ["236", "239"],
  },
  {
    href: "/calculadoras/comparador-regimenes",
    title: "Comparador Ordinario vs SIMPLE",
    description: "Comparación lado a lado de carga tributaria total entre regímenes.",
    icon: Columns,
    articles: ["241", "908"],
  },
  {
    href: "/calculadoras/nomina-completa",
    title: "Nómina Completa",
    description: "Desglose de prestaciones, seguridad social y parafiscales por empleado.",
    icon: ClipboardList,
    articles: ["204"],
  },
  {
    href: "/calculadoras/licencia-maternidad",
    title: "Licencia Maternidad y Paternidad",
    description: "Duración y valor con reforma Ley 2114/2021 y Ley 2365/2024.",
    icon: Baby,
    articles: [],
  },
];

export default function CalculadorasPage() {
  return (
    <>
      <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">
        Calculadoras Tributarias
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        35 herramientas de calculo tributario integradas con el Estatuto Tributario de Colombia.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((calc) => (
          <CalculatorCard key={calc.href} {...calc} />
        ))}
      </div>
    </>
  );
}
