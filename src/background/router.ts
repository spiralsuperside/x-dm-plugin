import type { EventPayloadMap, EventType } from "../lib/messaging/contracts.v1";
import { isCommandEnvelope } from "../lib/messaging/validators";
import { campaignRepo } from "../lib/storage/repositories/campaignRepo";
import { contactRepo } from "../lib/storage/repositories/contactRepo";
import { templateRepo } from "../lib/storage/repositories/templateRepo";
import { runRepo } from "../lib/storage/repositories/runRepo";
import { eventRepo } from "../lib/storage/repositories/eventRepo";
import { chromeSettingsStore } from "../lib/storage/chromeSettingsStore";
import { renderTemplate } from "../lib/graph/coalescing";
import { ensureOptionalPermission } from "../lib/security/permissions";
import type { CommandPayloadMap, CommandResponseMap, CommandType, EventEnvelopeV1 } from "../lib/messaging/contracts.v1";
import { ensureQueueAlarm } from "./queueScheduler";

type CommandHandler<TType extends CommandType> = (
  payload: CommandPayloadMap[TType]
) => Promise<CommandResponseMap[TType]>;

function nowIso(): string {
  return new Date().toISOString();
}

const handlers: { [T in CommandType]: CommandHandler<T> } = {
  "project.create": async () => ({ projectId: crypto.randomUUID() }),
  "project.load": async () => ({ ok: true }),

  "campaign.create": async (payload) => {
    const campaign = await campaignRepo.create(payload);
    await publishWorkerEvent("storage.entity.changed", { entity: "campaign", id: campaign.id });
    return { campaign };
  },
  "campaign.list": async () => {
    const campaigns = await campaignRepo.list();
    return { campaigns };
  },
  "campaign.update": async (payload) => {
    const campaign = await campaignRepo.update(payload.id, payload.patch);
    await publishWorkerEvent("storage.entity.changed", { entity: "campaign", id: campaign.id });
    return { campaign };
  },

  "targets.import.csv": async (payload) => {
    const result = await contactRepo.importCsv(payload.campaignId, payload.platform, payload.csvText);
    await publishWorkerEvent("storage.entity.changed", { entity: "contact", id: payload.campaignId });
    return result;
  },
  "targets.list": async (payload) => {
    const contacts = await contactRepo.listByCampaign(payload.campaignId);
    return { contacts };
  },
  "target.capture.start": async (payload) => {
    const hasTabs = await ensureOptionalPermission("tabs");
    if (!hasTabs) {
      await publishWorkerEvent("permission.required", { permission: "tabs" });
      return { imported: 0 };
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return { imported: 0 };
    }
    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: "capture.targets",
      platform: payload.platform
    })) as { users?: Array<{ id?: string; username: string; displayName?: string }> } | undefined;
    const imported = await contactRepo.addCaptured(payload.campaignId, payload.platform, response?.users ?? []);
    return { imported };
  },

  "template.upsert": async (payload) => {
    const template = await templateRepo.upsert(payload);
    await publishWorkerEvent("storage.entity.changed", { entity: "template", id: template.id });
    return { template };
  },
  "template.get": async (payload) => {
    const template = await templateRepo.getByCampaign(payload.campaignId);
    return { template };
  },
  "template.preview.render": async (payload) => {
    const rendered = renderTemplate(payload.templateBody, { name: payload.name }, { seed: payload.seed ?? 1 });
    return { rendered };
  },

  "run.create": async (payload) => {
    const correlationId = crypto.randomUUID();
    const run = await runRepo.create(payload.campaignId, correlationId);
    const campaign = await campaignRepo.get(payload.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    const template = await templateRepo.getByCampaign(payload.campaignId);
    const contacts = await contactRepo.listByCampaign(payload.campaignId);
    const settings = await chromeSettingsStore.get();
    const actions: Array<{
      contactId: string;
      actionType: "warmup_like" | "send_dm" | "follow_up";
      renderedMessage: string;
      delayMinutes: number;
    }> = [];
    for (const contact of contacts) {
      const alreadySent = await contactRepo.hasPriorSend(payload.campaignId, contact.id);
      if (alreadySent || contact.optOut) {
        continue;
      }
      const rendered = renderTemplate(template?.body ?? "Hi {name}", { name: contact.displayName ?? contact.username }, {
        seed: Number(contact.id.replace(/\D/g, "").slice(0, 6) || "1"),
        disallowLinksFirstMessage: template?.disallowLinksFirstMessage ?? true
      });
      if (settings.warmupEnabled) {
        actions.push({
          contactId: contact.id,
          actionType: "warmup_like",
          renderedMessage: "",
          delayMinutes: 0
        });
      }
      actions.push({
        contactId: contact.id,
        actionType: "send_dm",
        renderedMessage: rendered,
        delayMinutes: settings.warmupEnabled ? 1 : 0
      });
      actions.push({
        contactId: contact.id,
        actionType: "follow_up",
        renderedMessage: `Following up in case you missed this, ${contact.displayName ?? contact.username}.`,
        delayMinutes: settings.followupDelayMinutes
      });
    }

    const queuedActions = await runRepo.enqueueActions({
      runId: run.id,
      campaignId: run.campaignId,
      actions
    });
    const updated = await runRepo.update(run.id, {
      summary: { ...run.summary, queued: queuedActions }
    });
    await eventRepo.log({
      runId: updated.id,
      campaignId: updated.campaignId,
      type: "run_created",
      correlationId,
      data: { queuedActions }
    });
    await publishWorkerEvent("run.status.changed", { runId: updated.id, status: updated.status });
    return { run: updated, queuedActions };
  },

  "run.start": async (payload) => {
    await ensureQueueAlarm();
    const run = await runRepo.update(payload.runId, {
      status: "running",
      startedAt: nowIso()
    });
    await publishWorkerEvent("run.status.changed", { runId: run.id, status: run.status });
    return { run };
  },
  "run.pause": async (payload) => {
    const run = await runRepo.update(payload.runId, { status: "paused" });
    await publishWorkerEvent("run.status.changed", { runId: run.id, status: run.status });
    return { run };
  },
  "run.cancel": async (payload) => {
    const run = await runRepo.update(payload.runId, { status: "canceled", finishedAt: nowIso() });
    await publishWorkerEvent("run.status.changed", { runId: run.id, status: run.status });
    return { run };
  },
  "run.list": async (payload) => {
    const runs = await runRepo.list(payload.campaignId);
    return { runs };
  },

  "settings.get": async () => {
    const settings = await chromeSettingsStore.get();
    return { settings };
  },
  "settings.update": async (payload) => {
    const settings = await chromeSettingsStore.set(payload.patch);
    return { settings };
  }
};

export async function publishWorkerEvent<TType extends EventType>(
  type: TType,
  payload: EventPayloadMap[TType]
): Promise<void> {
  const event: EventEnvelopeV1<EventPayloadMap[TType]> = {
    version: "v1",
    eventId: crypto.randomUUID(),
    type,
    payload,
    at: new Date().toISOString()
  };
  await chrome.runtime.sendMessage(event);
}

export function registerRuntimeRouter(): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isCommandEnvelope(message)) {
      return undefined;
    }
    const command = message;
    void (async () => {
      try {
        const handler = handlers[command.type as CommandType] as (payload: unknown) => Promise<unknown>;
        const result = await handler(command.payload);
        sendResponse(result);
      } catch (error) {
        await publishWorkerEvent("error.reported", {
          code: "COMMAND_FAILED",
          message: error instanceof Error ? error.message : "Unknown command error",
          correlationId: command.requestId
        });
        sendResponse({
          error: "COMMAND_FAILED",
          message: error instanceof Error ? error.message : "Unknown command error"
        });
      }
    })();
    return true;
  });
}
