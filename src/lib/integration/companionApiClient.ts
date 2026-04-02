import type { DispatchContext, DispatchResult } from "./adapters/types";

export class CompanionApiClient {
  constructor(private readonly baseUrl: string) {}

  async dispatch(context: DispatchContext): Promise<DispatchResult> {
    const response = await fetch(`${this.baseUrl}/v1/dispatch/actions:single`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(context)
    });

    if (!response.ok) {
      return {
        ok: false,
        retryable: response.status >= 500 || response.status === 429,
        retryAfterSeconds: Number(response.headers.get("retry-after") ?? "0") || undefined,
        errorCode: `HTTP_${response.status}`,
        errorMessage: await response.text()
      };
    }
    const parsed = (await response.json()) as DispatchResult;
    return parsed;
  }
}
