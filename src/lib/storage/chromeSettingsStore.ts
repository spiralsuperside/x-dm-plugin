import type { RuntimeSettings } from "../../types/entities";

const SETTINGS_KEY = "runtimeSettings.v1";

export const defaultSettings: RuntimeSettings = {
  integrationMode: "browser_native",
  companionApiBaseUrl: "http://localhost:8787",
  safeMode: true,
  dailyHardCap: 40,
  hourlyHardCap: 12,
  perMinuteCap: 2,
  minDelaySec: 35,
  maxDelaySec: 120,
  warmupEnabled: true,
  followupDelayMinutes: 180,
  requireRunStartConfirmation: true,
  stopOnRateLimit: true,
  messageSimilarityThreshold: 0.92,
  retentionDays: 90,
  maxRetries: 3
};

export const chromeSettingsStore = {
  async get(): Promise<RuntimeSettings> {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    const settings = result[SETTINGS_KEY] as Partial<RuntimeSettings> | undefined;
    const merged: RuntimeSettings = {
      ...defaultSettings,
      ...(settings ?? {})
    };
    if ((settings as { integrationMode?: string } | undefined)?.integrationMode === "api") {
      merged.integrationMode = "browser_native";
    }
    return merged;
  },

  async set(patch: Partial<RuntimeSettings>): Promise<RuntimeSettings> {
    const current = await this.get();
    const merged = { ...current, ...patch };
    const next: RuntimeSettings = {
      ...merged,
      dailyHardCap: Math.max(1, merged.dailyHardCap),
      hourlyHardCap: Math.max(1, merged.hourlyHardCap),
      perMinuteCap: Math.max(1, merged.perMinuteCap),
      minDelaySec: Math.max(0, merged.minDelaySec),
      maxDelaySec: Math.max(Math.max(0, merged.minDelaySec), merged.maxDelaySec),
      messageSimilarityThreshold: Math.max(0.5, Math.min(1, merged.messageSimilarityThreshold)),
      retentionDays: Math.max(1, merged.retentionDays)
    };
    await chrome.storage.local.set({ [SETTINGS_KEY]: next });
    return next;
  }
};
