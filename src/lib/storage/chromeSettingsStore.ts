import type { RuntimeSettings } from "../../types/entities";

const SETTINGS_KEY = "runtimeSettings.v1";

export const defaultSettings: RuntimeSettings = {
  integrationMode: "demo",
  companionApiBaseUrl: "http://localhost:8787",
  dailyHardCap: 50,
  perMinuteCap: 10,
  minDelaySec: 25,
  maxDelaySec: 95,
  warmupEnabled: true,
  followupDelayMinutes: 180,
  stopOnRateLimit: true,
  messageSimilarityThreshold: 0.92,
  retentionDays: 90,
  maxRetries: 3
};

export const chromeSettingsStore = {
  async get(): Promise<RuntimeSettings> {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    const settings = result[SETTINGS_KEY] as RuntimeSettings | undefined;
    return settings ?? defaultSettings;
  },

  async set(patch: Partial<RuntimeSettings>): Promise<RuntimeSettings> {
    const current = await this.get();
    const merged = { ...current, ...patch };
    const next: RuntimeSettings = {
      ...merged,
      minDelaySec: Math.max(0, merged.minDelaySec),
      maxDelaySec: Math.max(Math.max(0, merged.minDelaySec), merged.maxDelaySec),
      messageSimilarityThreshold: Math.max(0.5, Math.min(1, merged.messageSimilarityThreshold)),
      retentionDays: Math.max(1, merged.retentionDays)
    };
    await chrome.storage.local.set({ [SETTINGS_KEY]: next });
    return next;
  }
};
