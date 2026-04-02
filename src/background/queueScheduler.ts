export const RUN_QUEUE_ALARM = "xdm-run-queue-tick";

export async function ensureQueueAlarm(): Promise<void> {
  const existing = await chrome.alarms.get(RUN_QUEUE_ALARM);
  if (existing) {
    return;
  }
  await chrome.alarms.create(RUN_QUEUE_ALARM, {
    periodInMinutes: 0.5
  });
}

export async function removeQueueAlarm(): Promise<void> {
  await chrome.alarms.clear(RUN_QUEUE_ALARM);
}
