import { useState } from "react";
import { useCampaignStore } from "../../store/campaignStore";

export function RunStatusList() {
  const { runs, startRun, pauseRun, cancelRun, retryRun, emergencyStopRuns } = useCampaignStore();
  const [confirmationInputs, setConfirmationInputs] = useState<Record<string, string>>({});

  if (runs.length === 0) {
    return <p>No runs yet.</p>;
  }

  return (
    <div className="list">
      <div className="row">
        <button onClick={() => void emergencyStopRuns()}>Emergency Stop Active Runs</button>
      </div>
      {runs.map((run) => (
        <article className="card" key={run.id} style={{ display: "grid", gap: 6 }}>
          <strong>{run.status.toUpperCase()}</strong>
          <p>Queued: {run.summary.queued}</p>
          <p>Sent: {run.summary.sent}</p>
          <p>Skipped: {run.summary.skipped}</p>
          <p>Failed: {run.summary.failed}</p>
          <p>Rate limited: {run.summary.rateLimited}</p>
          {run.requiresConfirmation ? (
            <div style={{ display: "grid", gap: 4 }}>
              <p>Start code: <code>{run.confirmationPhrase}</code></p>
              <input
                placeholder="Type start code"
                value={confirmationInputs[run.id] ?? ""}
                onChange={(event) =>
                  setConfirmationInputs((current) => ({ ...current, [run.id]: event.target.value }))
                }
              />
            </div>
          ) : null}
          <div className="row">
            <button onClick={() => void startRun(run.id, confirmationInputs[run.id])}>Start</button>
            <button onClick={() => void pauseRun(run.id)}>Pause</button>
            <button onClick={() => void retryRun(run.id)}>Retry</button>
            <button onClick={() => void cancelRun(run.id)}>Cancel</button>
          </div>
        </article>
      ))}
    </div>
  );
}
