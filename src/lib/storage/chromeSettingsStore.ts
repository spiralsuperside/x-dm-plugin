import type { RuntimeSettings } from "../../types/entities";

const SETTINGS_KEY = "runtimeSettings.v1";

export const defaultSettings: RuntimeSettings = {
  integrationMode: "demo",
  companionApiBaseUrl: "http://localhost:8787",
  dailyHardCap: 50,
  perMinuteCap: 10,
  warmupEnabled: true,
  followupDelayMinutes: 180,
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
    const next = { ...current, ...patch };
    await chrome.storage.local.set({ [SETTINGS_KEY]: next });
    return next;
  }
};
