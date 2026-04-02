import { RUN_QUEUE_ALARM } from "./queueScheduler";
import { processQueueTick } from "./runExecutor";

export function registerAlarmHandlers(): void {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === RUN_QUEUE_ALARM) {
      await processQueueTick();
    }
  });
}
