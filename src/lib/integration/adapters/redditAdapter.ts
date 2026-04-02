import { CompanionApiClient } from "../companionApiClient";
import type { DispatchContext, DispatchResult, IntegrationAdapter } from "./types";

export class RedditAdapter implements IntegrationAdapter {
  constructor(private readonly client: CompanionApiClient) {}

  async dispatch(context: DispatchContext): Promise<DispatchResult> {
    return this.client.dispatch(context);
  }
}
