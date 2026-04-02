import type { ActionType, Platform } from "../../../types/enums";

export interface DispatchContext {
  platform: Platform;
  actionType: ActionType;
  username: string;
  message: string;
  idempotencyKey: string;
}

export interface DispatchResult {
  ok: boolean;
  externalId?: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface IntegrationAdapter {
  dispatch(context: DispatchContext): Promise<DispatchResult>;
}
