import type { CapturedUser } from "./xCapture";

export function captureRedditUsers(): CapturedUser[] {
  const authorLinks = Array.from(document.querySelectorAll("a[href*='/user/']"));
  const users = new Map<string, CapturedUser>();
  for (const link of authorLinks) {
    const href = link.getAttribute("href") ?? "";
    const match = href.match(/\/user\/([^\/?#]+)/i);
    if (!match) {
      continue;
    }
    const username = match[1];
    if (!users.has(username.toLowerCase())) {
      users.set(username.toLowerCase(), {
        username,
        displayName: (link.textContent ?? "").trim() || username
      });
    }
  }
  return [...users.values()].slice(0, 200);
}
