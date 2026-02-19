"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Scale } from "lucide-react";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Chat" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorador", label: "Explorador" },
  { href: "/comparar", label: "Comparar" },
  { href: "/calculadoras", label: "Calculadoras" },
  { href: "/calendario", label: "Calendario" },
  { href: "/tablas/retencion", label: "Tablas" },
  { href: "/indicadores", label: "Indicadores" },
  { href: "/glosario", label: "Glosario" },
  { href: "/novedades", label: "Novedades" },
  { href: "/doctrina", label: "Doctrina" },
  { href: "/guias", label: "Guías" },
  { href: "/favoritos", label: "Favoritos" },
];

interface HeaderProps {
  variant?: "default" | "transparent";
}

export function Header({ variant = "default" }: HeaderProps) {
  const isTransparent = variant === "transparent";
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const pathname = usePathname();

  return (
    <header className={clsx(
      "sticky top-0 z-50 transition-all duration-300",
      isTransparent
        ? "border-b border-transparent bg-transparent"
        : "border-b border-border/40 bg-background/80 backdrop-blur-md"
    )}>
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
        <div className="flex flex-1 items-center gap-6 overflow-hidden">
          {/* Logo — Harvey.ai inspired: elegant serif feel */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Scale className={clsx("h-5 w-5", isTransparent ? "text-white" : "text-foreground")} />
            <h1 className={clsx("whitespace-nowrap text-lg tracking-tight", isTransparent && "text-white")}>
              <span className="font-light">SuperApp</span>{" "}
              <span className="font-semibold">Tributaria</span>
            </h1>
          </Link>

          {/* Navigation — text-only, uppercase, generous spacing */}
          <nav
            className="relative flex flex-1 items-center overflow-hidden"
          >
            <div
              className="flex items-center gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive =
                  href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "relative shrink-0 snap-start py-1 text-[13px] font-medium uppercase tracking-wide transition-colors",
                      isActive
                        ? isTransparent ? "text-white font-semibold" : "text-foreground font-semibold"
                        : isTransparent ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                    {/* Subtle active underline indicator */}
                    {isActive && (
                      <span className={clsx("absolute inset-x-0 -bottom-[1px] h-[1.5px] rounded-full", isTransparent ? "bg-white" : "bg-foreground")} />
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Right fade overlay for scroll indication */}
            <div className={clsx("pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l to-transparent", isTransparent ? "from-transparent" : "from-background/80")} />
          </nav>
        </div>

        {/* Theme toggle — subtle, minimal */}
        <div className="ml-6 flex shrink-0 items-center">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={clsx(
                "rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isTransparent ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
