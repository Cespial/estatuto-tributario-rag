import { BadgeCheck, BookCheck, Zap } from "lucide-react";

export function TrustStrip() {
  return (
    <section
      aria-label="Credenciales de confianza"
      className="border-y border-border bg-background/80"
    >
      <div className="mx-auto grid max-w-6xl gap-3 px-6 py-4 md:grid-cols-3 md:px-8">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
          <BadgeCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Normativa tributaria colombiana centralizada para consulta rapida.</p>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
          <BookCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Calculo y referencia legal en el mismo flujo de trabajo.</p>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
          <Zap aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Gratis para empezar hoy, sin friccion de implementacion.</p>
        </div>
      </div>
    </section>
  );
}
