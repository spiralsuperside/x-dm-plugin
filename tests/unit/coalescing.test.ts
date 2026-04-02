import { describe, expect, it } from "vitest";
import { applySpintax, renderTemplate } from "../../src/lib/graph/coalescing";

describe("coalescing", () => {
  it("renders deterministic spintax with a fixed seed", () => {
    const one = applySpintax("{Hey|Hi|Hello} {name}", 9).replace("{name}", "Alex");
    const two = applySpintax("{Hey|Hi|Hello} {name}", 9).replace("{name}", "Alex");
    expect(one).toBe(two);
  });

  it("substitutes name token", () => {
    const rendered = renderTemplate("Hi {name}", { name: "Casey" });
    expect(rendered).toBe("Hi Casey");
  });

  it("blocks links when first-message links are disabled", () => {
    expect(() =>
      renderTemplate("Visit https://example.com {name}", { name: "Alex" }, { disallowLinksFirstMessage: true })
    ).toThrow();
  });
});
