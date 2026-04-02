import type { RuntimeSettings } from "../../types/entities";

export interface BackoffResult {
  retryAt: string;
  retryClass: "transient" | "rate_limited";
}

export function nextBackoffDate(retryCount: number, retryAfterSeconds?: number): BackoffResult {
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    const when = new Date(Date.now() + retryAfterSeconds * 1000);
    return {
      retryAt: when.toISOString(),
      retryClass: "rate_limited"
    };
  }
  const base = Math.min(2 ** retryCount * 30, 15 * 60);
  const jitter = Math.floor(Math.random() * 20);
  const when = new Date(Date.now() + (base + jitter) * 1000);
  return {
    retryAt: when.toISOString(),
    retryClass: "transient"
  };
}

export function enforcePerMinuteCap(executedThisMinute: number, settings: RuntimeSettings): void {
  if (executedThisMinute >= settings.perMinuteCap) {
    throw new Error("Per-minute cap reached.");
  }
}
