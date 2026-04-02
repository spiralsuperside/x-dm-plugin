import Dexie, { type Table } from "dexie";
import type { AnalyticsEvent, Campaign, Contact, ContactHistory, MessageTemplate, Run, RunAction } from "../../types/entities";

export class ExtensionDb extends Dexie {
  campaigns!: Table<Campaign, string>;
  contacts!: Table<Contact, string>;
  templates!: Table<MessageTemplate, string>;
  runs!: Table<Run, string>;
  runActions!: Table<RunAction, string>;
  contactHistory!: Table<ContactHistory, string>;
  events!: Table<AnalyticsEvent, string>;

  constructor() {
    super("xDmPluginDb");
    this.version(1).stores({
      campaigns: "id, platform, status, updatedAt",
      contacts: "id, campaignId, dedupeKey, platform, username",
      templates: "id, campaignId, updatedAt",
      runs: "id, campaignId, status, startedAt, updatedAt",
      runActions: "id, runId, campaignId, status, scheduledAt, idempotencyKey",
      contactHistory: "id, contactId, campaignId, [campaignId+contactId], updatedAt",
      events: "id, runId, campaignId, type, createdAt"
    });
  }
}

export const db = new ExtensionDb();
