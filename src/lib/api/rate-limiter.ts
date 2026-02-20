const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;
const MAX_ENTRIES = 10000;

interface RequestRecord {
  timestamps: number[];
}

const store = new Map<string, RequestRecord>();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
    if (record.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60_000);

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let record = store.get(ip);

  if (!record) {
    // LRU Eviction if store is full
    if (store.size >= MAX_ENTRIES) {
      const oldestKey = store.keys().next().value;
      if (oldestKey) store.delete(oldestKey);
    }
    record = { timestamps: [] };
    store.set(ip, record);
  } else {
    // Refresh position for LRU
    store.delete(ip);
    store.set(ip, record);
  }

  // Remove timestamps outside the window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.timestamps.push(now);
  return { allowed: true };
}
