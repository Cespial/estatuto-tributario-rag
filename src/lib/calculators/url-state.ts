import { z } from "zod";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

const numberParamSchema = z.coerce.number();

export function readNumberParam(
  params: SearchParamsLike,
  key: string,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  const raw = params.get(key);
  if (raw === null || raw === "") return fallback;

  const parsed = numberParamSchema.safeParse(raw);
  if (!parsed.success || Number.isNaN(parsed.data)) {
    return fallback;
  }

  let value = parsed.data;
  if (typeof options?.min === "number" && value < options.min) value = options.min;
  if (typeof options?.max === "number" && value > options.max) value = options.max;

  return value;
}

export function readBooleanParam(
  params: SearchParamsLike,
  key: string,
  fallback: boolean,
): boolean {
  const raw = params.get(key);
  if (!raw) return fallback;

  const normalized = raw.toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "si") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no") return false;
  return fallback;
}

export function readStringParam(
  params: SearchParamsLike,
  key: string,
  fallback: string,
): string {
  const raw = params.get(key);
  return raw && raw.trim().length > 0 ? raw : fallback;
}

export function buildPathWithQuery(
  pathname: string,
  values: Record<string, string | number | boolean | null | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function replaceUrlQuery(
  values: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const nextPath = buildPathWithQuery(url.pathname, values);
  window.history.replaceState({}, "", nextPath);
}

export function buildShareUrl(
  pathname: string,
  values: Record<string, string | number | boolean | null | undefined>,
): string {
  if (typeof window === "undefined") {
    return buildPathWithQuery(pathname, values);
  }

  return `${window.location.origin}${buildPathWithQuery(pathname, values)}`;
}
