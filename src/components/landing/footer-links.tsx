import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Calculadoras",
    links: [
      { label: "Renta Personas Naturales", href: "/calculadoras/renta" },
      { label: "Retencion en la Fuente", href: "/calculadoras/retencion" },
      { label: "Regimen SIMPLE", href: "/calculadoras/simple" },
      { label: "GMF (4x1000)", href: "/calculadoras/gmf" },
      { label: "Patrimonio", href: "/calculadoras/patrimonio" },
      { label: "Dividendos", href: "/calculadoras/dividendos" },
      { label: "Ver las 35", href: "/calculadoras" },
    ],
  },
  {
    title: "Referencia",
    links: [
      { label: "Estatuto Tributario", href: "/explorador" },
      { label: "Calendario Fiscal", href: "/calendario" },
      { label: "Indicadores", href: "/indicadores" },
      { label: "Glosario", href: "/glosario" },
      { label: "Tablas de Retencion", href: "/tablas/retencion" },
    ],
  },
  {
    title: "Herramientas",
    links: [
      { label: "Comparador de Articulos", href: "/comparar" },
      { label: "Novedades Normativas", href: "/novedades" },
      { label: "Doctrina DIAN", href: "/doctrina" },
      { label: "Guias Interactivas", href: "/guias" },
      { label: "Favoritos", href: "/favoritos" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Asistente IA", href: "#asistente" },
      { label: "Todas las Calculadoras", href: "/calculadoras" },
    ],
  },
];

export function FooterLinks() {
  return (
    <footer>
      {/* Link columns */}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.05em] text-background/50">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="mt-16 border-t border-background/10 pt-8">
        <p className="text-xs text-background/40">
          &copy; 2026 SuperApp Tributaria Colombia. Herramienta informativa. No
          constituye asesoria tributaria profesional.
        </p>
      </div>
    </footer>
  );
}
