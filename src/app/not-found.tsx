import Link from "next/link";
import { Scale, ArrowLeft, Calculator } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Scale className="h-10 w-10 text-muted-foreground/40" />
        </div>

        <h1 className="heading-serif text-4xl text-foreground md:text-5xl">
          Pagina no encontrada
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          El contenido que busca no existe o ha sido movido. Verifique la
          direccion o explore nuestras herramientas tributarias.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-foreground px-6 text-sm font-medium text-background transition-all duration-300 hover:bg-foreground/80 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <Link
            href="/calculadoras"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded border border-border px-6 text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted sm:w-auto"
          >
            <Calculator className="h-4 w-4" />
            Explorar calculadoras
          </Link>
        </div>
      </div>
    </div>
  );
}
