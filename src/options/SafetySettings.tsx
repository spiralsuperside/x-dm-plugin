import { useEffect, useState } from "react";
import { sendCommand } from "../lib/messaging/bus";
import type { RuntimeSettings } from "../types/entities";

interface Props {
  settings: RuntimeSettings | null;
  onSaved: (settings: RuntimeSettings) => void;
}

export function SafetySettings({ settings, onSaved }: Props) {
  const [safeMode, setSafeMode] = useState(true);
  const [dailyHardCap, setDailyHardCap] = useState(50);
  const [hourlyHardCap, setHourlyHardCap] = useState(12);
  const [perMinuteCap, setPerMinuteCap] = useState(10);
  const [minDelaySec, setMinDelaySec] = useState(25);
  const [maxDelaySec, setMaxDelaySec] = useState(95);
  const [followupDelayMinutes, setFollowupDelayMinutes] = useState(180);
  const [requireRunStartConfirmation, setRequireRunStartConfirmation] = useState(true);
  const [stopOnRateLimit, setStopOnRateLimit] = useState(true);
  const [messageSimilarityThreshold, setMessageSimilarityThreshold] = useState(0.92);
  const [retentionDays, setRetentionDays] = useState(90);
  const [maxRetries, setMaxRetries] = useState(3);

  useEffect(() => {
    if (!settings) {
      return;
    }
    setSafeMode(settings.safeMode);
    setDailyHardCap(settings.dailyHardCap);
    setHourlyHardCap(settings.hourlyHardCap);
    setPerMinuteCap(settings.perMinuteCap);
    setMinDelaySec(settings.minDelaySec);
    setMaxDelaySec(settings.maxDelaySec);
    setFollowupDelayMinutes(settings.followupDelayMinutes);
    setRequireRunStartConfirmation(settings.requireRunStartConfirmation);
    setStopOnRateLimit(settings.stopOnRateLimit);
    setMessageSimilarityThreshold(settings.messageSimilarityThreshold);
    setRetentionDays(settings.retentionDays);
    setMaxRetries(settings.maxRetries);
  }, [settings]);

  const save = async (): Promise<void> => {
    const normalizedMinDelay = Math.max(0, minDelaySec);
    const normalizedMaxDelay = Math.max(normalizedMinDelay, maxDelaySec);
    const response = await sendCommand("settings.update", {
      patch: {
        safeMode,
        dailyHardCap,
        hourlyHardCap,
        perMinuteCap,
        minDelaySec: normalizedMinDelay,
        maxDelaySec: normalizedMaxDelay,
        followupDelayMinutes,
        requireRunStartConfirmation,
        stopOnRateLimit,
        messageSimilarityThreshold,
        retentionDays,
        maxRetries
      }
    });
    onSaved(response.settings);
  };

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
      <h3>Safety</h3>
      <label>
        Safe mode (ramped limits/delays):
        <input type="checkbox" checked={safeMode} onChange={(event) => setSafeMode(event.target.checked)} />
      </label>
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
        Hourly hard cap:
        <input
          type="number"
          min={1}
          value={hourlyHardCap}
          onChange={(event) => setHourlyHardCap(Number(event.target.value))}
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
        Min delay (sec):
        <input type="number" min={0} value={minDelaySec} onChange={(event) => setMinDelaySec(Number(event.target.value))} />
      </label>
      <label>
        Max delay (sec):
        <input type="number" min={0} value={maxDelaySec} onChange={(event) => setMaxDelaySec(Number(event.target.value))} />
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
        Require run start confirmation:
        <input
          type="checkbox"
          checked={requireRunStartConfirmation}
          onChange={(event) => setRequireRunStartConfirmation(event.target.checked)}
        />
      </label>
      <label>
        Message similarity threshold:
        <input
          type="number"
          min={0.5}
          max={1}
          step={0.01}
          value={messageSimilarityThreshold}
          onChange={(event) => setMessageSimilarityThreshold(Number(event.target.value))}
        />
      </label>
      <label>
        Retention (days):
        <input
          type="number"
          min={1}
          value={retentionDays}
          onChange={(event) => setRetentionDays(Number(event.target.value))}
        />
      </label>
      <label>
        Stop on rate-limit:
        <input type="checkbox" checked={stopOnRateLimit} onChange={(event) => setStopOnRateLimit(event.target.checked)} />
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
