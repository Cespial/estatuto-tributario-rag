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

export function Header() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex flex-1 items-center gap-6 overflow-hidden">
          {/* Logo — Harvey.ai inspired: elegant serif feel */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Scale className="h-5 w-5 text-foreground" />
            <h1 className="whitespace-nowrap text-lg tracking-tight">
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
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                    {/* Subtle active underline indicator */}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-[1px] h-[1.5px] rounded-full bg-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Right fade overlay for scroll indication */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background/80 to-transparent" />
          </nav>
        </div>

        {/* Theme toggle — subtle, minimal */}
        <div className="ml-6 flex shrink-0 items-center">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
