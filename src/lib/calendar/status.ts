export type DeadlineStatus = "vencido" | "proximo" | "vigente";

function toDateOnly(dateIso: string): Date {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function startOfToday(todayDate?: Date): Date {
  const now = todayDate ?? new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysUntil(fechaIso: string, todayDate?: Date): number {
  const target = toDateOnly(fechaIso);
  const today = startOfToday(todayDate);
  const ms = target.getTime() - today.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getDeadlineStatus(fechaIso: string, todayDate?: Date): DeadlineStatus {
  const diff = daysUntil(fechaIso, todayDate);
  if (diff < 0) return "vencido";
  if (diff <= 7) return "proximo";
  return "vigente";
}

export function getDeadlineStatusLabel(status: DeadlineStatus): string {
  if (status === "vencido") return "Vencido";
  if (status === "proximo") return "Próximo";
  return "Vigente";
}

export function formatCountdownText(fechaIso: string, todayDate?: Date): string {
  const diff = daysUntil(fechaIso, todayDate);
  if (diff < 0) return `Venció hace ${Math.abs(diff)} día${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Vence hoy";
  if (diff === 1) return "Vence mañana";
  return `Vence en ${diff} días`;
}

