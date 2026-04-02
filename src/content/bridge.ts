import { captureXCommenters, captureXReplyUsernames } from "./xCapture";
import { captureRedditReplyUsernames, captureRedditUsers } from "./redditCapture";

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const parsed = message as { type?: string; platform?: "x" | "reddit" };
  if (parsed?.type !== "capture.targets") {
    if (parsed?.type !== "capture.replies") {
      return undefined;
    }
    if (parsed.platform === "x") {
      sendResponse({ usernames: captureXReplyUsernames() });
      return true;
    }
    if (parsed.platform === "reddit") {
      sendResponse({ usernames: captureRedditReplyUsernames() });
      return true;
    }
    sendResponse({ usernames: [] });
    return true;
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
