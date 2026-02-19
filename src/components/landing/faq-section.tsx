import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-muted/40 px-6 py-16 md:px-8 md:py-24"
    >
      <Reveal className="mx-auto max-w-4xl">
        <h2 id="faq-title" className="heading-serif text-3xl text-foreground md:text-5xl">
          Preguntas frecuentes antes de empezar.
        </h2>

        <div className="mt-8 space-y-3">
          {items.map((item, index) => (
            <details
              key={item.question}
              className="rounded-xl border border-border bg-card p-5 open:border-foreground/25"
              open={index === 0}
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>

        <Link
          href="#asistente"
          className="mt-8 inline-flex text-sm font-semibold text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ir al asistente IA
        </Link>
      </Reveal>
    </section>
  );
}
