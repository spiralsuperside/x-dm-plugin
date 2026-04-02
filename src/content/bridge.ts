import { captureXCommenters, captureXReplyUsernames } from "./xCapture";
import { captureRedditReplyUsernames, captureRedditUsers } from "./redditCapture";
import { dispatchBrowserNativeDm } from "./dmSender";
import type { DispatchContext } from "../lib/integration/adapters/types";

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const parsed = message as { type?: string; platform?: "x" | "reddit"; context?: DispatchContext };
  if (parsed?.type === "dispatch.dm" && parsed.context) {
    void (async () => {
      const result = await dispatchBrowserNativeDm(parsed.context as DispatchContext);
      sendResponse(result);
    })();
    return true;
  }

  if (parsed?.type === "capture.replies") {
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

  if (parsed?.type === "capture.targets") {
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
  }

  return undefined;
});
