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
        dailyHardCap: 50,
        perMinuteCap: 10,
        warmupEnabled: true,
        followupDelayMinutes: 60,
        maxRetries: 3
      })
    ).toThrow();
  });
});
