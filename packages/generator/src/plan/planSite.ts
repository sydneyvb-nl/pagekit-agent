import type { Brief } from "../brief/schema.js";
import type { Vertical } from "../vertical/schema.js";
import { slugify } from "../util/slugify.js";
import { BLUEPRINTS, getBlueprint, type Blueprint } from "./blueprints.js";

export interface InternalLink {
  to: string;
  anchor: string;
}

export interface PlannedPage {
  pageType: string;
  route: string;
  title: string;
  intent: string;
  targetKeyword: string | null;
  sections: string[];
  schema: string[];
  internalLinks: InternalLink[];
  minWords: number;
  /** Image slot names the content step is expected to fill. */
  imageSlots: string[];
  isUtility: boolean;
}

export interface SitePlan {
  business: string;
  verticalId: string;
  usedFallbackVertical: boolean;
  theme: string;
  language: string;
  pages: PlannedPage[];
  assumptions: string[];
  missingInputs: string[];
  contentCautions: string[];
}

export interface PlanInputs {
  brief: Brief;
  vertical: Vertical;
  usedFallbackVertical: boolean;
}

/**
 * Deterministically expand a validated brief + vertical into a full site plan.
 * No copy is written here — only structure, routes, schema, and link graph.
 */
export function planSite({ brief, vertical, usedFallbackVertical }: PlanInputs): SitePlan {
  const { business } = brief;
  const assumptions: string[] = [];
  const missingInputs: string[] = [];

  const pages: PlannedPage[] = [];

  // Resolve which page types to build. Service detail pages are expanded from
  // the brief's service list; the literal "service" marker in required_pages
  // (if present) is handled by that expansion, so drop it from the static set.
  const staticPageTypes = vertical.required_pages.filter((p) => p !== "service");

  // Always guarantee legal + utility pages even if a vertical omits them.
  ensure(staticPageTypes, "privacy");
  ensure(staticPageTypes, "404");
  if (brief.integrations.analytics !== "none" || brief.integrations.forms !== "none") {
    ensure(staticPageTypes, "cookies");
  }

  // Service detail pages first so other pages can link to them.
  const servicePages = business.services.map((service) =>
    buildServicePage(service, brief, vertical),
  );

  for (const pageType of staticPageTypes) {
    const blueprint = getBlueprint(pageType);
    if (!blueprint) {
      assumptions.push(
        `Vertical '${vertical.id}' lists page type '${pageType}', which has no blueprint yet. Page skipped.`,
      );
      continue;
    }
    pages.push(buildStaticPage(blueprint, brief, vertical, servicePages));
  }

  pages.push(...servicePages);

  // Internal-link graph (after all routes exist).
  linkPages(pages, servicePages);

  // Missing-input detection (safe-by-default: never invent).
  collectMissingInputs(brief, missingInputs, assumptions);

  return {
    business: business.name,
    verticalId: vertical.id,
    usedFallbackVertical,
    theme: vertical.recommended_theme,
    language: business.language,
    pages: dedupeByRoute(pages),
    assumptions,
    missingInputs,
    contentCautions: vertical.content_cautions,
  };
}

function buildServicePage(service: string, brief: Brief, vertical: Vertical): PlannedPage {
  const bp = BLUEPRINTS.service!;
  const slug = slugify(service);
  const route = bp.route.replace("{service_slug}", slug);
  return {
    pageType: "service",
    route,
    title: fillTitle(bp.titlePattern, brief, { service }),
    intent: bp.intent,
    targetKeyword: `${service.toLowerCase()} ${brief.business.city.toLowerCase()}`,
    sections: [...bp.requiredSections],
    schema: resolveSchema(bp, vertical),
    internalLinks: [],
    minWords: bp.minWords,
    imageSlots: ["hero", "process"],
    isUtility: false,
  };
}

function buildStaticPage(
  bp: Blueprint,
  brief: Brief,
  vertical: Vertical,
  _servicePages: PlannedPage[],
): PlannedPage {
  return {
    pageType: bp.pageType,
    route: bp.route,
    title: fillTitle(bp.titlePattern, brief, {}),
    intent: bp.intent,
    targetKeyword: keywordForPage(bp.pageType, brief),
    sections: [...bp.requiredSections],
    schema: resolveSchema(bp, vertical),
    internalLinks: [],
    minWords: bp.minWords,
    imageSlots: bp.pageType === "home" ? ["hero", "services"] : ["hero"],
    isUtility: bp.isUtility ?? false,
  };
}

function linkPages(pages: PlannedPage[], servicePages: PlannedPage[]): void {
  const byType = (t: string) => pages.find((p) => p.pageType === t);
  const home = byType("home");
  const services = byType("services");
  const contact = byType("contact") ?? byType("location");

  for (const page of pages) {
    if (page.isUtility) continue;
    const links: InternalLink[] = [];

    if (page.pageType === "home") {
      for (const sp of servicePages) links.push({ to: sp.route, anchor: titleToAnchor(sp.title) });
      if (contact) links.push({ to: contact.route, anchor: "Contact us" });
    } else if (page.pageType === "service") {
      if (services) links.push({ to: services.route, anchor: "All services" });
      const others = servicePages.filter((sp) => sp.route !== page.route).slice(0, 2);
      for (const sp of others) links.push({ to: sp.route, anchor: titleToAnchor(sp.title) });
      if (contact) links.push({ to: contact.route, anchor: "Book an appointment" });
    } else {
      if (home) links.push({ to: home.route, anchor: "Home" });
      if (services) links.push({ to: services.route, anchor: "Services" });
      if (contact && contact.route !== page.route)
        links.push({ to: contact.route, anchor: "Contact" });
    }

    page.internalLinks = links;
  }
}

function resolveSchema(bp: Blueprint, vertical: Vertical): string[] {
  return bp.schema.map((s) => s.replace("{localBusinessSchema}", vertical.schema_default));
}

function fillTitle(pattern: string, brief: Brief, extra: { service?: string }): string {
  return pattern
    .replace("{business_name}", brief.business.name)
    .replace("{city}", brief.business.city)
    .replace("{service}", extra.service ?? "");
}

function keywordForPage(pageType: string, brief: Brief): string | null {
  if (pageType === "home") {
    return brief.seo?.primary_keyword ?? `${brief.business.type} ${brief.business.city}`;
  }
  return null;
}

function collectMissingInputs(brief: Brief, missing: string[], assumptions: string[]): void {
  const c = brief.business.contact;
  if (!c.phone) missing.push("business.contact.phone — phone CTAs and ContactPoint omitted.");
  if (!c.email) missing.push("business.contact.email — email link omitted.");
  if (!c.address)
    missing.push("business.contact.address — LocalBusiness address/map left as TODO.");
  if (!c.booking_url && !c.phone && !c.email)
    missing.push("No contact route at all — contact page cannot offer a real CTA.");
  if (!brief.media?.logo_path)
    assumptions.push("No logo provided; header uses business name as text wordmark.");
  if (!brief.seo?.primary_keyword)
    assumptions.push(
      "No primary_keyword provided; derived a default keyword from business type + city.",
    );
}

function ensure(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

function dedupeByRoute(pages: PlannedPage[]): PlannedPage[] {
  const seen = new Set<string>();
  const out: PlannedPage[] = [];
  for (const p of pages) {
    if (seen.has(p.route)) continue;
    seen.add(p.route);
    out.push(p);
  }
  return out;
}

function titleToAnchor(title: string): string {
  return title.split("|")[0]!.trim();
}
