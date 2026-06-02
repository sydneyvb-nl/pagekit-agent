/**
 * Typed content model.
 *
 * The planner (`planSite`) decides *structure* — which pages exist, which
 * sections each page contains, the schema types, the link graph. This module
 * defines the *content* contract: the shape an agent (or the placeholder
 * generator) fills for each section so a page can be rendered end-to-end.
 *
 * Two invariants carry over from the rest of the system:
 *
 * 1. **No silent magic.** Every fact that is missing from the brief becomes an
 *    explicit `TODO:` marker, surfaced both inline (in {@link ContentField})
 *    and aggregated on the page and site (`todos`).
 * 2. **Never invent.** Sections that would otherwise require credentials,
 *    testimonials, prices, hours, or team members are emitted *empty* with a
 *    TODO rather than filled with a plausible-sounding invention.
 */

/** How a piece of content was produced. */
export type ContentSource =
  /** A fact taken verbatim/derived from the brief — safe to publish. */
  | "brief"
  /** Deterministic, fact-free copy (structural headings, generic guidance). */
  | "generated"
  /** A gap left for a human/agent to fill; always paired with a `todo`. */
  | "placeholder";

/** A single resolved string plus where it came from. */
export interface ContentField {
  value: string;
  source: ContentSource;
}

/** A repeated content unit: a service card, a process step, a FAQ entry. */
export interface ContentItem {
  title: ContentField;
  body: ContentField;
  /** Optional link target (e.g. a service card pointing at its detail page). */
  href?: string;
}

/** Resolved content for one section slot of a planned page. */
export interface SectionContent {
  /** Matches the section id from `PlannedPage.sections` (e.g. `hero.service`). */
  section: string;
  heading: ContentField | null;
  /** Body paragraphs, in order. May be empty for list-only sections. */
  body: ContentField[];
  /** Repeated units (cards, steps, Q&A). May be empty. */
  items: ContentItem[];
  /** Primary call-to-action, when the section type carries one. */
  cta: { label: string; href: string } | null;
  /** TODO markers for facts this section needs but the brief did not supply. */
  todos: string[];
}

/** Open Graph / social metadata for one page. */
export interface OpenGraph {
  title: string;
  description: string;
  type: string;
  url: string | null;
  siteName: string;
  locale: string;
}

/** Per-page SEO metadata, ready for the renderer's `<head>`. */
export interface PageSeo {
  /** Absolute when `seo.site_url` is known, else the page route (relative). */
  canonical: string;
  /** Whether the canonical is absolute (drives OG/sitemap inclusion). */
  canonicalAbsolute: boolean;
  robots: string;
  openGraph: OpenGraph;
}

/** A schema.org node, emitted verbatim as a JSON-LD `<script>`. */
export type JsonLdNode = Record<string, unknown>;

/** Resolved content for one page. */
export interface PageContent {
  route: string;
  pageType: string;
  title: string;
  metaDescription: ContentField;
  seo: PageSeo;
  jsonLd: JsonLdNode[];
  sections: SectionContent[];
  /** Approximate word count across all resolved copy on the page. */
  wordCount: number;
  /** Minimum words the blueprint targets for this page type. */
  minWords: number;
  /** Aggregated TODOs from every section plus page-level gaps. */
  todos: string[];
}

export type ContentMode = "placeholder";

/** Resolved content for the whole site. */
export interface SiteContent {
  business: string;
  language: string;
  mode: ContentMode;
  /** Canonical site origin from `seo.site_url`, or null when not provided. */
  siteUrl: string | null;
  pages: PageContent[];
  /** Every TODO across the site, de-duplicated, for `missing-inputs` rollup. */
  todos: string[];
}

/** Count words in a stretch of copy the same way everywhere. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function brief(value: string): ContentField {
  return { value, source: "brief" };
}

export function generated(value: string): ContentField {
  return { value, source: "generated" };
}

export function placeholder(value: string): ContentField {
  return { value, source: "placeholder" };
}
