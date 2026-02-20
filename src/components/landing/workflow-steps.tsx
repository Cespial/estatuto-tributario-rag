import Link from "next/link";
import { ArrowRight, Calculator, FileSearch, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    title: "1. Identifique su obligacion",
    description:
      "Encuentre rapido que aplica para su caso y su perfil tributario.",
    icon: FileSearch,
  },
  {
    title: "2. Haga el calculo correcto",
    description:
      "Use calculadoras listas con variables tributarias colombianas.",
    icon: Calculator,
  },
  {
    title: "3. Sustente su criterio",
    description:
      "Verifique articulo del ET, doctrina y contexto con asistente IA.",
    icon: ShieldCheck,
  },
];

export function WorkflowSteps() {
  return (
    <section
      aria-labelledby="workflow-title"
      className="bg-muted/40 px-6 py-16 md:px-8 md:py-24"
    >
      <Reveal className="mx-auto max-w-6xl">
        <h2
          id="workflow-title"
          className="heading-serif text-3xl text-foreground md:text-5xl"
        >
          De la duda a la decision en 3 pasos.
        </h2>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3 md:gap-10">
          {/* Desktop Connectors */}
          <div className="absolute left-1/3 top-1/2 hidden h-px w-[10%] -translate-y-1/2 bg-border md:block lg:w-[15%]" />
          <div className="absolute left-2/3 top-1/2 hidden h-px w-[10%] -translate-y-1/2 bg-border md:block lg:w-[15%]" />

          {STEPS.map((step) => (
            <article
              key={step.title}
              className="group relative z-10 rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-foreground group-hover:text-background">
                <step.icon aria-hidden="true" className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <Link
          href="/calculadoras"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Empezar ahora
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </Reveal>
    </section>
  );
}
