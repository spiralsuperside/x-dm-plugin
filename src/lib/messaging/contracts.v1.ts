import type { Campaign, Contact, Id, MessageTemplate, Run, RuntimeSettings } from "../../types/entities";

export type CommandType =
  | "project.create"
  | "project.load"
  | "campaign.create"
  | "campaign.list"
  | "campaign.update"
  | "targets.import.csv"
  | "targets.list"
  | "target.capture.start"
  | "replies.capture.start"
  | "template.upsert"
  | "template.get"
  | "template.preview.render"
  | "run.create"
  | "run.start"
  | "run.pause"
  | "run.cancel"
  | "run.retry"
  | "run.list"
  | "settings.get"
  | "settings.update";

export type EventType =
  | "run.status.changed"
  | "run.progress"
  | "queue.depth.changed"
  | "storage.entity.changed"
  | "rate_limit.detected"
  | "permission.required"
  | "error.reported";

export interface CommandEnvelopeV1<TPayload = unknown> {
  version: "v1";
  requestId: string;
  type: CommandType;
  payload: TPayload;
}

export interface EventEnvelopeV1<TPayload = unknown> {
  version: "v1";
  eventId: string;
  type: EventType;
  payload: TPayload;
  at: string;
}

export type CommandPayloadMap = {
  "project.create": { name: string };
  "project.load": { projectId: Id };
  "campaign.create": {
    name: string;
    platform: "x" | "reddit";
    dailySendCap?: number;
    requiresConfirmBeforeSend?: boolean;
  };
  "campaign.list": {};
  "campaign.update": { id: Id; patch: Partial<Campaign> };
  "targets.import.csv": { campaignId: Id; csvText: string; platform: "x" | "reddit" };
  "targets.list": { campaignId: Id };
  "target.capture.start": { campaignId: Id; platform: "x" | "reddit" };
  "replies.capture.start": { campaignId: Id; platform: "x" | "reddit" };
  "template.upsert": {
    campaignId: Id;
    name: string;
    body: string;
    disallowLinksFirstMessage?: boolean;
  };
  "template.get": { campaignId: Id };
  "template.preview.render": { templateBody: string; name: string; seed?: number };
  "run.create": { campaignId: Id };
  "run.start": { runId: Id };
  "run.pause": { runId: Id };
  "run.cancel": { runId: Id };
  "run.retry": { runId: Id };
  "run.list": { campaignId?: Id };
  "settings.get": {};
  "settings.update": { patch: Partial<RuntimeSettings> };
};

export type CommandResponseMap = {
  "project.create": { projectId: Id };
  "project.load": { ok: true };
  "campaign.create": { campaign: Campaign };
  "campaign.list": { campaigns: Campaign[] };
  "campaign.update": { campaign: Campaign };
  "targets.import.csv": { imported: number; deduped: number };
  "targets.list": { contacts: Contact[] };
  "target.capture.start": { imported: number };
  "replies.capture.start": { matchedContacts: number; updatedReplies: number };
  "template.upsert": { template: MessageTemplate };
  "template.get": { template: MessageTemplate | null };
  "template.preview.render": { rendered: string };
  "run.create": { run: Run; queuedActions: number };
  "run.start": { run: Run };
  "run.pause": { run: Run };
  "run.cancel": { run: Run };
  "run.retry": { run: Run; requeuedActions: number };
  "run.list": { runs: Run[] };
  "settings.get": { settings: RuntimeSettings };
  "settings.update": { settings: RuntimeSettings };
};

export type EventPayloadMap = {
  "run.status.changed": { runId: Id; status: Run["status"] };
  "run.progress": { runId: Id; done: number; total: number };
  "queue.depth.changed": { pending: number };
  "storage.entity.changed": { entity: string; id: Id };
  "rate_limit.detected": { platform: "x" | "reddit"; retryAfterSeconds?: number };
  "permission.required": { permission: string };
  "error.reported": { code: string; message: string; correlationId: string };
};
