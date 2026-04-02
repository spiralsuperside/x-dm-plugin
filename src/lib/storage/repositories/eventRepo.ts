import { db } from "../dexieDb";
import type { AnalyticsEvent, Id } from "../../../types/entities";

function nowIso(): string {
  return new Date().toISOString();
}

export const eventRepo = {
  async log(input: Omit<AnalyticsEvent, "id" | "schemaVersion" | "createdAt" | "updatedAt">): Promise<AnalyticsEvent> {
    const now = nowIso();
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      ...input,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now
    };
    await db.events.add(event);
    return event;
  },

  async listByRun(runId: Id): Promise<AnalyticsEvent[]> {
    return db.events.where("runId").equals(runId).toArray();
  }
};
