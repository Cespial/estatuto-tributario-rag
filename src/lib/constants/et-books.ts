export interface ETBook {
  key: string;
  value: string;
  shortLabel: string;
  formalLabel: string;
  color: string;
}

export const ET_BOOKS: ETBook[] = [
  {
    key: "titulo-preliminar",
    value: "Título Preliminar",
    shortLabel: "Título Preliminar",
    formalLabel: "Título Preliminar",
    color: "#6b7280",
  },
  {
    key: "libro-i",
    value: "Libro I - Renta",
    shortLabel: "Libro I - Renta",
    formalLabel: "Libro Primero: Impuesto sobre la Renta y Complementarios",
    color: "#1d4ed8",
  },
  {
    key: "libro-ii",
    value: "Libro II - Retención",
    shortLabel: "Libro II - Retención",
    formalLabel: "Libro Segundo: Retención en la Fuente",
    color: "#dc2626",
  },
  {
    key: "libro-iii",
    value: "Libro III - IVA",
    shortLabel: "Libro III - IVA",
    formalLabel: "Libro Tercero: Impuesto sobre las Ventas (IVA)",
    color: "#16a34a",
  },
  {
    key: "libro-iv",
    value: "Libro IV - Timbre",
    shortLabel: "Libro IV - Timbre",
    formalLabel: "Libro Cuarto: Impuesto de Timbre Nacional",
    color: "#a16207",
  },
  {
    key: "libro-v",
    value: "Libro V - Procedimiento",
    shortLabel: "Libro V - Procedimiento",
    formalLabel:
      "Libro Quinto: Procedimiento Tributario, Sanciones y Estructura de la DIAN",
    color: "#7c3aed",
  },
  {
    key: "libro-vi",
    value: "Libro VI - GMF",
    shortLabel: "Libro VI - GMF",
    formalLabel: "Libro Sexto: Gravamen a los Movimientos Financieros (GMF)",
    color: "#0e7490",
  },
];

export const ET_BOOK_COLOR_MAP = Object.fromEntries(
  ET_BOOKS.map((book) => [book.value, book.color])
) as Record<string, string>;

export function getFormalBookLabel(libro: string): string {
  return ET_BOOKS.find((book) => book.value === libro)?.formalLabel || libro;
}
