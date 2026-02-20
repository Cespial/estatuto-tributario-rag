/**
 * Rate limiter with exponential backoff and retry logic.
 * Designed for respectful scraping of government websites.
 */

export interface RateLimiterOptions {
  /** Minimum delay between requests in ms (default: 2000) */
  minDelay?: number;
  /** Maximum delay for backoff in ms (default: 30000) */
  maxDelay?: number;
  /** Number of retries before giving up (default: 3) */
  maxRetries?: number;
  /** Concurrent workers (default: 3) */
  concurrency?: number;
}

export class RateLimiter {
  private minDelay: number;
  private maxDelay: number;
  private maxRetries: number;
  private concurrency: number;
  private lastRequestTime = 0;
  private activeRequests = 0;
  private queue: Array<() => void> = [];

  constructor(options: RateLimiterOptions = {}) {
    this.minDelay = options.minDelay ?? 2000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;
    this.concurrency = options.concurrency ?? 3;
  }

  private async waitForSlot(): Promise<void> {
    if (this.activeRequests < this.concurrency) {
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  private releaseSlot(): void {
    this.activeRequests--;
    const next = this.queue.shift();
    if (next) next();
  }

  private async enforceDelay(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minDelay) {
      await sleep(this.minDelay - elapsed);
    }
    this.lastRequestTime = Date.now();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    this.activeRequests++;

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          await this.enforceDelay();
          return await fn();
        } catch (error) {
          lastError = error as Error;

          if (attempt < this.maxRetries) {
            const backoffDelay = Math.min(
              this.minDelay * Math.pow(2, attempt),
              this.maxDelay
            );
            const jitter = Math.random() * 1000;
            console.warn(
              `[rate-limiter] Attempt ${attempt + 1}/${this.maxRetries + 1} failed: ${lastError.message}. Retrying in ${Math.round(backoffDelay + jitter)}ms`
            );
            await sleep(backoffDelay + jitter);
          }
        }
      }

      throw lastError || new Error("Max retries exceeded");
    } finally {
      this.releaseSlot();
    }
  }

  /**
   * Process an array of items with rate limiting and concurrency control.
   * Returns results in the same order as inputs.
   */
  async processAll<T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
    options?: { onProgress?: (completed: number, total: number) => void }
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let completed = 0;

    const promises = items.map(async (item, index) => {
      const result = await this.execute(() => fn(item, index));
      results[index] = result;
      completed++;
      if (options?.onProgress && completed % 100 === 0) {
        options.onProgress(completed, items.length);
      }
      return result;
    });

    await Promise.all(promises);
    return results;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Default rate limiter for government sites */
export function createGovScraper(): RateLimiter {
  return new RateLimiter({
    minDelay: 2000,
    maxDelay: 30000,
    maxRetries: 3,
    concurrency: 3,
  });
}
