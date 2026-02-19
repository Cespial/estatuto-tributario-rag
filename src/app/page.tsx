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
import { HeroVideo } from "@/components/hero/hero-video";

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
      {/* ──────────────────────────────────────────────
          HERO — Full-viewport cinematic video (Harvey.ai style)
         ────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-black">
        {/* Cinematic video background with crossfade */}
        <HeroVideo />

        {/* Header overlaid on video — transparent */}
        <div className="relative z-20">
          <Header variant="transparent" />
        </div>

        {/* Hero content — left-aligned like Harvey.ai */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-6xl px-6 pb-32 md:px-8">
            <h1 className="max-w-2xl font-[family-name:var(--font-playfair)] text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
              Tributaria
              <br />
              Colombia
            </h1>

            <p className="mt-8 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              La plataforma tributaria mas completa del pais.
              35 calculadoras, 1,294 articulos del Estatuto Tributario,
              calendario fiscal y asistente con IA.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/calculadoras"
                className="inline-flex items-center gap-2 rounded-none border border-white bg-white px-8 py-4 text-sm font-medium tracking-wide text-black transition-all hover:bg-white/90"
              >
                Explorar Calculadoras
              </Link>
              <Link
                href="#asistente"
                className="inline-flex items-center gap-2 rounded-none border border-white/40 px-8 py-4 text-sm font-medium tracking-wide text-white transition-all hover:border-white hover:bg-white/10"
              >
                Asistente IA
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom stats bar — like Harvey.ai client logos */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
            <div className="flex items-center gap-8 text-[13px] tracking-wide text-white/60">
              <span>35 Calculadoras</span>
              <span className="hidden text-white/20 sm:inline">|</span>
              <span className="hidden sm:inline">1,294 Articulos ET</span>
              <span className="hidden text-white/20 md:inline">|</span>
              <span className="hidden md:inline">Calendario Fiscal 2026</span>
              <span className="hidden text-white/20 lg:inline">|</span>
              <span className="hidden lg:inline">Asistente con IA</span>
            </div>
            <Link
              href="/explorador"
              className="hidden items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white sm:inline-flex"
            >
              Explorar Estatuto
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          CONTENT — Below the fold
         ────────────────────────────────────────────── */}
      <main>
        {/* Quick Access Grid */}
        <section className="px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">
              Herramientas Populares
            </h2>
            <p className="mx-auto mb-14 max-w-xl text-center text-sm text-muted-foreground">
              Acceso rapido a las calculadoras mas utilizadas por contadores y
              tributaristas colombianos.
            </p>

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

            <div className="mt-14 text-center">
              <Link
                href="/calculadoras"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
              >
                Ver las 35 calculadoras
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <section id="asistente" className="bg-muted/30 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight">
              Asistente Tributario
            </h2>
            <p className="mx-auto mb-14 max-w-xl text-center text-sm text-muted-foreground">
              Consulte los 1,294 articulos del Estatuto Tributario con
              inteligencia artificial.
            </p>

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
        <footer className="border-t border-border/40 py-10 text-center text-xs text-muted-foreground">
          <p>
            SuperApp Tributaria Colombia — Herramienta informativa. No
            constituye asesoria tributaria profesional.
          </p>
        </footer>
      </main>
    </div>
  );
}
