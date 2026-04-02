import { contactRepo } from "../lib/storage/repositories/contactRepo";
import { runRepo } from "../lib/storage/repositories/runRepo";
import { campaignRepo } from "../lib/storage/repositories/campaignRepo";
import { eventRepo } from "../lib/storage/repositories/eventRepo";
import { chromeSettingsStore } from "../lib/storage/chromeSettingsStore";
import { lintMessageRisk } from "../lib/security/messageRiskLint";
import { enforceConfirmToSend, enforceDailyCap } from "../lib/security/policyGuards";
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

function hashMessage(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return `h_${(hash >>> 0).toString(16)}`;
}

async function updateRunSummary(runId: Id): Promise<void> {
  const run = await runRepo.get(runId);
  if (!run) {
    return;
  }
  const actions = await runRepo.listByRun(runId);
  const sent = actions.filter((a) => a.status === "done" && a.actionType === "send_dm").length;
  const failed = actions.filter((a) => a.status === "error").length;
  const skipped = actions.filter(
    (a) => a.status === "error" && (a.errorCode === "FIRST_MESSAGE_LINK_BLOCKED" || a.errorCode === "MESSAGE_TOO_SIMILAR")
  ).length;
  const rateLimited = actions.filter(
    (a) => a.errorCode === "RATE_LIMIT" || a.errorCode === "HTTP_429" || a.retryClass === "rate_limited"
  ).length;
  const pending = actions.filter((a) => a.status === "pending" || a.status === "executing").length;
  const queued = actions.length;
  let status = run.status;
  if (pending === 0 && status !== "canceled") {
    status = failed > 0 ? "failed" : "sent";
  } else if (
    status === "rate_limited" &&
    run.rateLimitCooldownUntil &&
    run.rateLimitCooldownUntil <= new Date().toISOString()
  ) {
    status = "precheck";
  }
  const updated = await runRepo.update(runId, {
    status,
    summary: {
      ...run.summary,
      queued,
      sent,
      skipped,
      failed,
      rateLimited
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
  const actions = await runRepo.claimDueActions(EXECUTION_BATCH_SIZE);
  await publishWorkerEvent("queue.depth.changed", { pending: actions.length });
  for (const action of actions) {
    const run = await runRepo.get(action.runId);
    if (
      !run ||
      run.status === "queued" ||
      run.status === "paused" ||
      run.status === "canceled" ||
      run.status === "failed" ||
      run.status === "sent"
    ) {
      await runRepo.markActionError(action.id, "RUN_NOT_EXECUTABLE", "fatal");
      continue;
    }
    if (run.status === "rate_limited" && run.rateLimitCooldownUntil && run.rateLimitCooldownUntil > new Date().toISOString()) {
      await runRepo.markActionError(action.id, "RATE_LIMIT_COOLDOWN", "rate_limited", run.rateLimitCooldownUntil);
      continue;
    }
    const campaign = await campaignRepo.get(action.campaignId);
    if (!campaign) {
      await runRepo.markActionError(action.id, "CAMPAIGN_NOT_FOUND", "fatal");
      continue;
    }
    const alreadySentToday = await runRepo.countSentToday(campaign.id);
    try {
      enforceConfirmToSend(campaign);
      enforceDailyCap(campaign, alreadySentToday, settings);
      enforcePerMinuteCap(minuteWindowCount, settings);
      if (action.actionType === "warmup_like") {
        await runRepo.update(run.id, { status: "warming" });
      } else {
        await runRepo.update(run.id, { status: "sending" });
      }
      const executing = action;
      const contact = await contactRepo.get(executing.contactId);
      if (!contact) {
        await runRepo.markActionError(executing.id, "CONTACT_NOT_FOUND", "fatal");
        await eventRepo.log({
          runId: run.id,
          campaignId: campaign.id,
          type: "action_skipped",
          correlationId: run.correlationId,
          data: {
            actionType: executing.actionType,
            code: "CONTACT_NOT_FOUND"
          }
        });
        continue;
      }

      if (executing.actionType === "send_dm") {
        const hasPriorSend = await contactRepo.hasPriorSend(campaign.id, contact.id);
        const recentMessages = await runRepo.listRecentSentMessages(campaign.id, 20);
        const lint = lintMessageRisk({
          message: executing.renderedMessage,
          isFirstMessage: !hasPriorSend,
          recentMessages,
          disallowLinksFirstMessage: true,
          similarityThreshold: settings.messageSimilarityThreshold
        });
        if (!lint.ok) {
          await runRepo.markActionError(executing.id, lint.code ?? "MESSAGE_RISK_BLOCKED", "fatal");
          await eventRepo.log({
            runId: run.id,
            campaignId: campaign.id,
            type: "action_skipped",
            correlationId: run.correlationId,
            data: {
              actionType: executing.actionType,
              code: lint.code ?? "MESSAGE_RISK_BLOCKED",
              similarity: lint.similarity ?? 0
            }
          });
          await updateRunSummary(run.id);
          continue;
        }
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
          await contactRepo.markSent(campaign.id, contact.id, hashMessage(executing.renderedMessage));
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
        const updatedAction = await runRepo.markActionError(
          executing.id,
          result.errorCode ?? "RETRYABLE_ERROR",
          backoff.retryClass,
          backoff.retryAt
        );
        if (updatedAction.retryClass === "rate_limited") {
          await runRepo.update(run.id, {
            status: "rate_limited",
            rateLimitCooldownUntil: updatedAction.nextRetryAt
          });
          await publishWorkerEvent("rate_limit.detected", {
            platform: campaign.platform,
            retryAfterSeconds: result.retryAfterSeconds
          });
          if (settings.stopOnRateLimit) {
            await eventRepo.log({
              runId: run.id,
              campaignId: campaign.id,
              type: "rate_limited",
              correlationId: run.correlationId,
              data: {
                retryAfterSeconds: result.retryAfterSeconds ?? 0
              }
            });
          }
        }
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
      const latestRun = await runRepo.get(run.id);
      if (latestRun && latestRun.status !== "canceled" && latestRun.status !== "rate_limited") {
        await runRepo.update(run.id, { status: "precheck" });
      }
      await updateRunSummary(run.id);
    } catch (error) {
      await runRepo.markActionError(action.id, "POLICY_BLOCKED", "fatal");
      await runRepo.update(action.runId, { status: "failed", finishedAt: new Date().toISOString() });
      await publishWorkerEvent("error.reported", {
        code: "POLICY_BLOCKED",
        message: error instanceof Error ? error.message : "Policy blocked run execution.",
        correlationId: run?.correlationId ?? "unknown"
      });
      await updateRunSummary(action.runId);
    }
  }
}
