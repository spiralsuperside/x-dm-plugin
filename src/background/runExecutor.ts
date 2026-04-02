import { contactRepo } from "../lib/storage/repositories/contactRepo";
import { runRepo } from "../lib/storage/repositories/runRepo";
import { campaignRepo } from "../lib/storage/repositories/campaignRepo";
import { eventRepo } from "../lib/storage/repositories/eventRepo";
import { chromeSettingsStore } from "../lib/storage/chromeSettingsStore";
import { enforceDailyCap } from "../lib/security/policyGuards";
import { enforcePerMinuteCap, nextBackoffDate } from "../lib/security/rateLimitGuards";
import { DemoAdapter } from "../lib/integration/adapters/demoAdapter";
import { XAdapter } from "../lib/integration/adapters/xAdapter";
import { RedditAdapter } from "../lib/integration/adapters/redditAdapter";
import { CompanionApiClient } from "../lib/integration/companionApiClient";
import type { IntegrationAdapter } from "../lib/integration/adapters/types";
import type { Id } from "../types/entities";
import { publishWorkerEvent } from "./router";

const EXECUTION_BATCH_SIZE = 5;

function adapterFor(platform: "x" | "reddit", mode: "demo" | "api", baseUrl: string): IntegrationAdapter {
  if (mode === "demo") {
    return new DemoAdapter();
  }
  const client = new CompanionApiClient(baseUrl);
  if (platform === "x") {
    return new XAdapter(client);
  }
  return new RedditAdapter(client);
}

async function updateRunSummary(runId: Id): Promise<void> {
  const run = await runRepo.get(runId);
  if (!run) {
    return;
  }
  const actions = await runRepo.listByRun(runId);
  const sent = actions.filter((a) => a.status === "done" && a.actionType === "send_dm").length;
  const failed = actions.filter((a) => a.status === "error").length;
  const pending = actions.filter((a) => a.status === "pending" || a.status === "executing").length;
  const queued = actions.length;
  const status = pending === 0 ? (failed > 0 ? "failed" : "completed") : run.status;
  const updated = await runRepo.update(runId, {
    status,
    summary: {
      ...run.summary,
      queued,
      sent,
      failed
    },
    finishedAt: pending === 0 ? new Date().toISOString() : run.finishedAt
  });

  await publishWorkerEvent("run.progress", {
    runId: runId,
    done: sent + failed,
    total: queued
  });
  await publishWorkerEvent("run.status.changed", { runId: updated.id, status: updated.status });
}

let minuteWindowStart = Date.now();
let minuteWindowCount = 0;

export async function processQueueTick(): Promise<void> {
  const settings = await chromeSettingsStore.get();
  if (Date.now() - minuteWindowStart >= 60_000) {
    minuteWindowStart = Date.now();
    minuteWindowCount = 0;
  }
  const actions = await runRepo.listPendingActions(EXECUTION_BATCH_SIZE);
  await publishWorkerEvent("queue.depth.changed", { pending: actions.length });
  for (const action of actions) {
    const run = await runRepo.get(action.runId);
    if (!run || run.status !== "running") {
      continue;
    }
    const campaign = await campaignRepo.get(action.campaignId);
    if (!campaign) {
      continue;
    }
    const alreadySentToday = await runRepo.countSentToday(campaign.id);
    try {
      enforceDailyCap(campaign, alreadySentToday, settings);
      enforcePerMinuteCap(minuteWindowCount, settings);
      const executing = await runRepo.markActionExecuting(action.id);
      const contact = await contactRepo.get(executing.contactId);
      if (!contact) {
        await runRepo.markActionError(executing.id, "CONTACT_NOT_FOUND", "fatal");
        continue;
      }
      const adapter = adapterFor(campaign.platform, settings.integrationMode, settings.companionApiBaseUrl);
      const result = await adapter.dispatch({
        platform: campaign.platform,
        actionType: executing.actionType,
        username: contact.username,
        message: executing.renderedMessage,
        idempotencyKey: executing.idempotencyKey
      });

      if (result.ok) {
        minuteWindowCount += 1;
        await runRepo.markActionDone(executing.id);
        if (executing.actionType === "send_dm") {
          await contactRepo.markSent(campaign.id, contact.id);
        }
        await eventRepo.log({
          runId: run.id,
          campaignId: campaign.id,
          type: "action_sent",
          correlationId: run.correlationId,
          data: {
            actionType: executing.actionType,
            username: contact.username
          }
        });
      } else if (result.retryable && action.retryCount < settings.maxRetries) {
        const backoff = nextBackoffDate(action.retryCount + 1, result.retryAfterSeconds);
        await runRepo.markActionError(executing.id, result.errorCode ?? "RETRYABLE_ERROR", backoff.retryClass, backoff.retryAt);
      } else {
        await runRepo.markActionError(executing.id, result.errorCode ?? "SEND_FAILED", "fatal");
        await eventRepo.log({
          runId: run.id,
          campaignId: campaign.id,
          type: "action_failed",
          correlationId: run.correlationId,
          data: {
            actionType: executing.actionType,
            code: result.errorCode ?? "SEND_FAILED"
          }
        });
      }
      await updateRunSummary(run.id);
    } catch (error) {
      await runRepo.markActionError(action.id, "POLICY_BLOCKED", "fatal");
      await publishWorkerEvent("error.reported", {
        code: "POLICY_BLOCKED",
        message: error instanceof Error ? error.message : "Policy blocked run execution.",
        correlationId: run?.correlationId ?? "unknown"
      });
      await updateRunSummary(action.runId);
    }
  }
}
