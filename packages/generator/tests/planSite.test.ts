import { describe, expect, it } from "vitest";
import { planSite } from "../src/plan/planSite.js";
import { validatePlan } from "../src/plan/validatePlan.js";
import type { Brief } from "../src/brief/schema.js";
import type { Vertical } from "../src/vertical/schema.js";

const brief: Brief = {
  business: {
    name: "Verloskundigenpraktijk Example",
    type: "midwifery_practice",
    country: "nl",
    city: "Den Haag",
    language: "nl",
    primary_goal: "registrations",
    short_description: "Warme verloskundige zorg.",
    services: ["Zwangerschapscontroles", "Echo's", "Kraamzorg"],
    contact: {
      phone: "+31 70 000 0000",
      email: "info@example.nl",
      address: null,
      booking_url: "https://example.com/inschrijven",
    },
    brand: { voice: "warm" },
    compliance: { regulated_industry: true, medical_or_legal_claims_allowed: false },
  },
  integrations: { analytics: "plausible", forms: "formspree", cms: "local-mdx" },
};

const vertical: Vertical = {
  id: "midwifery_practice",
  label: "Midwifery Practice",
  regulated: true,
  recommended_theme: "warm-family-practice",
  schema_default: "MedicalBusiness",
  primary_goal_options: ["registrations"],
  required_pages: ["home", "services", "service", "about", "team", "location", "contact", "faq"],
  content_cautions: ["Do not make medical guarantees."],
};

describe("planSite", () => {
  const plan = planSite({ brief, vertical, usedFallbackVertical: false });

  it("creates one detail page per service", () => {
    const servicePages = plan.pages.filter((p) => p.pageType === "service");
    expect(servicePages).toHaveLength(3);
    expect(servicePages.map((p) => p.route)).toContain("/services/echo-s/");
  });

  it("always injects privacy + 404, and cookies when integrations are active", () => {
    const types = plan.pages.map((p) => p.pageType);
    expect(types).toContain("privacy");
    expect(types).toContain("404");
    expect(types).toContain("cookies");
  });

  it("applies the vertical's conservative schema type to service pages", () => {
    const service = plan.pages.find((p) => p.pageType === "service")!;
    expect(service.schema).toContain("MedicalBusiness");
    expect(service.schema).not.toContain("Physician");
  });

  it("records missing address and surfaces cautions", () => {
    expect(plan.missingInputs.some((m) => m.includes("address"))).toBe(true);
    expect(plan.contentCautions.length).toBeGreaterThan(0);
  });

  it("passes structural quality gates with no blocking errors", () => {
    const findings = validatePlan(plan, brief);
    expect(findings.filter((f) => f.level === "error")).toHaveLength(0);
  });

  it("has no duplicate routes", () => {
    const routes = plan.pages.map((p) => p.route);
    expect(new Set(routes).size).toBe(routes.length);
  });
});
