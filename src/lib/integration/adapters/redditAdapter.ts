import type { DispatchContext, DispatchResult, IntegrationAdapter } from "./types";
import { dispatchViaActiveTab } from "./browserNativeDispatcher";

export class RedditAdapter implements IntegrationAdapter {
  async dispatch(context: DispatchContext): Promise<DispatchResult> {
    return dispatchViaActiveTab(context);
  }
}
