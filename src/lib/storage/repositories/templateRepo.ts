import { db } from "../dexieDb";
import type { Id, MessageTemplate } from "../../../types/entities";

function nowIso(): string {
  return new Date().toISOString();
}

export const templateRepo = {
  async upsert(input: {
    campaignId: Id;
    name: string;
    body: string;
    disallowLinksFirstMessage?: boolean;
  }): Promise<MessageTemplate> {
    const existing = await db.templates.where("campaignId").equals(input.campaignId).first();
    const now = nowIso();
    if (!existing) {
      const template: MessageTemplate = {
        id: crypto.randomUUID(),
        campaignId: input.campaignId,
        name: input.name,
        body: input.body,
        disallowLinksFirstMessage: input.disallowLinksFirstMessage ?? true,
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now
      };
      await db.templates.add(template);
      return template;
    }
    const updated: MessageTemplate = {
      ...existing,
      name: input.name,
      body: input.body,
      disallowLinksFirstMessage: input.disallowLinksFirstMessage ?? existing.disallowLinksFirstMessage,
      updatedAt: now
    };
    await db.templates.put(updated);
    return updated;
  },

  async getByCampaign(campaignId: Id): Promise<MessageTemplate | null> {
    return (await db.templates.where("campaignId").equals(campaignId).first()) ?? null;
  }
};
