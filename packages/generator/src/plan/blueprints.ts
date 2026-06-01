/**
 * Page-type blueprints.
 *
 * These are the deterministic structural contracts for each page type: which
 * sections are required, which schema.org types apply, the SEO title pattern,
 * and minimum content depth. Copy is creative; this structure is not.
 *
 * Patterns use `{business_name}`, `{city}`, `{service}` placeholders that the
 * planner fills in. `{localBusinessSchema}` is replaced with the vertical's
 * conservative default schema type at plan time.
 */

export interface Blueprint {
  pageType: string;
  /** Route with optional `{service_slug}` placeholder. */
  route: string;
  intent: string;
  requiredSections: string[];
  schema: string[];
  titlePattern: string;
  metaDescriptionMaxChars: number;
  minWords: number;
  /** Legal/utility pages are exempt from the internal-link minimum. */
  isUtility?: boolean;
}

export const BLUEPRINTS: Record<string, Blueprint> = {
  home: {
    pageType: "home",
    route: "/",
    intent: "Introduce the business, build trust, drive the primary action.",
    requiredSections: [
      "hero.local-service",
      "trust-bar",
      "services-grid",
      "process-steps",
      "testimonials",
      "faq-preview",
      "final-cta",
    ],
    schema: ["{localBusinessSchema}", "WebSite", "Organization"],
    titlePattern: "{business_name} | {city}",
    metaDescriptionMaxChars: 155,
    minWords: 400,
  },
  services: {
    pageType: "services",
    route: "/diensten/",
    intent: "Give an overview of all services and route to detail pages.",
    requiredSections: ["hero.service", "services-grid", "final-cta"],
    schema: ["{localBusinessSchema}", "BreadcrumbList"],
    titlePattern: "Diensten | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 300,
  },
  service: {
    pageType: "service",
    route: "/diensten/{service_slug}/",
    intent:
      "Explain one service: what it is, who it is for, how it works, what to expect, next step.",
    requiredSections: [
      "hero.service",
      "service-summary",
      "benefits",
      "process-steps",
      "faq.service",
      "related-services",
      "final-cta",
    ],
    schema: ["Service", "{localBusinessSchema}", "BreadcrumbList"],
    titlePattern: "{service} in {city} | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 700,
  },
  about: {
    pageType: "about",
    route: "/over-ons/",
    intent: "Explain who the business is and why to trust them.",
    requiredSections: ["hero.local-service", "rich-text", "trust-bar", "final-cta"],
    schema: ["{localBusinessSchema}", "BreadcrumbList"],
    titlePattern: "Over ons | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 300,
  },
  team: {
    pageType: "team",
    route: "/team/",
    intent: "Introduce the people; humanise the business.",
    requiredSections: ["hero.local-service", "rich-text", "final-cta"],
    schema: ["{localBusinessSchema}", "BreadcrumbList"],
    titlePattern: "Team | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 200,
  },
  location: {
    pageType: "location",
    route: "/locatie/",
    intent: "Help visitors find and reach the business; reinforce local SEO.",
    requiredSections: ["hero.location", "location-map", "service-area", "contact-card"],
    schema: ["{localBusinessSchema}", "BreadcrumbList"],
    titlePattern: "Locatie & route | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 200,
  },
  contact: {
    pageType: "contact",
    route: "/contact/",
    intent: "Convert intent into a contact request or booking.",
    requiredSections: ["hero.local-service", "contact-card", "appointment-cta"],
    schema: ["{localBusinessSchema}", "ContactPoint", "BreadcrumbList"],
    titlePattern: "Contact | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 150,
  },
  faq: {
    pageType: "faq",
    route: "/veelgestelde-vragen/",
    intent: "Answer common questions; reduce friction; capture long-tail SEO.",
    requiredSections: ["hero.local-service", "faq", "final-cta"],
    schema: ["FAQPage", "BreadcrumbList"],
    titlePattern: "Veelgestelde vragen | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 250,
  },
  "blog-index": {
    pageType: "blog-index",
    route: "/blog/",
    intent: "List articles; establish topical authority.",
    requiredSections: ["hero.article", "rich-text"],
    schema: ["BreadcrumbList"],
    titlePattern: "Blog | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 100,
  },
  privacy: {
    pageType: "privacy",
    route: "/privacy/",
    intent: "Legally required privacy statement.",
    requiredSections: ["rich-text"],
    schema: ["BreadcrumbList"],
    titlePattern: "Privacyverklaring | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 100,
    isUtility: true,
  },
  cookies: {
    pageType: "cookies",
    route: "/cookies/",
    intent: "Cookie policy where analytics/forms set cookies.",
    requiredSections: ["rich-text"],
    schema: ["BreadcrumbList"],
    titlePattern: "Cookiebeleid | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 80,
    isUtility: true,
  },
  terms: {
    pageType: "terms",
    route: "/voorwaarden/",
    intent: "Terms / disclaimer where relevant.",
    requiredSections: ["rich-text"],
    schema: ["BreadcrumbList"],
    titlePattern: "Voorwaarden | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 80,
    isUtility: true,
  },
  "404": {
    pageType: "404",
    route: "/404/",
    intent: "Friendly not-found page that routes back to key pages.",
    requiredSections: ["rich-text", "final-cta"],
    schema: [],
    titlePattern: "Pagina niet gevonden | {business_name}",
    metaDescriptionMaxChars: 155,
    minWords: 30,
    isUtility: true,
  },
};

export function getBlueprint(pageType: string): Blueprint | undefined {
  return BLUEPRINTS[pageType];
}
