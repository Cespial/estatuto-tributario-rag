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
import { UseCaseTicker } from "@/components/landing/use-case-ticker";
import { MetricsSection } from "@/components/landing/metrics-section";
import { FooterLinks } from "@/components/landing/footer-links";

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
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════════
          SECTION 1: HERO — Full-viewport cinematic video
         ═══════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-black">
        <HeroVideo />

        <div className="relative z-20">
          <Header variant="transparent" />
        </div>

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-6xl px-6 pb-32 md:px-8">
            <h1
              className="max-w-2xl font-[family-name:var(--font-playfair)] text-6xl font-normal leading-none tracking-[-0.0175em] text-white md:text-8xl lg:text-[7rem]"
              style={{ lineHeight: "1.05" }}
            >
              Tributaria
              <br />
              Colombia
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/70 md:text-xl">
              La plataforma tributaria mas completa del pais. 35 calculadoras,
              1,294 articulos del Estatuto Tributario, calendario fiscal y
              asistente con IA.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/calculadoras"
                className="inline-flex h-12 items-center gap-2 rounded bg-white px-6 text-sm font-medium tracking-wide text-black transition-all duration-300 hover:bg-white/85"
              >
                Explorar Calculadoras
              </Link>
              <Link
                href="#asistente"
                className="inline-flex h-12 items-center gap-2 rounded border border-white/30 px-6 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
              >
                Asistente IA
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
            <div className="flex items-center gap-8 text-[13px] tracking-wide text-white/50">
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
              className="hidden items-center gap-1.5 rounded border border-white/20 px-4 py-1.5 text-xs font-medium text-white/60 transition-colors duration-300 hover:border-white/40 hover:text-white sm:inline-flex"
            >
              Explorar Estatuto
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2: PRODUCT SIZZLE — Ivory background
         ═══════════════════════════════════════════════ */}
      <section className="bg-background px-6 py-28 md:px-8 md:py-36">
        <div className="mx-auto max-w-4xl">
          <h2
            className="font-[family-name:var(--font-playfair)] text-3xl font-normal leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
            style={{ lineHeight: "1.1" }}
          >
            La plataforma tributaria mas completa del pais.{" "}
            <span className="text-muted-foreground">
              35 calculadoras, consulta inteligente del Estatuto Tributario,
              calendario fiscal y asistente con IA — todo en un solo lugar.
            </span>
          </h2>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3: USE CASE TICKER — Ivory continues
         ═══════════════════════════════════════════════ */}
      <section className="bg-background px-6 py-24 md:px-8 md:py-32">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="shrink-0 lg:w-64">
            <p className="text-sm font-medium text-foreground">
              Los profesionales tributarios
              <br />
              usan SuperApp para
            </p>
            <Link
              href="/calculadoras"
              className="mt-6 inline-flex items-center gap-1.5 rounded border border-foreground/20 px-4 py-2 text-xs font-medium text-foreground transition-colors duration-300 hover:border-foreground/40"
            >
              Explorar Plataforma
            </Link>
          </div>
          <div className="flex-1">
            <UseCaseTicker />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4: FEATURES — Gray background for rhythm
         ═══════════════════════════════════════════════ */}
      <section className="bg-muted/40 px-6 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-3xl font-normal tracking-tight">
            Herramientas Profesionales
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-base text-muted-foreground">
            Acceso rapido a las calculadoras mas utilizadas por contadores y
            tributaristas colombianos.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group flex flex-col gap-4 rounded-lg border border-transparent bg-card p-6 shadow-sm transition-all duration-300 hover:border-border hover:shadow"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <calc.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">
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
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground"
            >
              Ver las 35 calculadoras
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5: METRICS — Ivory
         ═══════════════════════════════════════════════ */}
      <section className="bg-background px-6 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-5xl">
          <MetricsSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 6: CHAT SHOWCASE — Dark (dramatic return)
         ═══════════════════════════════════════════════ */}
      <section
        id="asistente"
        className="bg-foreground px-6 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-3xl font-normal tracking-tight text-background">
            Asistente Tributario
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-base text-background/60">
            Consulte los 1,294 articulos del Estatuto Tributario con
            inteligencia artificial.
          </p>

          <div className="flex h-[650px] flex-col overflow-hidden rounded-lg border border-background/10 bg-card shadow-sm">
            <div className="border-b border-border bg-muted/30 px-5 py-4">
              <h3 className="font-medium text-foreground">Asistente con IA</h3>
            </div>
            <ChatContainer />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7: CTA FINAL — Dark continues
         ═══════════════════════════════════════════════ */}
      <section className="bg-foreground px-6 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-[family-name:var(--font-playfair)] text-4xl font-normal tracking-tight text-background md:text-5xl lg:text-6xl"
            style={{ lineHeight: "1.05" }}
          >
            Domine la tributaria colombiana
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base text-background/60">
            Calculadoras, Estatuto Tributario, calendario fiscal y asistente con
            IA — la herramienta definitiva para profesionales tributarios.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/calculadoras"
              className="inline-flex h-12 items-center gap-2 rounded bg-background px-6 text-sm font-medium tracking-wide text-foreground transition-all duration-300 hover:bg-background/85"
            >
              Explorar Calculadoras
            </Link>
            <Link
              href="/explorador"
              className="inline-flex h-12 items-center gap-2 rounded border border-background/30 px-6 text-sm font-medium tracking-wide text-background transition-all duration-300 hover:border-background/60 hover:bg-background/10"
            >
              Consultar Estatuto
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 8: FOOTER — Dark continues (no border-top!)
         ═══════════════════════════════════════════════ */}
      <section className="bg-foreground px-6 pb-12 pt-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <FooterLinks />
        </div>
      </section>
    </div>
  );
}
