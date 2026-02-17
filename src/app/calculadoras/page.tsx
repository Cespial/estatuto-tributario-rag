import type { Metadata } from "next";
import { ArrowLeftRight, Receipt, Landmark, AlertTriangle, Banknote, ShoppingCart, Users, Shield } from "lucide-react";
import { CalculatorCard } from "@/components/calculators/calculator-card";

export const metadata: Metadata = {
  title: "Calculadoras Tributarias | Estatuto Tributario",
  description:
    "Calculadoras tributarias colombianas: conversor UVT, retencion en la fuente, renta personas naturales, sanciones, GMF 4x1000, IVA, comparador de contratacion y aportes a seguridad social.",
  openGraph: {
    title: "Calculadoras Tributarias Colombianas",
    description: "Herramientas de calculo tributario integradas con el Estatuto Tributario de Colombia.",
    type: "website",
    locale: "es_CO",
    siteName: "Estatuto Tributario IA",
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
];

export default function CalculadorasPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Calculadoras Tributarias</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((calc) => (
          <CalculatorCard key={calc.href} {...calc} />
        ))}
      </div>
    </>
  );
}
