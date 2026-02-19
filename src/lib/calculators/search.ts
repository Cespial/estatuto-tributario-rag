import type { CalculatorCatalogItem } from "@/config/calculators-catalog";

const SYNONYMS: Record<string, string[]> = {
  "debo": ["debo", "obligado"],
  "declarar": ["declarar", "declaracion", "renta"],
  "retencion": ["retencion", "retefuente", "rete"],
  "nomina": ["nomina", "prestaciones", "parafiscales"],
  "contratacion": ["contratacion", "contrato", "laboral", "servicios"],
  "iva": ["iva", "ventas", "impuesto al consumo"],
  "patrimonio": ["patrimonio", "herencia", "donacion"],
  "sancion": ["sancion", "multa", "intereses mora"],
  "renta": ["renta", "impuesto de renta", "declaracion"],
};

export interface CalculatorSearchResult {
  item: CalculatorCatalogItem;
  score: number;
  matches: string[];
}

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(input: string): string[] {
  return normalize(input)
    .split(/\s+/)
    .filter(Boolean);
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens);

  for (const token of tokens) {
    for (const [key, values] of Object.entries(SYNONYMS)) {
      if (token.includes(key) || key.includes(token)) {
        for (const value of values) {
          expanded.add(value);
        }
      }
    }
  }

  return Array.from(expanded);
}

export function searchCalculators(
  query: string,
  calculators: CalculatorCatalogItem[],
): CalculatorSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return calculators.map((item) => ({ item, score: 0, matches: [] }));
  }

  const baseTokens = tokenize(normalizedQuery);
  const tokens = expandTokens(baseTokens);

  const results = calculators
    .map((item) => {
      const title = normalize(item.title);
      const description = normalize(item.description);
      const tags = item.tags.map((tag) => normalize(tag));
      const intents = item.intents.map((intent) => normalize(intent));
      const category = normalize(item.category);

      let score = 0;
      const matches: string[] = [];

      if (title.includes(normalizedQuery)) {
        score += 120;
        matches.push("titulo");
      }

      if (description.includes(normalizedQuery)) {
        score += 70;
        matches.push("descripcion");
      }

      for (const intent of intents) {
        if (intent.includes(normalizedQuery)) {
          score += 90;
          matches.push("intencion");
          break;
        }
      }

      for (const token of tokens) {
        if (title.includes(token)) score += 40;
        if (description.includes(token)) score += 20;
        if (tags.some((tag) => tag.includes(token))) score += 30;
        if (intents.some((intent) => intent.includes(token))) score += 35;
        if (category.includes(token)) score += 15;
      }

      if (item.isTop5) {
        score += 5;
      }

      return {
        item,
        score,
        matches: Array.from(new Set(matches)),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  return results;
}
