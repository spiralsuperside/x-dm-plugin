import type { RunStatus } from "../../types/enums";

export interface LifecycleState {
  status: RunStatus;
  cooldownUntil?: string;
}

export interface DispatchOutcome {
  ok: boolean;
  retryable?: boolean;
  retryClass?: "transient" | "rate_limited";
  retryAt?: string;
}

export function applyDispatchOutcome(
  state: LifecycleState,
  outcome: DispatchOutcome,
  options: { stopOnRateLimit: boolean }
): LifecycleState {
  if (outcome.ok) {
    return { status: "precheck" };
  }

  if (outcome.retryable && outcome.retryClass === "rate_limited" && options.stopOnRateLimit) {
    return {
      status: "rate_limited",
      cooldownUntil: outcome.retryAt
    };
  }

  if (outcome.retryable) {
    return { status: "precheck" };
  }

  return { status: "failed" };
}

export function canProcessRun(state: LifecycleState, nowIso: string): boolean {
  if (state.status === "queued" || state.status === "paused" || state.status === "canceled" || state.status === "failed") {
    return false;
  }
  if (state.status === "rate_limited") {
    if (!state.cooldownUntil) {
      return false;
    }
    return state.cooldownUntil <= nowIso;
  }
  return true;
}

export function markRunStarted(): LifecycleState {
  return { status: "precheck" };
}

export function markRunRetried(): LifecycleState {
  return { status: "precheck" };
}

