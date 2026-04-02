import { describe, expect, it } from "vitest";
import { enforcePerMinuteCap, nextBackoffDate } from "../../src/lib/security/rateLimitGuards";

describe("rateLimitGuards", () => {
  it("produces rate-limited retry from retry-after", () => {
    const result = nextBackoffDate(1, 30);
    expect(result.retryClass).toBe("rate_limited");
  });

  it("throws on per-minute cap breach", () => {
    expect(() =>
      enforcePerMinuteCap(10, {
        integrationMode: "demo",
        companionApiBaseUrl: "http://localhost",
        safeMode: true,
        dailyHardCap: 50,
        hourlyHardCap: 12,
        perMinuteCap: 10,
        minDelaySec: 25,
        maxDelaySec: 95,
        warmupEnabled: true,
        followupDelayMinutes: 60,
        requireRunStartConfirmation: true,
        stopOnRateLimit: true,
        messageSimilarityThreshold: 0.92,
        retentionDays: 90,
        maxRetries: 3
      })
    ).toThrow();
  });
});
