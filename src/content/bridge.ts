import { captureXCommenters } from "./xCapture";
import { captureRedditUsers } from "./redditCapture";

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const parsed = message as { type?: string; platform?: "x" | "reddit" };
  if (parsed?.type !== "capture.targets") {
    return undefined;
  }
  if (parsed.platform === "x") {
    sendResponse({ users: captureXCommenters() });
    return true;
  }
  if (parsed.platform === "reddit") {
    sendResponse({ users: captureRedditUsers() });
    return true;
  }
  sendResponse({ users: [] });
  return true;
});
