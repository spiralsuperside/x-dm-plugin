import { useCampaignStore } from "../../store/campaignStore";

export function RunStatusList() {
  const { runs, startRun, pauseRun } = useCampaignStore();

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
          <p>Failed: {run.summary.failed}</p>
          <div className="row">
            <button onClick={() => void startRun(run.id)}>Start</button>
            <button onClick={() => void pauseRun(run.id)}>Pause</button>
          </div>
        </article>
      ))}
    </div>
  );
}
