export async function ensureOptionalHostPermission(originPattern: string): Promise<boolean> {
  const has = await chrome.permissions.contains({
    origins: [originPattern]
  });
  if (has) {
    return true;
  }
  return chrome.permissions.request({
    origins: [originPattern]
  });
}

export async function ensureOptionalPermission(permission: string): Promise<boolean> {
  const has = await chrome.permissions.contains({
    permissions: [permission]
  });
  if (has) {
    return true;
  }
  return chrome.permissions.request({
    permissions: [permission]
  });
}
