import type { ActionType, CampaignStatus, Platform, RetryClass, RunStatus, TargetSourceType } from "./enums";

export type Id = string;

export interface SchemaMeta {
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign extends SchemaMeta {
  id: Id;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  dailySendCap: number;
  requiresConfirmBeforeSend: boolean;
}

export interface WorkflowNode extends SchemaMeta {
  id: Id;
  campaignId: Id;
  kind: "target_source" | "template" | "warmup" | "follow_up" | "limit_gate";
  config: Record<string, unknown>;
}

export interface WorkflowEdge extends SchemaMeta {
  id: Id;
  campaignId: Id;
  fromNodeId: Id;
  toNodeId: Id;
  branchKey: string;
  priority: number;
}

export interface TargetSource extends SchemaMeta {
  id: Id;
  campaignId: Id;
  type: TargetSourceType;
  config: {
    keyword?: string;
    pageUrl?: string;
    csvImportId?: Id;
    maxTargets: number;
  };
}

export interface Contact extends SchemaMeta {
  id: Id;
  campaignId: Id;
  platform: Platform;
  platformUserId: string;
  username: string;
  displayName?: string;
  dedupeKey: string;
  optOut: boolean;
  lastInteractionAt?: string;
  lastReplyAt?: string;
}

export interface MessageTemplate extends SchemaMeta {
  id: Id;
  campaignId: Id;
  name: string;
  body: string;
  disallowLinksFirstMessage: boolean;
}

export interface Run extends SchemaMeta {
  id: Id;
  campaignId: Id;
  status: RunStatus;
  correlationId: string;
  startedAt?: string;
  finishedAt?: string;
  rateLimitCooldownUntil?: string;
  summary: {
    queued: number;
    sent: number;
    skipped: number;
    failed: number;
    rateLimited: number;
  };
}

export interface RunAction extends SchemaMeta {
  id: Id;
  runId: Id;
  campaignId: Id;
  contactId: Id;
  actionType: ActionType;
  sequence: number;
  scheduledAt: string;
  status: "pending" | "executing" | "done" | "error" | "canceled";
  idempotencyKey: string;
  retryCount: number;
  nextRetryAt?: string;
  retryClass: RetryClass;
  renderedMessage: string;
  errorCode?: string;
}

export interface ContactHistory extends SchemaMeta {
  id: Id;
  contactId: Id;
  campaignId: Id;
  lastSentAt?: string;
  lastMessageHash?: string;
  totalSent: number;
  totalReplies: number;
  blockedReason?: string;
}

export interface RateLimitSignal extends SchemaMeta {
  id: Id;
  platform: Platform;
  accountId: Id;
  signal: "429" | "temporary_block" | "challenge_required";
  retryAfterSeconds?: number;
}

export interface IntegrationAccount extends SchemaMeta {
  id: Id;
  platform: Platform;
  mode: "demo" | "api";
  tokenRef?: string;
  enabled: boolean;
}

export interface AnalyticsEvent extends SchemaMeta {
  id: Id;
  runId: Id;
  campaignId: Id;
  type:
    | "run_created"
    | "run_started"
    | "action_sent"
    | "action_skipped"
    | "action_failed"
    | "reply_captured"
    | "rate_limited"
    | "run_completed"
    | "run_failed";
  correlationId: string;
  data: Record<string, string | number | boolean | null>;
}

export interface RuntimeSettings {
  integrationMode: "demo" | "api";
  companionApiBaseUrl: string;
  dailyHardCap: number;
  perMinuteCap: number;
  minDelaySec: number;
  maxDelaySec: number;
  warmupEnabled: boolean;
  followupDelayMinutes: number;
  stopOnRateLimit: boolean;
  messageSimilarityThreshold: number;
  retentionDays: number;
  maxRetries: number;
}
