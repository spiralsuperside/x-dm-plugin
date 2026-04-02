import { useEffect, useState } from "react";
import { sendCommand } from "../lib/messaging/bus";
import type { RuntimeSettings } from "../types/entities";
import { IntegrationSettings } from "./IntegrationSettings";
import { SafetySettings } from "./SafetySettings";

export default function App() {
  const [settings, setSettings] = useState<RuntimeSettings | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await sendCommand("settings.get", {});
      setSettings(response.settings);
    })();
  }, []);

  return (
    <main style={{ maxWidth: 760, margin: "24px auto", display: "grid", gap: 12, fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
      <h1>DM Dad Local Settings</h1>
      <IntegrationSettings settings={settings} onSaved={setSettings} />
      <SafetySettings settings={settings} onSaved={setSettings} />
    </main>
  );
}
