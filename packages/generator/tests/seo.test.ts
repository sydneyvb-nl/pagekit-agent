import { describe, expect, it } from "vitest";
import { planSite } from "../src/plan/planSite.js";
import { generateContent } from "../src/content/generateContent.js";
import { validateSeo } from "../src/seo/validateSeo.js";
import type { Brief } from "../src/brief/schema.js";
import type { Vertical } from "../src/vertical/schema.js";

function brief(siteUrl?: string): Brief {
  return {
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
        address: "Voorbeeldstraat 1, Den Haag",
        booking_url: "https://example.com/inschrijven",
      },
      brand: { voice: "warm" },
      compliance: { regulated_industry: true, medical_or_legal_claims_allowed: false },
    },
    seo: siteUrl ? { site_url: siteUrl, target_locations: ["Den Haag", "Rijswijk"] } : undefined,
    integrations: { analytics: "plausible", forms: "formspree", cms: "local-mdx" },
  };
}

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

function build(siteUrl?: string) {
  const b = brief(siteUrl);
  const plan = planSite({ brief: b, vertical, usedFallbackVertical: false });
  return generateContent(plan, b, { mode: "placeholder" });
}

describe("SEO metadata", () => {
  it("emits absolute canonical + og:url when site_url is set", () => {
    const content = build("https://praktijk.nl");
    const home = content.pages.find((p) => p.pageType === "home")!;
    expect(home.seo.canonical).toBe("https://praktijk.nl/");
    expect(home.seo.canonicalAbsolute).toBe(true);
    expect(home.seo.openGraph.url).toBe("https://praktijk.nl/");
    expect(home.seo.openGraph.locale).toBe("nl_NL");
  });

  it("falls back to a relative canonical and no og:url without site_url", () => {
    const content = build();
    const service = content.pages.find((p) => p.route === "/diensten/echo-s/")!;
    expect(service.seo.canonical).toBe("/diensten/echo-s/");
    expect(service.seo.canonicalAbsolute).toBe(false);
    expect(service.seo.openGraph.url).toBeNull();
  });

  it("marks only the 404 page noindex", () => {
    const content = build("https://praktijk.nl");
    const notFound = content.pages.find((p) => p.pageType === "404")!;
    const home = content.pages.find((p) => p.pageType === "home")!;
    expect(notFound.seo.robots).toMatch(/noindex/);
    expect(home.seo.robots).toBe("index, follow");
  });
});

describe("JSON-LD", () => {
  const content = build("https://praktijk.nl");

  it("builds a conservative LocalBusiness node from brief facts only", () => {
    const home = content.pages.find((p) => p.pageType === "home")!;
    const business = home.jsonLd.find((n) => n["@type"] === "MedicalBusiness")!;
    expect(business.name).toBe("Verloskundigenpraktijk Example");
    expect(business.telephone).toBe("+31 70 000 0000");
    expect(business.areaServed).toEqual(["Den Haag", "Rijswijk"]);
    // Never invents reviews/ratings/hours.
    expect(business.aggregateRating).toBeUndefined();
    expect(business.openingHours).toBeUndefined();
  });

  it("emits WebSite + Organization on the home page", () => {
    const home = content.pages.find((p) => p.pageType === "home")!;
    const types = home.jsonLd.map((n) => n["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("Organization");
  });

  it("emits a Service node with provider on a service page", () => {
    const service = content.pages.find((p) => p.route === "/diensten/echo-s/")!;
    const node = service.jsonLd.find((n) => n["@type"] === "Service")!;
    expect(node.name).toBe("Echo's");
    expect((node.provider as Record<string, unknown>).name).toBe("Verloskundigenpraktijk Example");
  });

  it("builds a BreadcrumbList with absolute item URLs", () => {
    const service = content.pages.find((p) => p.route === "/diensten/echo-s/")!;
    const crumb = service.jsonLd.find((n) => n["@type"] === "BreadcrumbList")!;
    const items = crumb.itemListElement as Array<Record<string, unknown>>;
    expect(items[0]!.item).toBe("https://praktijk.nl/");
    expect(items[items.length - 1]!.item).toBe("https://praktijk.nl/diensten/echo-s/");
  });

  it("emits a FAQPage only for answered questions, skipping placeholders", () => {
    const faq = content.pages.find((p) => p.pageType === "faq")!;
    const node = faq.jsonLd.find((n) => n["@type"] === "FAQPage")!;
    const entries = node.mainEntity as Array<Record<string, unknown>>;
    // One generated answer (region) is published; the placeholder answer is not.
    expect(entries).toHaveLength(1);
    const answer = (entries[0]!.acceptedAnswer as Record<string, unknown>).text as string;
    expect(answer).not.toMatch(/TODO/);
  });
});

describe("validateSeo", () => {
  it("passes with no errors and warns when site_url is absent", () => {
    const findings = validateSeo(build());
    expect(findings.filter((f) => f.level === "error")).toHaveLength(0);
    expect(findings.some((f) => /site_url/.test(f.message))).toBe(true);
  });

  it("has no site_url warning once an origin is provided", () => {
    const findings = validateSeo(build("https://praktijk.nl"));
    expect(findings.filter((f) => f.level === "error")).toHaveLength(0);
    expect(findings.some((f) => /No seo.site_url/.test(f.message))).toBe(false);
  });
});
