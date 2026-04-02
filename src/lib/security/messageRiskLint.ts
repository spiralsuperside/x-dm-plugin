const linkPattern = /(https?:\/\/|www\.)/i;

function normalizeTokens(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccardSimilarity(left: string, right: string): number {
  const a = new Set(normalizeTokens(left));
  const b = new Set(normalizeTokens(right));
  if (a.size === 0 && b.size === 0) {
    return 1;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  const union = a.size + b.size - intersection;
  if (union === 0) {
    return 0;
  }
  return intersection / union;
}

export interface MessageRiskInput {
  message: string;
  isFirstMessage: boolean;
  recentMessages: string[];
  disallowLinksFirstMessage: boolean;
  similarityThreshold: number;
}

export interface MessageRiskResult {
  ok: boolean;
  code?: "FIRST_MESSAGE_LINK_BLOCKED" | "MESSAGE_TOO_SIMILAR";
  similarity?: number;
}

export function lintMessageRisk(input: MessageRiskInput): MessageRiskResult {
  if (input.disallowLinksFirstMessage && input.isFirstMessage && linkPattern.test(input.message)) {
    return { ok: false, code: "FIRST_MESSAGE_LINK_BLOCKED" };
  }

  let maxSimilarity = 0;
  for (const prior of input.recentMessages) {
    const score = jaccardSimilarity(input.message, prior);
    if (score > maxSimilarity) {
      maxSimilarity = score;
    }
  }
  if (maxSimilarity >= input.similarityThreshold) {
    return {
      ok: false,
      code: "MESSAGE_TOO_SIMILAR",
      similarity: maxSimilarity
    };
  }

  return { ok: true, similarity: maxSimilarity };
}

