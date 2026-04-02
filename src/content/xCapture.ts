export interface CapturedUser {
  id?: string;
  username: string;
  displayName?: string;
}

export function captureXCommenters(): CapturedUser[] {
  const anchorNodes = Array.from(document.querySelectorAll("a[href^='/' i]"));
  const users = new Map<string, CapturedUser>();
  for (const node of anchorNodes) {
    const href = node.getAttribute("href") ?? "";
    if (!href.startsWith("/") || href.includes("/status/")) {
      continue;
    }
    const username = href.replace("/", "").trim();
    if (!username || username.includes("/")) {
      continue;
    }
    if (!users.has(username.toLowerCase())) {
      users.set(username.toLowerCase(), {
        username,
        displayName: (node.textContent ?? "").trim() || username
      });
    }
  }
  return [...users.values()].slice(0, 200);
}
