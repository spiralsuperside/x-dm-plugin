import type { DispatchContext, DispatchResult, IntegrationAdapter } from "./types";

export class DemoAdapter implements IntegrationAdapter {
  async dispatch(context: DispatchContext): Promise<DispatchResult> {
    const wait = 100 + Math.floor(Math.random() * 200);
    await new Promise((resolve) => setTimeout(resolve, wait));
    if (context.username.toLowerCase().includes("ratelimit")) {
      return {
        ok: false,
        retryable: true,
        retryAfterSeconds: 90,
        errorCode: "RATE_LIMIT"
      };
    }
    return {
      ok: true,
      externalId: `demo:${context.idempotencyKey}`
    };
  }
}
