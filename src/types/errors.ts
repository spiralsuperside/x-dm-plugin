export type ErrorCategory = "validation" | "permission" | "integration" | "rate_limit" | "storage" | "unknown";

export interface ErrorPayloadV1 {
  code: string;
  category: ErrorCategory;
  message: string;
  retryable: boolean;
  correlationId: string;
  details?: Record<string, string | number | boolean>;
}

export class ExtensionError extends Error {
  readonly payload: ErrorPayloadV1;

  constructor(payload: ErrorPayloadV1) {
    super(payload.message);
    this.payload = payload;
  }
}

export class ValidationError extends ExtensionError {}
export class PermissionDeniedError extends ExtensionError {}
export class RateLimitedError extends ExtensionError {}
export class IntegrationAuthError extends ExtensionError {}
export class StorageConsistencyError extends ExtensionError {}
export class PolicyBlockedError extends ExtensionError {}
