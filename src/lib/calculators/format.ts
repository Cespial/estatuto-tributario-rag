export function formatCOP(value: number): string {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

export function formatUVT(value: number, digits: number = 2): string {
  return `${value.toFixed(digits)} UVT`;
}

export function formatPercent(value: number, digits: number = 2): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function parseCurrencyInput(input: string): number {
  const raw = input.replace(/[^\d-]/g, "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function clampNumber(value: number, min?: number, max?: number): number {
  let next = value;
  if (typeof min === "number" && next < min) next = min;
  if (typeof max === "number" && next > max) next = max;
  return next;
}
