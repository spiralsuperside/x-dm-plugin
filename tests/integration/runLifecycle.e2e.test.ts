import { describe, expect, it } from "vitest";
import {
  applyDispatchOutcome,
  canProcessRun,
  markRunRetried,
  markRunStarted,
  type LifecycleState
} from "../../src/lib/orchestration/runLifecycle";

describe("run lifecycle e2e scenario", () => {
  it("covers capture->queue->rate-limit pause->retry->recovery", () => {
    const capturedTargets = ["@alice", "@bob", "@ratelimit-user"];
    expect(capturedTargets.length).toBe(3);

    const queuedActions = capturedTargets.length;
    expect(queuedActions).toBe(3);

    let state: LifecycleState = markRunStarted();
    expect(state.status).toBe("precheck");
    expect(canProcessRun(state, "2026-04-02T00:00:00.000Z")).toBe(true);

    state = applyDispatchOutcome(
      state,
      {
        ok: false,
        retryable: true,
        retryClass: "rate_limited",
        retryAt: "2026-04-02T00:05:00.000Z"
      },
      { stopOnRateLimit: true }
    );
    expect(state.status).toBe("rate_limited");
    expect(canProcessRun(state, "2026-04-02T00:04:59.000Z")).toBe(false);
    expect(canProcessRun(state, "2026-04-02T00:05:00.000Z")).toBe(true);

    state = markRunRetried();
    expect(state.status).toBe("precheck");

    state = applyDispatchOutcome(state, { ok: true }, { stopOnRateLimit: true });
    expect(state.status).toBe("precheck");
  });
});

