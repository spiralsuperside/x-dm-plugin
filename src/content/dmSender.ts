import type { DispatchContext, DispatchResult } from "../lib/integration/adapters/types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSelector<T extends Element>(
  selectors: string[],
  timeoutMs: number
): Promise<T | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    for (const selector of selectors) {
      const match = document.querySelector(selector);
      if (match) {
        return match as T;
      }
    }
    await sleep(200);
  }
  return null;
}

function setTextValue(target: Element, value: string): void {
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    target.focus();
    target.value = value;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  const editable = target as HTMLElement;
  editable.focus();
  editable.textContent = value;
  editable.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
}

function isOnX(): boolean {
  return location.hostname.includes("x.com") || location.hostname.includes("twitter.com");
}

function isOnReddit(): boolean {
  return location.hostname.includes("reddit.com");
}

async function dispatchX(context: DispatchContext): Promise<DispatchResult> {
  if (!isOnX()) {
    return {
      ok: false,
      retryable: false,
      errorCode: "X_TAB_REQUIRED",
      errorMessage: "Open an X tab and stay logged in."
    };
  }

  const normalizedUsername = context.username.replace(/^@/, "");
  const profileUrl = `https://x.com/${encodeURIComponent(normalizedUsername)}`;
  if (!location.href.startsWith(profileUrl)) {
    location.assign(profileUrl);
    await sleep(1800);
  }

  const messageButton = await waitForSelector<HTMLElement>(
    [
      "[data-testid='sendDMFromProfile']",
      "a[href*='/messages/compose']",
      "button[aria-label*='Message']",
      "button[aria-label*='message']"
    ],
    12000
  );
  if (!messageButton) {
    return {
      ok: false,
      retryable: true,
      errorCode: "X_MESSAGE_BUTTON_NOT_FOUND",
      errorMessage: "Unable to locate Message button on X profile."
    };
  }
  messageButton.click();

  const composer = await waitForSelector<HTMLElement>(
    [
      "div[data-testid='dmComposerTextInput'] div[contenteditable='true']",
      "div[data-testid='dmComposerTextInput']",
      "div[role='textbox'][contenteditable='true']"
    ],
    12000
  );
  if (!composer) {
    return {
      ok: false,
      retryable: true,
      errorCode: "X_COMPOSER_NOT_FOUND",
      errorMessage: "Unable to open X DM composer."
    };
  }

  setTextValue(composer, context.message);
  await sleep(250);

  const sendButton = await waitForSelector<HTMLElement>(
    ["[data-testid='dmComposerSendButton']", "button[aria-label*='Send']"],
    8000
  );
  if (!sendButton) {
    return {
      ok: false,
      retryable: true,
      errorCode: "X_SEND_BUTTON_NOT_FOUND",
      errorMessage: "Unable to locate X DM send button."
    };
  }
  sendButton.click();

  return {
    ok: true,
    externalId: `x:${context.idempotencyKey}`
  };
}

async function dispatchReddit(context: DispatchContext): Promise<DispatchResult> {
  if (!isOnReddit()) {
    return {
      ok: false,
      retryable: false,
      errorCode: "REDDIT_TAB_REQUIRED",
      errorMessage: "Open a Reddit tab and stay logged in."
    };
  }

  const normalizedUsername = context.username.replace(/^@/, "");
  const composeUrl =
    `https://www.reddit.com/message/compose/?to=${encodeURIComponent(normalizedUsername)}` +
    `&subject=${encodeURIComponent("Quick question")}` +
    `&message=${encodeURIComponent(context.message)}`;
  if (!location.href.includes("/message/compose")) {
    location.assign(composeUrl);
    await sleep(1500);
  }

  const toInput = await waitForSelector<HTMLInputElement>(["input[name='to']", "input#compose-to"], 10000);
  const subjectInput = await waitForSelector<HTMLInputElement>(["input[name='subject']", "input#compose-subject"], 10000);
  const messageInput = await waitForSelector<HTMLTextAreaElement>(["textarea[name='message']", "textarea#compose-message"], 10000);
  if (!toInput || !subjectInput || !messageInput) {
    return {
      ok: false,
      retryable: true,
      errorCode: "REDDIT_COMPOSE_FIELDS_NOT_FOUND",
      errorMessage: "Unable to locate Reddit compose fields."
    };
  }

  setTextValue(toInput, normalizedUsername);
  setTextValue(subjectInput, "Quick question");
  setTextValue(messageInput, context.message);
  await sleep(250);

  const sendButton = await waitForSelector<HTMLElement>(
    ["button[type='submit']", "button[name='send']", "button[data-testid='send-button']"],
    8000
  );
  if (!sendButton) {
    return {
      ok: false,
      retryable: true,
      errorCode: "REDDIT_SEND_BUTTON_NOT_FOUND",
      errorMessage: "Unable to locate Reddit send button."
    };
  }
  sendButton.click();
  return {
    ok: true,
    externalId: `reddit:${context.idempotencyKey}`
  };
}

export async function dispatchBrowserNativeDm(context: DispatchContext): Promise<DispatchResult> {
  if (context.actionType !== "send_dm" && context.actionType !== "follow_up") {
    return {
      ok: true,
      externalId: `noop:${context.idempotencyKey}`
    };
  }
  if (context.platform === "x") {
    return dispatchX(context);
  }
  return dispatchReddit(context);
}

