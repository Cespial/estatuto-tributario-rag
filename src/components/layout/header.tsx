"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Scale, Menu, X } from "lucide-react";

import { useSyncExternalStore, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/asistente", label: "Asistente" },
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

  // Scroll-aware: when transparent header scrolls past hero, transition to solid
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // Effective transparent state: transparent only when not scrolled
  const showTransparent = isTransparent && !scrolled;

  return (
    <header className={clsx(
      "sticky top-0 z-50 will-change-transform transition-all duration-300 print:hidden",
      showTransparent
        ? "border-b border-transparent bg-transparent"
        : "border-b border-border/40 bg-background/80 backdrop-blur-md"
    )}>
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
        <div className="flex flex-1 items-center gap-6 overflow-hidden">
          {/* Logo — Harvey.ai inspired: elegant serif feel */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Scale className={clsx("h-5 w-5", showTransparent ? "text-white" : "text-foreground")} />
            <p className={clsx("whitespace-nowrap text-lg tracking-tight", showTransparent && "text-white")}>
              <span className="font-light">SuperApp</span>{" "}
              <span className="font-semibold">Tributaria</span>
            </p>
          </Link>

          {/* Navigation — text-only, uppercase, generous spacing */}
          <nav
            className="relative hidden flex-1 items-center overflow-hidden md:flex"
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
                      "relative shrink-0 snap-start py-1 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors",
                      isActive
                        ? showTransparent ? "text-white font-semibold" : "text-foreground font-semibold"
                        : showTransparent ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                    {/* Subtle active underline indicator */}
                    {isActive && (
                      <span className={clsx("absolute inset-x-0 -bottom-[1px] h-[1.5px] rounded-full", showTransparent ? "bg-white" : "bg-foreground")} />
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Right fade overlay for scroll indication */}
            <div className={clsx("pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l to-transparent", showTransparent ? "from-transparent" : "from-background/80")} />
          </nav>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={clsx(
            "rounded p-2 transition-colors md:hidden",
            showTransparent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Menu de navegacion"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Theme toggle — subtle, minimal */}
        <div className="ml-6 flex shrink-0 items-center">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={clsx(
                "rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                showTransparent ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
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
      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-[72px] z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-in panel */}
          <nav
            id="mobile-navigation"
            className="fixed right-0 top-[72px] z-50 h-[calc(100vh-72px)] w-72 overflow-y-auto border-l border-border/40 bg-background p-6 shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive =
                  href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "rounded px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
