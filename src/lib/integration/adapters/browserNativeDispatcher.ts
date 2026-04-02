import type { DispatchContext, DispatchResult } from "./types";

function tabMatchesPlatform(url: string, platform: DispatchContext["platform"]): boolean {
  if (platform === "x") {
    return url.includes("x.com/") || url.includes("twitter.com/");
  }
  return url.includes("reddit.com/");
}

export async function dispatchViaActiveTab(context: DispatchContext): Promise<DispatchResult> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    return {
      ok: false,
      retryable: false,
      errorCode: "NO_ACTIVE_TAB",
      errorMessage: "No active tab found. Open a logged-in platform tab."
    };
  }
  if (!tabMatchesPlatform(tab.url, context.platform)) {
    return {
      ok: false,
      retryable: false,
      errorCode: "WRONG_PLATFORM_TAB",
      errorMessage: `Active tab does not match ${context.platform}.`
    };
  }

  try {
    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: "dispatch.dm",
      context
    })) as DispatchResult | undefined;
    if (!response) {
      return {
        ok: false,
        retryable: true,
        errorCode: "NO_CONTENT_RESPONSE",
        errorMessage: "No response from content script dispatch handler."
      };
    }
    return response;
  } catch (error) {
    return {
      ok: false,
      retryable: true,
      errorCode: "TAB_DISPATCH_FAILED",
      errorMessage: error instanceof Error ? error.message : "Unknown tab dispatch error."
    };
  }
}

