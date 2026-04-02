import { db } from "../dexieDb";
import type { Campaign, Id } from "../../../types/entities";
import type { Platform } from "../../../types/enums";

function nowIso(): string {
  return new Date().toISOString();
}

export const campaignRepo = {
  async create(input: {
    name: string;
    platform: Platform;
    dailySendCap?: number;
    requiresConfirmBeforeSend?: boolean;
  }): Promise<Campaign> {
    const now = nowIso();
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      name: input.name,
      platform: input.platform,
      status: "draft",
      dailySendCap: input.dailySendCap ?? 50,
      requiresConfirmBeforeSend: input.requiresConfirmBeforeSend ?? true,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now
    };
    await db.campaigns.add(campaign);
    return campaign;
  },

  async update(id: Id, patch: Partial<Campaign>): Promise<Campaign> {
    const existing = await db.campaigns.get(id);
    if (!existing) {
      throw new Error(`Campaign ${id} not found`);
    }
    const updated: Campaign = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: nowIso()
    };
    await db.campaigns.put(updated);
    return updated;
  },

  async list(): Promise<Campaign[]> {
    return db.campaigns.orderBy("updatedAt").reverse().toArray();
  },

  async get(id: Id): Promise<Campaign | undefined> {
    return db.campaigns.get(id);
  }
};
