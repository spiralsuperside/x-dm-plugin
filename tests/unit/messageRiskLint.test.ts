import { describe, expect, it } from "vitest";
import { lintMessageRisk } from "../../src/lib/security/messageRiskLint";

describe("messageRiskLint", () => {
  it("blocks links on first message when policy disallows them", () => {
    const result = lintMessageRisk({
      message: "Hi {name}, see https://example.com",
      isFirstMessage: true,
      recentMessages: [],
      disallowLinksFirstMessage: true,
      similarityThreshold: 0.9
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("FIRST_MESSAGE_LINK_BLOCKED");
  });

  it("flags messages that are too similar to recent sends", () => {
    const result = lintMessageRisk({
      message: "Hey Alex quick question about your pipeline setup",
      isFirstMessage: false,
      recentMessages: ["Hey Alex quick question about your pipeline setup"],
      disallowLinksFirstMessage: true,
      similarityThreshold: 0.9
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("MESSAGE_TOO_SIMILAR");
  });
});

