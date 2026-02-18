import Link from "next/link";
import {
  Landmark,
  Receipt,
  Layers,
  Banknote,
  CheckCircle,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { ChatContainer } from "@/components/chat/chat-container";

const QUICK_ACCESS = [
  {
    href: "/calculadoras/renta",
    title: "Renta Personas Naturales",
    description: "Impuesto de renta personas naturales Art. 241 ET.",
    icon: Landmark,
  },
  {
    href: "/calculadoras/retencion",
    title: "Retención en la Fuente",
    description: "Retención según concepto, monto y tabla progresiva.",
    icon: Receipt,
  },
  {
    href: "/calculadoras/simple",
    title: "Régimen SIMPLE",
    description: "Impuesto unificado por grupo de actividad económica.",
    icon: Layers,
  },
  {
    href: "/calculadoras/gmf",
    title: "GMF (4x1000)",
    description: "Gravamen a movimientos financieros y exención 350 UVT.",
    icon: Banknote,
  },
  {
    href: "/calculadoras/debo-declarar",
    title: "¿Debo Declarar Renta?",
    description: "Verifica si estás obligado a declarar renta.",
    icon: CheckCircle,
  },
  {
    href: "/calculadoras/comparador",
    title: "Comparador de Contratación",
    description: "Laboral vs Integral vs Servicios.",
    icon: Users,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-12 text-center md:py-20">
          <div className="container mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              SuperApp Tributaria <span className="text-primary">Colombia</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Toda la normativa y herramientas de cálculo en un solo lugar.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="rounded-full bg-muted px-4 py-1.5 border border-border shadow-sm">
                🚀 35 calculadoras
              </span>
              <span className="rounded-full bg-muted px-4 py-1.5 border border-border shadow-sm">
                📚 1,294 artículos ET
              </span>
              <span className="rounded-full bg-muted px-4 py-1.5 border border-border shadow-sm">
                📅 Calendario 2026
              </span>
            </div>
          </div>
        </section>

        {/* Popular Calculators Grid */}
        <section className="container mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-8 text-2xl font-bold">Calculadoras Populares</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS.map((calc) => (
              <Link 
                key={calc.href} 
                href={calc.href}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <calc.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground">{calc.title}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{calc.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/calculadoras" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
              Ver todas las calculadoras
            </Link>
          </div>
        </section>

        {/* Chat Section */}
        <section className="container mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-xl border border-border bg-card p-1 shadow-xl overflow-hidden h-[600px] flex flex-col">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <h3 className="font-bold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Asistente Tributario IA
              </h3>
            </div>
            <ChatContainer />
          </div>
        </section>
      </main>
    </div>
  );
}
