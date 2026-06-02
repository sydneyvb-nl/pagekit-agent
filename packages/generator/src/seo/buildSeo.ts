import type { Brief } from "../brief/schema.js";
import type { PlannedPage } from "../plan/planSite.js";
import type { OpenGraph, PageSeo } from "../content/model.js";

/**
 * Deterministic per-page SEO metadata. Like the rest of the system it invents
 * nothing: titles and descriptions come from the plan/content, URLs are only
 * absolute when the brief supplies `seo.site_url`, and robots directives follow
 * a fixed rule (only the 404 page is excluded from indexing).
 */
export function buildPageSeo(
  page: PlannedPage,
  metaDescription: string,
  brief: Brief,
  siteUrl: string | null,
): PageSeo {
  const canonicalAbsolute = siteUrl != null;
  const canonical = siteUrl ? absoluteUrl(siteUrl, page.route) : page.route;

  const robots = page.pageType === "404" ? "noindex, follow" : "index, follow";

  const openGraph: OpenGraph = {
    title: page.title,
    description: metaDescription,
    type: page.pageType === "home" ? "website" : "article",
    url: canonicalAbsolute ? canonical : null,
    siteName: brief.business.name,
    locale: toOgLocale(brief.business.language),
  };

  return { canonical, canonicalAbsolute, robots, openGraph };
}

/** Join an origin and an absolute path into one clean URL. */
export function absoluteUrl(siteUrl: string, route: string): string {
  const origin = siteUrl.replace(/\/+$/, "");
  const path = route.startsWith("/") ? route : `/${route}`;
  return `${origin}${path}`;
}

/**
 * Map a BCP-47 / ISO language code to an Open Graph locale (`nl` → `nl_NL`).
 * Falls back to the bare language when no region default is known — never a
 * fabricated region.
 */
function toOgLocale(language: string): string {
  const lang = language.trim().toLowerCase();
  if (lang.includes("_") || lang.includes("-")) return lang.replace("-", "_");
  const REGION: Record<string, string> = {
    nl: "nl_NL",
    en: "en_US",
    de: "de_DE",
    fr: "fr_FR",
    es: "es_ES",
    it: "it_IT",
  };
  return REGION[lang] ?? lang;
}
