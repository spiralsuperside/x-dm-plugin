import { db } from "../dexieDb";
import type { ActionType } from "../../../types/enums";
import type { Id, Run, RunAction } from "../../../types/entities";

function nowIso(): string {
  return new Date().toISOString();
}

function nextScheduled(at: Date, offsetMinutes: number): string {
  return new Date(at.getTime() + offsetMinutes * 60_000).toISOString();
}

export const runRepo = {
  async create(campaignId: Id, correlationId: string): Promise<Run> {
    const now = nowIso();
    const run: Run = {
      id: crypto.randomUUID(),
      campaignId,
      status: "queued",
      correlationId,
      summary: {
        queued: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        rateLimited: 0
      },
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now
    };
    await db.runs.add(run);
    return run;
  },

  async update(runId: Id, patch: Partial<Run>): Promise<Run> {
    const existing = await db.runs.get(runId);
    if (!existing) {
      throw new Error(`Run ${runId} not found`);
    }
    const updated: Run = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: nowIso()
    };
    await db.runs.put(updated);
    return updated;
  },

  async get(runId: Id): Promise<Run | undefined> {
    return db.runs.get(runId);
  },

  async list(campaignId?: Id): Promise<Run[]> {
    if (campaignId) {
      return db.runs.where("campaignId").equals(campaignId).reverse().sortBy("updatedAt");
    }
    return db.runs.orderBy("updatedAt").reverse().toArray();
  },

  async enqueueActions(input: {
    runId: Id;
    campaignId: Id;
    actions: Array<{ contactId: Id; actionType: ActionType; renderedMessage: string; delayMinutes: number }>;
  }): Promise<number> {
    const baseTime = new Date();
    const now = nowIso();
    const rows: RunAction[] = input.actions.map((action, index) => ({
      id: crypto.randomUUID(),
      runId: input.runId,
      campaignId: input.campaignId,
      contactId: action.contactId,
      actionType: action.actionType,
      sequence: index,
      scheduledAt: nextScheduled(baseTime, action.delayMinutes),
      status: "pending",
      idempotencyKey: `${input.runId}:${action.contactId}:${action.actionType}:${index}`,
      retryCount: 0,
      retryClass: "none",
      renderedMessage: action.renderedMessage,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now
    }));

    await db.runActions.bulkAdd(rows);
    return rows.length;
  },

  async listPendingActions(limit: number): Promise<RunAction[]> {
    const now = nowIso();
    const pending = await db.runActions.where("status").equals("pending").toArray();
    return pending
      .filter((row) => row.scheduledAt <= now)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .slice(0, limit);
  },

  async markActionExecuting(actionId: Id): Promise<RunAction> {
    const existing = await db.runActions.get(actionId);
    if (!existing) {
      throw new Error(`Action ${actionId} not found`);
    }
    const updated: RunAction = { ...existing, status: "executing", updatedAt: nowIso() };
    await db.runActions.put(updated);
    return updated;
  },

  async markActionDone(actionId: Id): Promise<RunAction> {
    const existing = await db.runActions.get(actionId);
    if (!existing) {
      throw new Error(`Action ${actionId} not found`);
    }
    const updated: RunAction = { ...existing, status: "done", updatedAt: nowIso() };
    await db.runActions.put(updated);
    return updated;
  },

  async markActionError(actionId: Id, errorCode: string, retryClass: RunAction["retryClass"], nextRetryAt?: string): Promise<RunAction> {
    const existing = await db.runActions.get(actionId);
    if (!existing) {
      throw new Error(`Action ${actionId} not found`);
    }
    const retryCount = existing.retryCount + 1;
    const updated: RunAction = {
      ...existing,
      status: nextRetryAt ? "pending" : "error",
      errorCode,
      retryClass,
      retryCount,
      nextRetryAt,
      scheduledAt: nextRetryAt ?? existing.scheduledAt,
      updatedAt: nowIso()
    };
    await db.runActions.put(updated);
    return updated;
  },

  async countByRun(runId: Id): Promise<{ total: number; done: number; error: number; pending: number }> {
    const actions = await db.runActions.where("runId").equals(runId).toArray();
    const total = actions.length;
    const done = actions.filter((a) => a.status === "done").length;
    const error = actions.filter((a) => a.status === "error").length;
    const pending = actions.filter((a) => a.status === "pending" || a.status === "executing").length;
    return { total, done, error, pending };
  },

  async countSentToday(campaignId: Id): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startIso = today.toISOString();
    const actions = await db.runActions.where("campaignId").equals(campaignId).toArray();
    return actions.filter((a) => a.status === "done" && a.updatedAt >= startIso && a.actionType === "send_dm").length;
  },

  async listByRun(runId: Id): Promise<RunAction[]> {
    return db.runActions.where("runId").equals(runId).sortBy("sequence");
  }
};
