export type Platform = "x" | "reddit";

export type CampaignStatus = "draft" | "active" | "archived";

export type RunStatus =
  | "queued"
  | "precheck"
  | "warming"
  | "sending"
  | "paused"
  | "rate_limited"
  | "failed"
  | "sent"
  | "canceled";

export type ActionType = "warmup_like" | "send_dm" | "follow_up";

export type TargetSourceType = "commenters" | "keyword" | "page" | "list_csv";

export type RetryClass = "none" | "transient" | "rate_limited" | "auth" | "fatal";
