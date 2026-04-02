import { useEffect, useState } from "react";
import { sendCommand } from "../lib/messaging/bus";
import type { Run } from "../types/entities";

export function QuickActions() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    void (async () => {
      const response = await sendCommand("run.list", {});
      setRuns(response.runs.slice(0, 5));
    })();
  }, []);

  const openSidePanel = async (): Promise<void> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return;
    }
    await chrome.sidePanel.open({ tabId: tab.id });
  };

  return (
    <section>
      <button onClick={() => void openSidePanel()}>Open Sidepanel</button>
      <h3>Recent Runs</h3>
      {runs.length === 0 ? <p>No runs yet.</p> : null}
      {runs.map((run) => (
        <p key={run.id}>
          {run.status} | sent {run.summary.sent}/{run.summary.queued}
        </p>
      ))}
    </section>
  );
}
