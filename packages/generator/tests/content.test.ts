import { describe, expect, it } from "vitest";
import { planSite } from "../src/plan/planSite.js";
import { generateContent } from "../src/content/generateContent.js";
import { validateContent } from "../src/content/validateContent.js";
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
    short_description: "Warme verloskundige zorg in Den Haag.",
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

const plan = planSite({ brief, vertical, usedFallbackVertical: false });
const content = generateContent(plan, brief, { mode: "placeholder" });

describe("generateContent (placeholder mode)", () => {
  it("produces content for every planned page", () => {
    expect(content.pages.map((p) => p.route).sort()).toEqual(
      plan.pages.map((p) => p.route).sort(),
    );
  });

  it("covers every planned section of each page", () => {
    for (const planned of plan.pages) {
      const page = content.pages.find((p) => p.route === planned.route)!;
      const sections = page.sections.map((s) => s.section);
      expect(sections).toEqual(planned.sections);
    }
  });

  it("never invents testimonials — leaves them as a TODO", () => {
    const home = content.pages.find((p) => p.pageType === "home")!;
    const testimonials = home.sections.find((s) => s.section === "testimonials")!;
    expect(testimonials.items).toHaveLength(0);
    expect(testimonials.todos.join(" ")).toMatch(/never be invented/i);
  });

  it("uses the booking URL from the brief as the primary CTA", () => {
    const home = content.pages.find((p) => p.pageType === "home")!;
    const cta = home.sections.find((s) => s.cta)!.cta!;
    expect(cta.href).toBe("https://example.com/inschrijven");
  });

  it("derives the service name for each detail page from the brief", () => {
    const echo = content.pages.find((p) => p.route === "/diensten/echo-s/")!;
    const hero = echo.sections.find((s) => s.section.startsWith("hero"))!;
    expect(hero.heading?.value).toContain("Echo's");
  });

  it("records a TODO for the missing address on the contact card", () => {
    const contact = content.pages.find((p) => p.pageType === "contact")!;
    const card = contact.sections.find((s) => s.section === "contact-card")!;
    expect(card.todos.some((t) => /address/i.test(t))).toBe(true);
  });

  it("keeps meta descriptions within ~155 chars", () => {
    for (const page of content.pages) {
      expect(page.metaDescription.value.length).toBeLessThanOrEqual(156);
    }
  });

  it("rolls up site-wide TODOs without duplicates", () => {
    expect(content.todos.length).toBe(new Set(content.todos).size);
    expect(content.todos.length).toBeGreaterThan(0);
  });
});

describe("validateContent", () => {
  const findings = validateContent(content, plan);

  it("reports no blocking errors for a well-formed plan", () => {
    expect(findings.filter((f) => f.level === "error")).toHaveLength(0);
  });

  it("warns about the open TODOs (placeholder mode is expected to)", () => {
    expect(findings.some((f) => f.level === "warning" && /TODO/.test(f.message))).toBe(true);
  });

  it("flags a page whose content is missing a planned section", () => {
    const broken = structuredClone(content);
    broken.pages[0]!.sections.shift();
    const errs = validateContent(broken, plan).filter((f) => f.level === "error");
    expect(errs.some((e) => /missing planned section/.test(e.message))).toBe(true);
  });
});
