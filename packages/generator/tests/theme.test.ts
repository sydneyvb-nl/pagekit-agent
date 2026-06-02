import { describe, expect, it } from "vitest";
import { resolveTheme } from "../src/theme/resolveTheme.js";

describe("resolveTheme", () => {
  const theme = resolveTheme("warm-family-practice");

  it("maps preset colors to CSS custom properties", () => {
    expect(theme.cssVariables["--color-accent"]).toBe("#c4694a");
    expect(theme.cssVariables["--color-bg"]).toBe("#fffaf6");
  });

  it("resolves the preset's font choice through the token families map", () => {
    expect(theme.cssVariables["--font-heading"]).toContain("Georgia");
    expect(theme.cssVariables["--font-body"]).toContain("system-ui");
  });

  it("emits the type, spacing and radius scales as rem variables", () => {
    expect(theme.cssVariables["--text-h1"]).toBe("2.75rem");
    expect(theme.cssVariables["--space-md"]).toBe("1rem");
    expect(theme.cssVariables["--radius"]).toBe("0.75rem");
  });

  it("lets explicit brand colors override the accent without inventing one", () => {
    const branded = resolveTheme("warm-family-practice", { brandColors: ["#123abc"] });
    expect(branded.cssVariables["--color-accent"]).toBe("#123abc");
    const ignored = resolveTheme("warm-family-practice", { brandColors: ["not-a-color"] });
    expect(ignored.cssVariables["--color-accent"]).toBe("#c4694a");
  });

  it("throws clearly for an unknown theme", () => {
    expect(() => resolveTheme("does-not-exist")).toThrow(/No theme preset/);
  });
});
