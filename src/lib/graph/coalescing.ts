const linkPattern = /(https?:\/\/|www\.)/i;

function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function renderTemplate(
  templateBody: string,
  context: { name: string },
  options?: { seed?: number; disallowLinksFirstMessage?: boolean }
): string {
  let output = templateBody;
  output = output.replace(/\{name\}/g, context.name);
  output = applySpintax(output, options?.seed ?? 1);
  if (options?.disallowLinksFirstMessage && linkPattern.test(output)) {
    throw new Error("Template contains a link while first-message links are disallowed.");
  }
  return output;
}

export function applySpintax(input: string, seed: number): string {
  const random = seededRandom(seed);
  return input.replace(/\{([^{}]+)\}/g, (match, group) => {
    if (!group.includes("|")) {
      return match;
    }
    const variants = group
      .split("|")
      .map((item: string) => item.trim())
      .filter(Boolean);
    if (variants.length === 0) {
      return "";
    }
    const index = Math.floor(random() * variants.length);
    return variants[index] ?? variants[0];
  });
}
