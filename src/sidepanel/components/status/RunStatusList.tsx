import { useCampaignStore } from "../../store/campaignStore";

export function RunStatusList() {
  const { runs, startRun, pauseRun, cancelRun, retryRun } = useCampaignStore();

  if (runs.length === 0) {
    return <p>No runs yet.</p>;
  }

  return (
    <div className="list">
      {runs.map((run) => (
        <article className="card" key={run.id}>
          <strong>{run.status.toUpperCase()}</strong>
          <p>Queued: {run.summary.queued}</p>
          <p>Sent: {run.summary.sent}</p>
          <p>Skipped: {run.summary.skipped}</p>
          <p>Failed: {run.summary.failed}</p>
          <p>Rate limited: {run.summary.rateLimited}</p>
          <div className="row">
            <button onClick={() => void startRun(run.id)}>Start</button>
            <button onClick={() => void pauseRun(run.id)}>Pause</button>
            <button onClick={() => void retryRun(run.id)}>Retry</button>
            <button onClick={() => void cancelRun(run.id)}>Cancel</button>
          </div>
        </article>
      ))}
    </div>
  );
}
