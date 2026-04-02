export interface CapturedUser {
  id?: string;
  username: string;
  displayName?: string;
}

function extractXUsernames(): string[] {
  const anchorNodes = Array.from(document.querySelectorAll("a[href^='/' i]"));
  const usernames = new Set<string>();
  for (const node of anchorNodes) {
    const href = node.getAttribute("href") ?? "";
    if (!href.startsWith("/") || href.includes("/status/")) {
      continue;
    }
    const username = href.replace("/", "").trim().replace(/^@/, "");
    if (!username || username.includes("/")) {
      continue;
    }
    usernames.add(username.toLowerCase());
  }
  return [...usernames];
}

export function captureXCommenters(): CapturedUser[] {
  return extractXUsernames()
    .slice(0, 200)
    .map((username) => ({ username, displayName: username }));
}

export function captureXReplyUsernames(): string[] {
  return extractXUsernames().slice(0, 200);
}
