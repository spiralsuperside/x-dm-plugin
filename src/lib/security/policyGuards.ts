import type { Campaign, RuntimeSettings } from "../../types/entities";

export function enforceDailyCap(campaign: Campaign, alreadySentToday: number, settings: RuntimeSettings): void {
  const cap = Math.min(campaign.dailySendCap, settings.dailyHardCap);
  if (alreadySentToday >= cap) {
    throw new Error(`Daily cap reached (${cap}).`);
  }
}

export function effectivePerMinuteCap(settings: RuntimeSettings, alreadySentToday: number): number {
  if (!settings.safeMode) {
    return settings.perMinuteCap;
  }
  if (alreadySentToday < 10) {
    return Math.min(settings.perMinuteCap, 1);
  }
  if (alreadySentToday < 25) {
    return Math.min(settings.perMinuteCap, 2);
  }
  return settings.perMinuteCap;
}

export function effectiveHourlyCap(settings: RuntimeSettings, alreadySentToday: number): number {
  if (!settings.safeMode) {
    return settings.hourlyHardCap;
  }
  if (alreadySentToday < 10) {
    return Math.min(settings.hourlyHardCap, 6);
  }
  if (alreadySentToday < 25) {
    return Math.min(settings.hourlyHardCap, 10);
  }
  return settings.hourlyHardCap;
}

export function enforceHourlyCap(alreadySentLastHour: number, settings: RuntimeSettings, alreadySentToday: number): void {
  const cap = effectiveHourlyCap(settings, alreadySentToday);
  if (alreadySentLastHour >= cap) {
    throw new Error(`Hourly cap reached (${cap}).`);
  }
}

export function enforceConfirmToSend(campaign: Campaign): void {
  if (campaign.requiresConfirmBeforeSend && campaign.status !== "active") {
    throw new Error("Campaign must be active and explicitly confirmed before sending.");
  }
}
