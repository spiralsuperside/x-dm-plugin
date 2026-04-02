const tokenPattern = /(bearer\s+[a-z0-9\-_\.]+|oauth_[a-z0-9\-_\.]+)/gi;

export function redactSecrets(value: string): string {
  return value.replace(tokenPattern, "[REDACTED_TOKEN]");
}

export function redactObject<T>(input: T): T {
  return JSON.parse(
    JSON.stringify(input, (_key, val) => {
      if (typeof val === "string") {
        return redactSecrets(val);
      }
      return val;
    })
  ) as T;
}
