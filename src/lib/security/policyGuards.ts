import type { Campaign, RuntimeSettings } from "../../types/entities";

export function enforceDailyCap(campaign: Campaign, alreadySentToday: number, settings: RuntimeSettings): void {
  const cap = Math.min(campaign.dailySendCap, settings.dailyHardCap);
  if (alreadySentToday >= cap) {
    throw new Error(`Daily cap reached (${cap}).`);
  }
}

export function enforceConfirmToSend(campaign: Campaign): void {
  if (campaign.requiresConfirmBeforeSend && campaign.status !== "active") {
    throw new Error("Campaign must be active and explicitly confirmed before sending.");
  }
}
