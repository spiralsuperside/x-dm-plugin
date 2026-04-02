import type { CapturedUser } from "./xCapture";

function extractRedditUsernames(): string[] {
  const authorLinks = Array.from(document.querySelectorAll("a[href*='/user/']"));
  const users = new Set<string>();
  for (const link of authorLinks) {
    const href = link.getAttribute("href") ?? "";
    const match = href.match(/\/user\/([^\/?#]+)/i);
    if (!match) {
      continue;
    }
    users.add(match[1].toLowerCase());
  }
  return [...users];
}

export function captureRedditUsers(): CapturedUser[] {
  return extractRedditUsernames()
    .slice(0, 200)
    .map((username) => ({ username, displayName: username }));
}

export function captureRedditReplyUsernames(): string[] {
  return extractRedditUsernames().slice(0, 200);
}
