import Link from "next/link";
import {
  Landmark,
  Receipt,
  Layers,
  Banknote,
  CheckCircle,
  Users,
  ArrowRight,
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
    title: "Retencion en la Fuente",
    description: "Retencion segun concepto, monto y tabla progresiva.",
    icon: Receipt,
  },
  {
    href: "/calculadoras/simple",
    title: "Regimen SIMPLE",
    description: "Impuesto unificado por grupo de actividad economica.",
    icon: Layers,
  },
  {
    href: "/calculadoras/gmf",
    title: "GMF (4x1000)",
    description: "Gravamen a movimientos financieros y exencion 350 UVT.",
    icon: Banknote,
  },
  {
    href: "/calculadoras/debo-declarar",
    title: "Debo Declarar Renta?",
    description: "Verifica si estas obligado a declarar renta.",
    icon: CheckCircle,
  },
  {
    href: "/calculadoras/comparador",
    title: "Comparador de Contratacion",
    description: "Laboral vs Integral vs Servicios.",
    icon: Users,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              Tributaria Colombia
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">
              <span className="font-semibold text-foreground">
                La plataforma tributaria mas completa del pais.
              </span>{" "}
              <span className="text-muted-foreground">
                35 calculadoras, 1,294 articulos del Estatuto Tributario,
                calendario fiscal y asistente con IA.
              </span>
            </p>
          </div>
        </section>

        {/* Stats Row */}
        <section className="px-4 pb-16">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-6 text-center text-sm tracking-wide text-muted-foreground">
            <span>35 Calculadoras</span>
            <span className="text-border">|</span>
            <span>1,294 Articulos ET</span>
            <span className="text-border">|</span>
            <span>Calendario 2026</span>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">
              Herramientas Populares
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_ACCESS.map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group flex flex-col gap-4 rounded-2xl border border-transparent bg-card p-8 shadow-sm transition-all hover:border-border hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <calc.icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-foreground">
                      {calc.title}
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {calc.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/calculadoras"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
              >
                Ver todas las calculadoras
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <section className="bg-muted/30 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">
              Asistente Tributario
            </h2>

            <div className="flex h-[650px] flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg">
              <div className="border-b border-border bg-muted/30 px-5 py-4">
                <h3 className="font-medium text-foreground">
                  Asistente con IA
                </h3>
              </div>
              <ChatContainer />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          <p>
            SuperApp Tributaria Colombia — Herramienta informativa. No
            constituye asesoria tributaria profesional.
          </p>
        </footer>
      </main>
    </div>
  );
}
