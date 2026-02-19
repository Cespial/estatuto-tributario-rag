import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Calculadoras",
    links: [
      { label: "Debo declarar renta", href: "/calculadoras/debo-declarar" },
      { label: "Renta personas naturales", href: "/calculadoras/renta" },
      { label: "Retencion en la fuente", href: "/calculadoras/retencion" },
      { label: "IVA", href: "/calculadoras/iva" },
      { label: "Regimen SIMPLE", href: "/calculadoras/simple" },
      { label: "Ver las 35", href: "/calculadoras" },
    ],
  },
  {
    title: "Referencia",
    links: [
      { label: "Estatuto Tributario", href: "/explorador" },
      { label: "Calendario fiscal", href: "/calendario" },
      { label: "Indicadores", href: "/indicadores" },
      { label: "Glosario", href: "/glosario" },
      { label: "Tablas de retencion", href: "/tablas/retencion" },
    ],
  },
  {
    title: "Herramientas",
    links: [
      { label: "Comparador de articulos", href: "/comparar" },
      { label: "Novedades normativas", href: "/novedades" },
      { label: "Doctrina DIAN", href: "/doctrina" },
      { label: "Guias interactivas", href: "/guias" },
      { label: "Favoritos", href: "/favoritos" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Asistente IA", href: "#asistente" },
      { label: "FAQ", href: "#faq" },
      { label: "Comparativa", href: "#comparativa" },
    ],
  },
] as const;

export function FooterLinks() {
  return (
    <footer>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.05em] text-background/55">
              {column.title}
            </h3>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/75 transition-colors hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-background/10 pt-8">
        <p className="text-xs leading-relaxed text-background/45">
          (c) 2026 SuperApp Tributaria Colombia. Herramienta informativa de apoyo
          tributario. No constituye asesoria legal o contable personalizada.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-background/40">
          Basada en normativa tributaria colombiana y consulta del Estatuto
          Tributario.
        </p>
      </div>
    </footer>
  );
}
