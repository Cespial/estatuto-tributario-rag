function normalizeDigits(value: string): string {
  return value.replace(/[^\d,-]/g, "").trim();
}

export function extractNitFilters(raw: string): string[] {
  const clean = normalizeDigits(raw);
  if (!clean) return [];
  return clean
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseRangeToken(token: string): { from: number; to: number } | null {
  if (!token) return null;
  if (token.includes("-")) {
    const [left, right] = token.split("-");
    const from = Number(left);
    const to = Number(right);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      return { from: Math.min(from, to), to: Math.max(from, to) };
    }
    return null;
  }
  const value = Number(token);
  if (!Number.isFinite(value)) return null;
  return { from: value, to: value };
}

function entryToRanges(ultimoDigito: string): Array<{ from: number; to: number }> {
  return ultimoDigito
    .split(",")
    .map((segment) => parseRangeToken(segment.trim()))
    .filter((segment): segment is { from: number; to: number } => Boolean(segment));
}

export function matchesNitFilter(ultimoDigito: string, nitFilter: string): boolean {
  const parsed = nitFilter.trim();
  if (!parsed) return true;

  const target = Number(parsed);
  if (!Number.isFinite(target)) return false;

  const ranges = entryToRanges(ultimoDigito);
  return ranges.some((range) => target >= range.from && target <= range.to);
}

export function matchesAnyNitFilter(ultimoDigito: string, nitFilters: string[]): boolean {
  if (nitFilters.length === 0) return true;
  return nitFilters.some((filter) => matchesNitFilter(ultimoDigito, filter));
}

export function prettyNitFilters(nitFilters: string[]): string {
  if (nitFilters.length === 0) return "Todos";
  return nitFilters.join(", ");
}

