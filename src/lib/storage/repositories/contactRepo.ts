import { db } from "../dexieDb";
import type { Contact, ContactHistory, Id } from "../../../types/entities";
import type { Platform } from "../../../types/enums";

function nowIso(): string {
  return new Date().toISOString();
}

function dedupeKey(platform: Platform, platformUserId: string): string {
  return `${platform}:${platformUserId.trim().toLowerCase()}`;
}

export const contactRepo = {
  dedupeKey,

  async importCsv(campaignId: Id, platform: Platform, csvText: string): Promise<{ imported: number; deduped: number }> {
    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    let imported = 0;
    let deduped = 0;
    for (const line of lines) {
      const username = line.replace(/^@/, "");
      const key = dedupeKey(platform, username);
      const existing = await db.contacts.where("dedupeKey").equals(key).first();
      if (existing) {
        deduped += 1;
        continue;
      }
      const now = nowIso();
      const contact: Contact = {
        id: crypto.randomUUID(),
        campaignId,
        platform,
        platformUserId: username,
        username,
        displayName: username,
        dedupeKey: key,
        optOut: false,
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now
      };
      await db.contacts.add(contact);
      imported += 1;
    }

    return { imported, deduped };
  },

  async addCaptured(
    campaignId: Id,
    platform: Platform,
    users: Array<{ id?: string; username: string; displayName?: string }>
  ): Promise<number> {
    let imported = 0;
    for (const user of users) {
      const platformUserId = user.id ?? user.username;
      const key = dedupeKey(platform, platformUserId);
      const existing = await db.contacts.where("dedupeKey").equals(key).first();
      if (existing) {
        continue;
      }
      const now = nowIso();
      const contact: Contact = {
        id: crypto.randomUUID(),
        campaignId,
        platform,
        platformUserId,
        username: user.username,
        displayName: user.displayName,
        dedupeKey: key,
        optOut: false,
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now
      };
      await db.contacts.add(contact);
      imported += 1;
    }
    return imported;
  },

  async listByCampaign(campaignId: Id): Promise<Contact[]> {
    return db.contacts.where("campaignId").equals(campaignId).toArray();
  },

  async get(contactId: Id): Promise<Contact | undefined> {
    return db.contacts.get(contactId);
  },

  async hasPriorSend(campaignId: Id, contactId: Id): Promise<boolean> {
    const history = await db.contactHistory.where("[campaignId+contactId]").equals([campaignId, contactId]).first();
    return Boolean(history?.totalSent && history.totalSent > 0);
  },

  async markSent(campaignId: Id, contactId: Id): Promise<void> {
    const existing = await db.contactHistory.where("[campaignId+contactId]").equals([campaignId, contactId]).first();
    const now = nowIso();
    if (!existing) {
      const history: ContactHistory = {
        id: crypto.randomUUID(),
        campaignId,
        contactId,
        totalSent: 1,
        totalReplies: 0,
        lastSentAt: now,
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now
      };
      await db.contactHistory.add(history);
      return;
    }
    await db.contactHistory.put({
      ...existing,
      totalSent: existing.totalSent + 1,
      lastSentAt: now,
      updatedAt: now
    });
  }
};
