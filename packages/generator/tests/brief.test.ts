import { describe, expect, it } from "vitest";
import { validateBrief } from "../src/brief/loadBrief.js";
import { slugify } from "../src/util/slugify.js";

const validBrief = {
  business: {
    name: "Test Co",
    type: "local_service",
    country: "nl",
    city: "Utrecht",
    language: "nl",
    primary_goal: "contact_requests",
    short_description: "A test business.",
    services: ["Service A", "Service B"],
    contact: { phone: "+31 30 000 0000", email: "a@b.nl", address: null, booking_url: null },
    brand: { voice: "friendly" },
    compliance: { regulated_industry: false, medical_or_legal_claims_allowed: false },
  },
};

describe("validateBrief", () => {
  it("accepts a valid brief and applies integration defaults", () => {
    const result = validateBrief(validBrief);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.brief.integrations.cms).toBe("local-mdx");
      expect(result.brief.integrations.analytics).toBe("none");
    }
  });

  it("rejects an unknown business type with a path", () => {
    const bad = structuredClone(validBrief);
    (bad.business as { type: string }).type = "spaceship_repair";
    const result = validateBrief(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "business.type")).toBe(true);
    }
  });

  it("rejects an empty services list", () => {
    const bad = structuredClone(validBrief);
    bad.business.services = [];
    const result = validateBrief(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects unknown top-level keys (strict)", () => {
    const bad = { ...structuredClone(validBrief), surprise: true };
    const result = validateBrief(bad);
    expect(result.ok).toBe(false);
  });
});

describe("slugify", () => {
  it("folds diacritics and spaces", () => {
    expect(slugify("Echo's & Controles")).toBe("echo-s-controles");
    expect(slugify("Zwangerschapscontrôle")).toBe("zwangerschapscontrole");
  });
});
