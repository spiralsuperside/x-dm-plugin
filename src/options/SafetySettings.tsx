import { useEffect, useState } from "react";
import { sendCommand } from "../lib/messaging/bus";
import type { RuntimeSettings } from "../types/entities";

interface Props {
  settings: RuntimeSettings | null;
  onSaved: (settings: RuntimeSettings) => void;
}

export function SafetySettings({ settings, onSaved }: Props) {
  const [dailyHardCap, setDailyHardCap] = useState(50);
  const [perMinuteCap, setPerMinuteCap] = useState(10);
  const [followupDelayMinutes, setFollowupDelayMinutes] = useState(180);
  const [maxRetries, setMaxRetries] = useState(3);

  useEffect(() => {
    if (!settings) {
      return;
    }
    setDailyHardCap(settings.dailyHardCap);
    setPerMinuteCap(settings.perMinuteCap);
    setFollowupDelayMinutes(settings.followupDelayMinutes);
    setMaxRetries(settings.maxRetries);
  }, [settings]);

  const save = async (): Promise<void> => {
    const response = await sendCommand("settings.update", {
      patch: {
        dailyHardCap,
        perMinuteCap,
        followupDelayMinutes,
        maxRetries
      }
    });
    onSaved(response.settings);
  };

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
      <h3>Safety</h3>
      <label>
        Daily hard cap:
        <input
          type="number"
          min={1}
          value={dailyHardCap}
          onChange={(event) => setDailyHardCap(Number(event.target.value))}
        />
      </label>
      <label>
        Per-minute cap:
        <input
          type="number"
          min={1}
          value={perMinuteCap}
          onChange={(event) => setPerMinuteCap(Number(event.target.value))}
        />
      </label>
      <label>
        Follow-up delay (min):
        <input
          type="number"
          min={1}
          value={followupDelayMinutes}
          onChange={(event) => setFollowupDelayMinutes(Number(event.target.value))}
        />
      </label>
      <label>
        Max retries:
        <input
          type="number"
          min={0}
          value={maxRetries}
          onChange={(event) => setMaxRetries(Number(event.target.value))}
        />
      </label>
      <button onClick={() => void save()}>Save Safety Settings</button>
    </section>
  );
}
