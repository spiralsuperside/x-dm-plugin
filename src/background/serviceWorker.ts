import { registerRuntimeRouter } from "./router";
import { registerAlarmHandlers } from "./alarmHandlers";
import { ensureQueueAlarm } from "./queueScheduler";

registerRuntimeRouter();
registerAlarmHandlers();

chrome.runtime.onInstalled.addListener(async () => {
  await ensureQueueAlarm();
});
