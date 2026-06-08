import type { Brief } from "../brief/schema.js";
import type { PlannedPage } from "../plan/planSite.js";
import type { JsonLdNode, SectionContent } from "../content/model.js";
import { absoluteUrl } from "../seo/buildSeo.js";

const CONTEXT = "https://schema.org";

/** schema.org types the plan emits that are NOT the local-business node. */
const NON_BUSINESS_TYPES = new Set([
  "WebSite",
  "Organization",
  "BreadcrumbList",
  "Service",
  "FAQPage",
  "ContactPoint",
]);

export interface BuildJsonLdInput {
  page: PlannedPage;
  sections: SectionContent[];
  brief: Brief;
  siteUrl: string | null;
  /** The service a detail page covers, else null. */
  serviceName: string | null;
}

/**
 * Build the JSON-LD nodes for one page from the schema types the planner
 * resolved (`page.schema`). Strictly safe-by-default: every property traces to
 * a brief field; nothing is invented. Absolute URLs and `@id` links appear only
 * when `seo.site_url` is known. Reviews/ratings/hours are never emitted.
 */
export function buildPageJsonLd(input: BuildJsonLdInput): JsonLdNode[] {
  const { page, sections, brief, siteUrl, serviceName } = input;
  const nodes: JsonLdNode[] = [];
  const businessType = page.schema.find((t) => !NON_BUSINESS_TYPES.has(t));

  for (const type of page.schema) {
    if (type === businessType) {
      nodes.push(localBusinessNode(type, brief, siteUrl));
    } else if (type === "WebSite") {
      nodes.push(websiteNode(brief, siteUrl));
    } else if (type === "Organization") {
      nodes.push(organizationNode(brief, siteUrl));
    } else if (type === "BreadcrumbList") {
      const crumb = breadcrumbNode(page, brief, siteUrl);
      if (crumb) nodes.push(crumb);
    } else if (type === "Service") {
      nodes.push(serviceNode(businessType, serviceName, brief, siteUrl));
    } else if (type === "FAQPage") {
      const faq = faqNode(sections);
      if (faq) nodes.push(faq);
    }
    // ContactPoint is nested inside the local-business node, not standalone.
  }

  return nodes;
}

function localBusinessNode(type: string, brief: Brief, siteUrl: string | null): JsonLdNode {
  const b = brief.business;
  const node: JsonLdNode = { "@context": CONTEXT, "@type": type, name: b.name };
  if (siteUrl) {
    node["@id"] = `${siteUrl.replace(/\/+$/, "")}/#business`;
    node.url = siteUrl;
  }
  node.description = b.short_description;
  if (b.contact.phone) node.telephone = b.contact.phone;
  if (b.contact.email) node.email = b.contact.email;
  if (b.contact.address) {
    node.address = { "@type": "PostalAddress", streetAddress: b.contact.address };
  }
  const areas = areaServed(brief);
  if (areas.length) node.areaServed = areas;
  const logo = logoUrl(brief, siteUrl);
  if (logo) node.logo = logo;
  return node;
}

function websiteNode(brief: Brief, siteUrl: string | null): JsonLdNode {
  const node: JsonLdNode = { "@context": CONTEXT, "@type": "WebSite", name: brief.business.name };
  if (siteUrl) node.url = siteUrl;
  node.inLanguage = brief.business.language;
  return node;
}

function organizationNode(brief: Brief, siteUrl: string | null): JsonLdNode {
  const node: JsonLdNode = {
    "@context": CONTEXT,
    "@type": "Organization",
    name: brief.business.name,
  };
  if (siteUrl) node.url = siteUrl;
  const logo = logoUrl(brief, siteUrl);
  if (logo) node.logo = logo;
  return node;
}

function breadcrumbNode(page: PlannedPage, brief: Brief, siteUrl: string | null): JsonLdNode | null {
  const segments = page.route.split("/").filter(Boolean);
  const items: JsonLdNode[] = [
    { "@type": "ListItem", position: 1, name: "Home", item: crumbUrl(siteUrl, "/") },
  ];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const name = i === segments.length - 1 ? stripSuffix(page.title) : humanize(seg);
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name,
      item: crumbUrl(siteUrl, `${acc}/`),
    });
  });
  // A single-item breadcrumb (the home page) adds nothing.
  if (items.length < 2) return null;
  return { "@context": CONTEXT, "@type": "BreadcrumbList", itemListElement: items };
}

function serviceNode(
  businessType: string | undefined,
  serviceName: string | null,
  brief: Brief,
  siteUrl: string | null,
): JsonLdNode {
  const node: JsonLdNode = {
    "@context": CONTEXT,
    "@type": "Service",
    name: serviceName ?? "Service",
    serviceType: serviceName ?? undefined,
    provider: {
      "@type": businessType ?? "LocalBusiness",
      name: brief.business.name,
      ...(siteUrl ? { url: siteUrl } : {}),
    },
  };
  const areas = areaServed(brief);
  if (areas.length) node.areaServed = areas;
  return prune(node);
}

function faqNode(sections: SectionContent[]): JsonLdNode | null {
  const faqSections = sections.filter((s) => s.section.split(".")[0]!.startsWith("faq"));
  const entries: JsonLdNode[] = [];
  for (const s of faqSections) {
    for (const item of s.items) {
      // Only publish answered questions — never structured-mark a placeholder.
      if (item.body.source === "placeholder") continue;
      entries.push({
        "@type": "Question",
        name: item.title.value,
        acceptedAnswer: { "@type": "Answer", text: item.body.value },
      });
    }
  }
  if (!entries.length) return null;
  return { "@context": CONTEXT, "@type": "FAQPage", mainEntity: entries };
}

/* ---------- helpers ---------- */

function areaServed(brief: Brief): string[] {
  const out = [brief.business.city, ...(brief.seo?.target_locations ?? [])];
  return [...new Set(out.map((s) => s.trim()).filter(Boolean))];
}

function logoUrl(brief: Brief, siteUrl: string | null): string | null {
  const logo = brief.media?.logo_path;
  if (!logo) return null;
  if (/^https?:\/\//i.test(logo)) return logo;
  if (siteUrl) return absoluteUrl(siteUrl, logo.startsWith("/") ? logo : `/${logo}`);
  return null; // a bare local path is not a valid absolute logo URL — omit it.
}

function crumbUrl(siteUrl: string | null, route: string): string {
  return siteUrl ? absoluteUrl(siteUrl, route) : route;
}

function humanize(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripSuffix(title: string): string {
  return title.split("|")[0]!.trim();
}

/** Drop keys whose value is undefined (keeps emitted JSON-LD tidy). */
function prune(node: JsonLdNode): JsonLdNode {
  for (const k of Object.keys(node)) if (node[k] === undefined) delete node[k];
  return node;
}
