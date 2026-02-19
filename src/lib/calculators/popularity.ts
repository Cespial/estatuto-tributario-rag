const STORAGE_KEY = "calculators-usage-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

type UsageMap = Record<string, number[]>;

function inBrowser(): boolean {
  return typeof window !== "undefined";
}

function readUsageMap(): UsageMap {
  if (!inBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UsageMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeUsageMap(map: UsageMap): void {
  if (!inBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function pruneTimestamps(timestamps: number[], maxAgeDays: number): number[] {
  const cutoff = Date.now() - maxAgeDays * DAY_MS;
  return timestamps.filter((ts) => ts >= cutoff);
}

export function trackCalculatorUsage(calculatorId: string): void {
  if (!calculatorId || !inBrowser()) return;

  const map = readUsageMap();
  const current = map[calculatorId] ?? [];
  map[calculatorId] = pruneTimestamps([...current, Date.now()], 30);
  writeUsageMap(map);
}

export function getPopularCalculatorIds(options?: {
  days?: number;
  limit?: number;
}): string[] {
  const days = options?.days ?? 7;
  const limit = options?.limit ?? 5;
  const map = readUsageMap();

  const scored = Object.entries(map)
    .map(([id, timestamps]) => ({ id, score: pruneTimestamps(timestamps, days).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);

  return scored.map((entry) => entry.id);
}

export function getCalculatorUsageCount(calculatorId: string, days: number = 7): number {
  const map = readUsageMap();
  const timestamps = map[calculatorId] ?? [];
  return pruneTimestamps(timestamps, days).length;
}
