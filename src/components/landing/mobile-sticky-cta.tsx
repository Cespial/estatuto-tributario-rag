import Link from "next/link";

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <Link
          href="/calculadoras/debo-declarar"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background"
        >
          Debo declarar?
        </Link>
        <Link
          href="#asistente"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground"
        >
          Abrir IA
        </Link>
      </div>
    </div>
  );
}
