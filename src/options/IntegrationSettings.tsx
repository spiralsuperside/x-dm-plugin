import { useEffect, useState } from "react";
import { sendCommand } from "../lib/messaging/bus";
import type { RuntimeSettings } from "../types/entities";

interface Props {
  settings: RuntimeSettings | null;
  onSaved: (settings: RuntimeSettings) => void;
}

export function IntegrationSettings({ settings, onSaved }: Props) {
  const [mode, setMode] = useState<"demo" | "browser_native">("browser_native");
  const [baseUrl, setBaseUrl] = useState("http://localhost:8787");

  useEffect(() => {
    if (!settings) {
      return;
    }
    setMode(settings.integrationMode);
    setBaseUrl(settings.companionApiBaseUrl);
  }, [settings]);

  const save = async (): Promise<void> => {
    const response = await sendCommand("settings.update", {
      patch: {
        integrationMode: mode,
        companionApiBaseUrl: baseUrl
      }
    });
    onSaved(response.settings);
  };

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
      <h3>Integration</h3>
      <label>
        Mode:
        <select value={mode} onChange={(event) => setMode(event.target.value as "demo" | "browser_native")}>
          <option value="demo">Demo</option>
          <option value="browser_native">Browser Native</option>
        </select>
      </label>
      <label>
        Companion API (legacy/fallback):
        <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
      </label>
      <button onClick={() => void save()}>Save Integration Settings</button>
    </section>
  );
}
