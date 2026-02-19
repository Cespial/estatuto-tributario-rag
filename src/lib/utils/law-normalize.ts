import { normalizeForSearch } from "@/lib/utils/text-normalize";

export interface ParsedLawRef {
  tipo: "ley" | "decreto" | "decreto-ley" | "otra";
  numero: string | null;
  year: number | null;
  label: string;
  key: string;
}

const LAW_REGEX =
  /\b(ley|decreto(?:\s+ley)?)\s+(\d+[A-Za-z-]*)\s+(?:de|del)\s+(\d{4})\b/i;

export function normalizeLawLabel(input: string): string {
  const parsed = parseLawRef(input);
  if (!parsed.numero || !parsed.year) return input.trim();

  if (parsed.tipo === "ley") {
    return `Ley ${parsed.numero} de ${parsed.year}`;
  }

  if (parsed.tipo === "decreto-ley") {
    return `Decreto Ley ${parsed.numero} de ${parsed.year}`;
  }

  if (parsed.tipo === "decreto") {
    return `Decreto ${parsed.numero} de ${parsed.year}`;
  }

  return input.trim();
}

export function parseLawRef(input: string): ParsedLawRef {
  const clean = input.trim();
  const match = clean.match(LAW_REGEX);

  if (!match) {
    return {
      tipo: "otra",
      numero: null,
      year: null,
      label: clean,
      key: normalizeForSearch(clean),
    };
  }

  const rawTipo = normalizeForSearch(match[1]);
  const numero = match[2];
  const year = Number(match[3]);

  const tipo =
    rawTipo === "ley"
      ? "ley"
      : rawTipo.includes("decreto ley")
      ? "decreto-ley"
      : "decreto";

  const label =
    tipo === "ley"
      ? `Ley ${numero} de ${year}`
      : tipo === "decreto-ley"
      ? `Decreto Ley ${numero} de ${year}`
      : `Decreto ${numero} de ${year}`;

  const key =
    tipo === "ley"
      ? `ley-${numero.toLowerCase()}-${year}`
      : tipo === "decreto-ley"
      ? `decreto-ley-${numero.toLowerCase()}-${year}`
      : `decreto-${numero.toLowerCase()}-${year}`;

  return { tipo, numero, year, label, key };
}

export function lawKeyFromUserInput(input: string): string {
  const parsed = parseLawRef(input);
  if (parsed.key) return parsed.key;

  const onlyNumberMatch = input.match(/(\d{2,4})/);
  return onlyNumberMatch ? `ley-${onlyNumberMatch[1]}` : normalizeForSearch(input);
}

export function matchesLawFilter(laws: string[], filter: string): boolean {
  if (!filter) return true;
  const normalizedFilter = normalizeForSearch(filter);
  const lawKey = lawKeyFromUserInput(filter);

  return laws.some((law) => {
    const parsed = parseLawRef(law);
    return (
      parsed.key === lawKey ||
      parsed.label.toLowerCase().includes(normalizedFilter) ||
      parsed.key.includes(normalizedFilter.replace(/\s+/g, "-"))
    );
  });
}
